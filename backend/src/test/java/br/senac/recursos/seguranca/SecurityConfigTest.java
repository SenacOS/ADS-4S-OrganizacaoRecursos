package br.senac.recursos.seguranca;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.senac.recursos.reserva.dominio.PapelAtor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/** Testa filtros HTTP reais, sem depender de banco ou do módulo reserva ativado. */
@WebMvcTest(controllers = SessaoController.class)
@Import(SecurityConfig.class)
class SecurityConfigTest {
    @Autowired MockMvc mvc;
    @Autowired PasswordEncoder encoder;
    @MockitoBean UserDetailsService usuarios;

    @Test void sessaoAusenteRetorna401() throws Exception {
        mvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NAO_AUTENTICADO"));
    }

    @Test void csrfPodeSerObtidoAntesDoLogin() throws Exception {
        mvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.header").value("X-CSRF-TOKEN"));
    }

    @Test void loginCorretoAbreSessao() throws Exception {
        when(usuarios.loadUserByUsername("ana@example.com"))
            .thenReturn(new UsuarioPrincipal(7, "ana@example.com", encoder.encode("senhaValida123"),
                    PapelAtor.SOLICITANTE, true));
        mvc.perform(post("/api/auth/login").with(csrf())
                .param("email", "ana@example.com")
                .param("senha", "senhaValida123"))
                .andExpect(status().isNoContent());
    }

    @Test void senhaIncorretaRetorna401() throws Exception {
        when(usuarios.loadUserByUsername("ana@example.com"))
            .thenReturn(new UsuarioPrincipal(7, "ana@example.com", encoder.encode("senhaValida123"),
                    PapelAtor.SOLICITANTE, true));
        mvc.perform(post("/api/auth/login").with(csrf())
                .param("email", "ana@example.com")
                .param("senha", "senhaErrada"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("CREDENCIAIS_INVALIDAS"));
    }

    @Test void solicitanteNaoPodeAprovar() throws Exception {
        mvc.perform(post("/api/reservas/99/aprovacao").with(csrf()).with(user("ana").roles("SOLICITANTE")))
                .andExpect(status().isForbidden());
    }

    @Test void administradorNaoPodeAprovar() throws Exception {
        mvc.perform(post("/api/reservas/99/aprovacao").with(csrf()).with(user("adm").roles("ADMINISTRADOR")))
                .andExpect(status().isForbidden());
    }

    @Test void responsavelPassaPelaBarreiraDePapel() throws Exception {
        // O endpoint de reservas está desativado neste teste; após passar pelo filtro, retorna 404.
        mvc.perform(post("/api/reservas/99/aprovacao").with(csrf()).with(user("resp").roles("RESPONSAVEL")))
                .andExpect(status().isNotFound());
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {
            "/api/reservas/99/inicio",
            "/api/reservas/99/conclusao",
            "/api/reservas/99/nao-comparecimento"
    })
    void transicoesOperacionaisExigemResponsavelOuAdministrador(String rota) throws Exception {
        mvc.perform(post(rota).with(csrf()).with(user("sol").roles("SOLICITANTE")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("OPERACAO_NAO_PERMITIDA"));
        // A API esta desligada nesta fatia; 404 demonstra que o filtro
        // permitiu os papeis autorizados prosseguirem ate o MVC.
        mvc.perform(post(rota).with(csrf()).with(user("resp").roles("RESPONSAVEL")))
                .andExpect(status().isNotFound());
        mvc.perform(post(rota).with(csrf()).with(user("admin").roles("ADMINISTRADOR")))
                .andExpect(status().isNotFound());
    }

    @Test void usuarioAutenticadoNaoPodeAlterarSemCsrf() throws Exception {
        mvc.perform(post("/api/auth/logout").with(user("ana").roles("SOLICITANTE")))
                .andExpect(status().isForbidden());
    }

    @Test void logoutComCsrfEhAceito() throws Exception {
        mvc.perform(post("/api/auth/logout").with(csrf()).with(user("ana").roles("SOLICITANTE")))
                .andExpect(status().isNoContent());
    }

    @Test void consultaMeNaoExpoeHash() throws Exception {
        var principal = new UsuarioPrincipal(7, "ana@example.com", "hash-secreto", PapelAtor.SOLICITANTE, true);
        mvc.perform(get("/api/auth/me").with(user(principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuarioId").value(7))
                .andExpect(jsonPath("$.papel").value("SOLICITANTE"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }
}
