package br.senac.recursos.seguranca;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.senac.recursos.reserva.dominio.PapelAtor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** RF01: autenticação com tabela usuarios e BCrypt reais em MySQL/Testcontainers. */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class LoginMysqlIT {
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void dados(DynamicPropertyRegistry registro) {
        registro.add("spring.datasource.url", mysql::getJdbcUrl);
        registro.add("spring.datasource.username", mysql::getUsername);
        registro.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired MockMvc mvc;
    @Autowired PasswordEncoder senhas;

    @BeforeEach
    void preparar() {
        jdbc.update("DELETE FROM usuarios WHERE email IN (?, ?)",
                "login-qualidade@teste.local", "bloqueado-qualidade@teste.local");
        jdbc.update("""
                INSERT INTO usuarios(nome,email,senha_hash,perfil,ativo)
                VALUES (?,?,?,?,?)
                """, "Qualidade", "login-qualidade@teste.local",
                senhas.encode("SenhaForte123!"), PapelAtor.SOLICITANTE.name(), true);
        jdbc.update("""
                INSERT INTO usuarios(nome,email,senha_hash,perfil,ativo)
                VALUES (?,?,?,?,?)
                """, "Bloqueado", "bloqueado-qualidade@teste.local",
                senhas.encode("SenhaForte123!"), PapelAtor.SOLICITANTE.name(), false);
    }

    @Test
    void loginDbRealAbreSessaoEIdentificaUsuario() throws Exception {
        MvcResult inicial = mvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk()).andReturn();
        MockHttpSession sessao = (MockHttpSession) inicial.getRequest().getSession(false);
        assertNotNull(sessao);

        MvcResult login = mvc.perform(post("/api/auth/login")
                    .session(sessao).with(csrf())
                    .param("email", "login-qualidade@teste.local")
                    .param("senha", "SenhaForte123!"))
                .andExpect(status().isNoContent())
                .andReturn();
        MockHttpSession autenticada = (MockHttpSession) login.getRequest().getSession(false);
        assertNotNull(autenticada);

        mvc.perform(get("/api/auth/me").session(autenticada))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("login-qualidade@teste.local"))
                .andExpect(jsonPath("$.papel").value("SOLICITANTE"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void usuarioInativoNaoConsegueLoginMesmoComSenhaCorreta() throws Exception {
        mvc.perform(post("/api/auth/login").with(csrf())
                    .param("email", "bloqueado-qualidade@teste.local")
                    .param("senha", "SenhaForte123!"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void senhaErradaNaoConsegueLogin() throws Exception {
        mvc.perform(post("/api/auth/login").with(csrf())
                    .param("email", "login-qualidade@teste.local")
                    .param("senha", "nao-confere"))
                .andExpect(status().isUnauthorized());
    }
}
