package br.senac.recursos.reserva.api;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.senac.recursos.reserva.aplicacao.ConsultarFilaAprovacao;
import br.senac.recursos.reserva.aplicacao.ConsultarRelatorioUtilizacao;
import br.senac.recursos.reserva.aplicacao.ReservaRelatorioPort;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.reserva.dominio.UtilizacaoReservas;
import br.senac.recursos.reserva.infraestrutura.ReservaConsultaMysql;
import br.senac.recursos.seguranca.SecurityConfig;
import br.senac.recursos.seguranca.SpringSecurityAtorProvider;
import br.senac.recursos.seguranca.UsuarioPrincipal;
import java.time.Instant;
import java.util.EnumSet;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/** HTTP real + Spring Security para o RF12: ator só da sessão, filtros validados, erros no envelope. */
@WebMvcTest(controllers = {RelatorioUtilizacaoController.class, ReservaLeituraController.class},
        properties = "reservas.api.enabled=true")
@Import({SecurityConfig.class, SpringSecurityAtorProvider.class, ConsultarRelatorioUtilizacao.class})
class RelatorioUtilizacaoControllerTest {

    private static final String ROTA = "/api/reservas/relatorio-utilizacao";
    private static final String PERIODO = "?inicio=2026-11-01T00:00:00-03:00&fim=2026-12-01T00:00:00-03:00";
    private static final IntervaloReserva INTERVALO = new IntervaloReserva(
            Instant.parse("2026-11-01T03:00:00Z"), Instant.parse("2026-12-01T03:00:00Z"));

    @Autowired MockMvc mvc;
    @MockitoBean ReservaRelatorioPort porta;
    @MockitoBean ReservaConsultaMysql consultas;
    @MockitoBean ConsultarFilaAprovacao fila;

    private static UsuarioPrincipal usuario(long id, PapelAtor papel) {
        return new UsuarioPrincipal(id, "usuario" + id + "@teste.local", "hash", papel, true);
    }

    @Test
    void semSessaoRecebe401() throws Exception {
        mvc.perform(get(ROTA + PERIODO)).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NAO_AUTENTICADO"));
        verifyNoInteractions(porta);
    }

    @Test
    void solicitanteEResponsavelRecebem403SemConsultarOBanco() throws Exception {
        for (var papel : new PapelAtor[] {PapelAtor.SOLICITANTE, PapelAtor.RESPONSAVEL}) {
            mvc.perform(get(ROTA + PERIODO).with(user(usuario(5, papel))))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.codigo").value("OPERACAO_NAO_PERMITIDA"));
        }
        verifyNoInteractions(porta);
    }

    @Test
    void papelForjadoNaUrlNaoEleva() throws Exception {
        mvc.perform(get(ROTA + PERIODO + "&papel=ADMINISTRADOR&usuarioId=1")
                    .with(user(usuario(5, PapelAtor.SOLICITANTE))))
                .andExpect(status().isForbidden());
        verifyNoInteractions(porta);
    }

    @Test
    void administradorSemFiltrosOpcionaisUsaEstadosPadrao() throws Exception {
        mvc.perform(get(ROTA + PERIODO).with(user(usuario(1, PapelAtor.ADMINISTRADOR))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.minutosReservados").value(0))
                .andExpect(jsonPath("$.reservasConsideradas").value(0))
                .andExpect(jsonPath("$.estados",
                        containsInAnyOrder("APROVADA", "EM_USO", "CONCLUIDA")))
                .andExpect(jsonPath("$.conflitosEvitados").isEmpty());
        verify(porta).buscarReservas(INTERVALO, UtilizacaoReservas.ESTADOS_PADRAO, null);
        verify(porta).buscarConflitosEvitados(INTERVALO, null);
    }

    @Test
    void estadosERecursoSaoRepassadosAoCasoDeUso() throws Exception {
        mvc.perform(get(ROTA + PERIODO + "&estados=CONCLUIDA,APROVADA&recursoId=7")
                    .with(user(usuario(1, PapelAtor.ADMINISTRADOR))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recursoId").value(7))
                .andExpect(jsonPath("$.estados", containsInAnyOrder("APROVADA", "CONCLUIDA")));
        verify(porta).buscarReservas(INTERVALO,
                EnumSet.of(StatusReserva.APROVADA, StatusReserva.CONCLUIDA), 7L);
        verify(porta).buscarConflitosEvitados(INTERVALO, 7L);
    }

    @Test
    void rotaLiteralNaoCaiNoDetalhePorId() throws Exception {
        mvc.perform(get(ROTA + PERIODO).with(user(usuario(1, PapelAtor.ADMINISTRADOR))))
                .andExpect(status().isOk());
        verifyNoInteractions(consultas, fila);
    }

    @Test
    void parametrosInvalidosRecebem400NoEnvelopePadrao() throws Exception {
        var admin = user(usuario(1, PapelAtor.ADMINISTRADOR));
        String[] invalidos = {
                "",                                                          // sem período
                "?inicio=2026-11-01T00:00:00-03:00",                         // sem fim
                "?fim=2026-12-01T00:00:00-03:00",                            // sem início
                "?inicio=2026-12-01T00:00:00-03:00&fim=2026-11-01T00:00:00-03:00", // fim <= início
                "?inicio=2026-11-01T00:00:00&fim=2026-12-01T00:00:00",       // sem offset
                "?inicio=ontem&fim=hoje",                                    // não é ISO-8601
                PERIODO + "&estados=INEXISTENTE",
                PERIODO + "&estados=aprovada",                               // nome exato do enum
                PERIODO + "&recursoId=0",
                PERIODO + "&recursoId=abc"
        };
        for (String consulta : invalidos) {
            mvc.perform(get(ROTA + consulta).with(admin))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.codigo").value("REQUISICAO_INVALIDA"));
        }
        verifyNoInteractions(porta);
    }
}
