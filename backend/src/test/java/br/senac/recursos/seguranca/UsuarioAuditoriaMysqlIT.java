package br.senac.recursos.seguranca;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.senac.recursos.auditoria.AuditoriaConsulta;
import br.senac.recursos.reserva.dominio.PapelAtor;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * RF10: criar usuario administrativo deve persistir a entidade e o historico
 * na mesma transacao; snapshots nunca incluem e-mail, nome ou senha.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class UsuarioAuditoriaMysqlIT {
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void dados(DynamicPropertyRegistry registro) {
        registro.add("spring.datasource.url", mysql::getJdbcUrl);
        registro.add("spring.datasource.username", mysql::getUsername);
        registro.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder senhas;
    @Autowired ObjectMapper json;
    @Autowired AuditoriaConsulta consulta;

    @Test
    void cadastrarUsuarioRegistraAuditoriaNoMesmoCommitSemDadosPessoais() throws Exception {
        String sufixo = UUID.randomUUID().toString().substring(0, 8);
        String emailAdmin = "admin-audit-" + sufixo + "@teste.local";
        String emailNovo = "novo-audit-" + sufixo + "@teste.local";
        jdbc.update("""
                INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
                VALUES (?, ?, ?, 'ADMINISTRADOR', TRUE)
                """, "Administrador de Teste", emailAdmin, senhas.encode("SenhaForte123!"));
        Long adminId = jdbc.queryForObject(
                "SELECT id FROM usuarios WHERE email=?", Long.class, emailAdmin);
        assertNotNull(adminId);

        UsuarioPrincipal administrador = new UsuarioPrincipal(
                adminId, emailAdmin, senhas.encode("SenhaForte123!"),
                PapelAtor.ADMINISTRADOR, true);

        MvcResult resposta = mvc.perform(post("/api/usuarios")
                    .with(user(administrador)).with(csrf())
                    .header("X-Correlation-Id", "cadastro-" + sufixo)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsString(Map.of(
                        "nome", "Usuário Confidencial",
                        "email", emailNovo,
                        "senha", "SenhaConfidencial123!",
                        "perfil", "SOLICITANTE"))))
                .andExpect(status().isCreated())
                .andReturn();

        long id = json.readTree(resposta.getResponse().getContentAsString())
                .path("id").asLong();
        assertTrue(id > 0);
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM usuarios WHERE id = ?", Integer.class, id));

        var eventos = consulta.consultar("USUARIO", id);
        assertEquals(1, eventos.size());
        var evento = eventos.getFirst();
        assertEquals("CRIACAO", evento.acao());
        assertEquals(adminId.longValue(), evento.atorId());
        assertEquals("cadastro-" + sufixo, evento.correlacaoId());
        assertTrue(evento.depois().contains("perfil=SOLICITANTE"));
        assertTrue(evento.depois().contains("ativo=true"));
        assertFalse(evento.depois().contains(emailNovo));
        assertFalse(evento.depois().contains("Usuário Confidencial"));
        assertFalse(evento.depois().contains("SenhaConfidencial123!"));
    }
}
