package br.senac.recursos.seguranca;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.senac.recursos.reserva.api.ReservaController;
import br.senac.recursos.reserva.aplicacao.ReservaService;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * CT14/CT18/IDOR: filtros Spring Security reais, ator real do SecurityContext,
 * logica de ownership real do dominio; so a persistencia fica mockada.
 */
@WebMvcTest(controllers = ReservaController.class, properties = "reservas.api.enabled=true")
@Import({SecurityConfig.class, SpringSecurityAtorProvider.class})
class SegurancaComplementarTest {
    private static final String CORPO = """
            {"inicio":"2026-11-10T13:00:00-03:00","fim":"2026-11-10T14:00:00-03:00",
             "recursosIds":[101],"solicitanteId":999,"papel":"ADMINISTRADOR"}""";
    private static final Reserva RESERVA = Reserva.solicitar(
            7, new IntervaloReserva(
                    Instant.parse("2026-11-10T16:00:00Z"),
                    Instant.parse("2026-11-10T17:00:00Z")),
            List.of(101L), false).comId(55L).aprovarAutomaticamente();

    @Autowired MockMvc mvc;
    @MockitoBean ReservaService servico;

    private static UsuarioPrincipal usuario(long id, PapelAtor perfil) {
        return new UsuarioPrincipal(id, "pessoa" + id + "@teste.local", "hash-nao-exposto", perfil, true);
    }

    @Test
    void apiSemSessaoRetorna401ComErroPadrao() throws Exception {
        mvc.perform(get("/api/reservas/55"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NAO_AUTENTICADO"))
                .andExpect(jsonPath("$.correlationId").isNotEmpty());
        verifyNoInteractions(servico);
    }

    @Test
    void alteracoesSemCsrfRetornam403AntesDoServico() throws Exception {
        var principal = usuario(7, PapelAtor.SOLICITANTE);
        mvc.perform(post("/api/reservas").with(user(principal))
                .contentType(MediaType.APPLICATION_JSON).content(CORPO))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/reservas/55").with(user(principal))
                .contentType(MediaType.APPLICATION_JSON).content(CORPO))
                .andExpect(status().isForbidden());
        verifyNoInteractions(servico);
    }

    @Test
    void corpoNaoPodeForjarAtorNemPerfil() throws Exception {
        when(servico.criar(any(), any())).thenReturn(RESERVA);
        mvc.perform(post("/api/reservas").with(user(usuario(7, PapelAtor.SOLICITANTE)))
                .with(csrf()).contentType(MediaType.APPLICATION_JSON).content(CORPO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.solicitanteId").value(7));
        verify(servico).criar(any(), eq(new AtorReserva(7, PapelAtor.SOLICITANTE)));
    }

    @Test
    void somenteResponsavelPassaNaAutorizacaoDeAprovacao() throws Exception {
        for (PapelAtor perfil : List.of(PapelAtor.SOLICITANTE, PapelAtor.ADMINISTRADOR)) {
            mvc.perform(post("/api/reservas/55/aprovacao")
                    .with(user(usuario(99, perfil))).with(csrf()))
                    .andExpect(status().isForbidden());
        }
        verifyNoInteractions(servico);

        when(servico.aprovar(eq(55L), eq(new AtorReserva(2, PapelAtor.RESPONSAVEL))))
                .thenReturn(RESERVA);
        mvc.perform(post("/api/reservas/55/aprovacao")
                .with(user(usuario(2, PapelAtor.RESPONSAVEL))).with(csrf()))
                .andExpect(status().isOk());
        verify(servico).aprovar(55L, new AtorReserva(2, PapelAtor.RESPONSAVEL));
    }

    @Test
    void idorNaoPermiteCancelarReservaDeOutroSolicitante() throws Exception {
        doAnswer(inv -> RESERVA.cancelar(inv.getArgument(1), inv.getArgument(2)))
                .when(servico).cancelar(eq(55L), any(), any());

        mvc.perform(post("/api/reservas/55/cancelamento")
                .with(user(usuario(99, PapelAtor.SOLICITANTE))).with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("OPERACAO_NAO_PERMITIDA"));
        mvc.perform(post("/api/reservas/55/cancelamento")
                .with(user(usuario(7, PapelAtor.SOLICITANTE))).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADA"));
    }

    @Test
    void administradorPodeCancelarMasNaoAprovar() throws Exception {
        doAnswer(inv -> RESERVA.cancelar(inv.getArgument(1), inv.getArgument(2)))
                .when(servico).cancelar(eq(55L), any(), any());

        // Q5: Administrador cancelando reserva de terceiro precisa da justificativa
        mvc.perform(post("/api/reservas/55/cancelamento")
                .with(user(usuario(1, PapelAtor.ADMINISTRADOR))).with(csrf()))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/reservas/55/cancelamento")
                .with(user(usuario(1, PapelAtor.ADMINISTRADOR))).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"sala interditada\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/reservas/55/aprovacao")
                .with(user(usuario(1, PapelAtor.ADMINISTRADOR))).with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    void correlationIdNaoConfiavelNaoVazaNaResposta() throws Exception {
        mvc.perform(get("/api/reservas/55").header("X-Correlation-Id", "inválido com espaços"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NAO_AUTENTICADO"))
                .andExpect(jsonPath("$.correlationId").isNotEmpty());
    }
}
