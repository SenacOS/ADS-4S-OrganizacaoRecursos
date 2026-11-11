package br.senac.recursos.auditoria;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import br.senac.recursos.seguranca.SecurityConfig;

@WebMvcTest(controllers = AuditoriaController.class)
@Import(SecurityConfig.class)
class AuditoriaControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean AuditoriaConsulta consulta;

    @Test
    void semSessaoRetorna401() throws Exception {
        mvc.perform(get("/api/auditoria/RESERVA/42"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "SOLICITANTE")
    void solicitanteNaoConsultaAuditoria() throws Exception {
        mvc.perform(get("/api/auditoria/RESERVA/42"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void administradorConsultaHistorico() throws Exception {
        when(consulta.consultar(eq("RESERVA"), eq(42L))).thenReturn(List.of(
                new AuditoriaConsulta.Entrada(1, "RESERVA", 42, 3, "CRIACAO", null,
                        "status=SOLICITADA", "correlacao-1",
                        Instant.parse("2026-11-10T12:00:00Z"))));

        mvc.perform(get("/api/auditoria/RESERVA/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].entidade").value("RESERVA"))
                .andExpect(jsonPath("$[0].acao").value("CRIACAO"))
                .andExpect(jsonPath("$[0].atorId").value(3));
    }
}
