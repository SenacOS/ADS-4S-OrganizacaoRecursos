package br.senac.recursos.reserva.api;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.senac.recursos.reserva.aplicacao.ConsultarFilaAprovacao;
import br.senac.recursos.reserva.aplicacao.FiltroFilaAprovacao;
import br.senac.recursos.reserva.aplicacao.ReservaFilaPort;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.ReservaNaoEncontradaException;
import br.senac.recursos.reserva.infraestrutura.ReservaConsultaMysql;
import br.senac.recursos.seguranca.SecurityConfig;
import br.senac.recursos.seguranca.SpringSecurityAtorProvider;
import br.senac.recursos.seguranca.UsuarioPrincipal;
import br.senac.recursos.shared.Pagina;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/** HTTP real + Spring Security: Q9 nunca confia em usuário ou papel vindo do cliente. */
@WebMvcTest(controllers = ReservaLeituraController.class,
        properties = "reservas.api.enabled=true")
@Import({SecurityConfig.class, SpringSecurityAtorProvider.class, ConsultarFilaAprovacao.class})
class ReservaLeituraSegurancaTest {
    @Autowired MockMvc mvc;
    @MockitoBean ReservaConsultaMysql consultas;
    @MockitoBean ReservaFilaPort fila;

    private static UsuarioPrincipal usuario(long id, PapelAtor papel) {
        return new UsuarioPrincipal(id, "usuario" + id + "@teste.local", "hash", papel, true);
    }

    @Test
    void consultaSemSessaoRecebe401() throws Exception {
        mvc.perform(get("/api/reservas")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NAO_AUTENTICADO"));
        mvc.perform(get("/api/reservas/101")).andExpect(status().isUnauthorized());
        verifyNoInteractions(consultas, fila);
    }

    @Test
    void sessaoDefineAtorMesmoComIdForjadoNaUrl() throws Exception {
        var filtro = new FiltroFilaAprovacao(null, null, 0, 20);
        when(fila.buscarFila(filtro, 31L)).thenReturn(new Pagina<>(List.of(), 0, 20, 0));
        mvc.perform(get("/api/reservas?status=SOLICITADA&usuarioId=99&papel=ADMINISTRADOR")
                    .with(user(usuario(31, PapelAtor.RESPONSAVEL))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0));
        verify(fila).buscarFila(filtro, 31L);
        verifyNoInteractions(consultas);
    }

    @Test
    void solicitanteComStatusSolicitadaUsaAListagemGeral() throws Exception {
        var ator = new AtorReserva(1, PapelAtor.SOLICITANTE);
        when(consultas.listar(ator, "SOLICITADA", null, null, null, 0, 20))
                .thenReturn(new Pagina<>(List.of(), 0, 20, 0));

        mvc.perform(get("/api/reservas?status=SOLICITADA").with(user(usuario(1, PapelAtor.SOLICITANTE))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0));
        verifyNoInteractions(fila);
    }

    @Test
    void detalheForaDoEscopoE404Generico() throws Exception {
        var ator = new AtorReserva(1, PapelAtor.SOLICITANTE);
        when(consultas.detalhe(102L, ator)).thenThrow(new ReservaNaoEncontradaException(102));
        mvc.perform(get("/api/reservas/102").with(user(usuario(1, PapelAtor.SOLICITANTE))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("NAO_ENCONTRADO"));
    }

    @Test
    void parametrosDeFilaInvalidosRecebem400() throws Exception {
        mvc.perform(get("/api/reservas?status=SOLICITADA&tamanho=101")
                    .with(user(usuario(31, PapelAtor.RESPONSAVEL))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("REQUISICAO_INVALIDA"));
        verifyNoInteractions(consultas, fila);
    }
}
