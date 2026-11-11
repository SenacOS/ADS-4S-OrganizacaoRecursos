package br.senac.recursos.seguranca;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.*;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
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

/**
 * RF01 / RF04: ciclo real HTTP -> login com usuario do MySQL -> sessao
 * HttpOnly/CSRF -> filtro de seguranca -> aplicacao -> transacao -> MySQL.
 * Nao simula o servico, o repositorio nem a regra de ownership.
 */
@SpringBootTest(properties = "reservas.api.enabled=true")
@AutoConfigureMockMvc
@Testcontainers
class ReservaIdorSessaoMysqlIT {
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper json;
    @Autowired PasswordEncoder encoder;

    private ZonedDateTime inicioOriginal;
    private ZonedDateTime inicioEditado;

    @BeforeEach
    void prepararBanco() {
        // Exclusivo deste Testcontainer; ordem respeita as FKs.
        for (String tabela : new String[] {
                "notificacoes", "auditoria", "conflitos_evitados",
                "reserva_recursos", "movimentacoes", "reservas",
                "bloqueios_recursos", "salas", "recursos",
                "horarios_funcionamento", "usuarios"
        }) {
            jdbc.update("DELETE FROM " + tabela);
        }
        inserirUsuario(7, "dono@teste.local", "SOLICITANTE");
        inserirUsuario(99, "intruso@teste.local", "SOLICITANTE");
        inserirUsuario(2, "operador@teste.local", "RESPONSAVEL");
        inserirUsuario(1, "admin@teste.local", "ADMINISTRADOR");

        jdbc.update("""
                INSERT INTO recursos (id, tipo, codigo, ativo, restrito)
                VALUES (101, 'SALA', 'IDOR-101', TRUE, FALSE)
                """);
        jdbc.update("""
                INSERT INTO salas (recurso_id, tipo, capacidade, localizacao, tipo_sala)
                VALUES (101, 'SALA', 10, 'LAB-TESTE', 'LAB')
                """);
        for (int dia = 1; dia <= 7; dia++) {
            jdbc.update("""
                    INSERT INTO horarios_funcionamento
                       (dia_semana, hora_inicio, hora_fim) VALUES (?, '08:00:00', '22:00:00')
                    """, dia);
        }

        ZoneId saoPaulo = ZoneId.of("America/Sao_Paulo");
        inicioOriginal = LocalDate.now(saoPaulo).plusDays(2)
                .atTime(10, 0).atZone(saoPaulo);
        inicioEditado = inicioOriginal.plusHours(2);
        jdbc.update("""
                INSERT INTO reservas
                    (id, solicitante_id, inicio_utc, fim_utc, restrita, status)
                VALUES (55, 7, ?, ?, FALSE, 'APROVADA')
                """, utc(inicioOriginal), utc(inicioOriginal.plusHours(1)));
        jdbc.update("INSERT INTO reserva_recursos(reserva_id, recurso_id) VALUES (55,101)");
    }

    private void inserirUsuario(long id, String email, String perfil) {
        jdbc.update("""
                INSERT INTO usuarios(id, nome, email, senha_hash, perfil, ativo)
                VALUES(?, 'Pessoa de teste', ?, ?, ?, TRUE)
                """, id, email, encoder.encode("SenhaForte123!"), perfil);
    }

    private static LocalDateTime utc(ZonedDateTime horario) {
        return LocalDateTime.ofInstant(horario.toInstant(), ZoneOffset.UTC);
    }

    private String requisicaoEdicao() throws Exception {
        return json.writeValueAsString(Map.of(
                "inicio", inicioEditado.toOffsetDateTime().toString(),
                "fim", inicioEditado.plusHours(1).toOffsetDateTime().toString(),
                "recursosIds", new long[] {101}));
    }

    private record Sessao(MockHttpSession http, String csrf) {}

    private Sessao login(String email) throws Exception {
        MvcResult inicio = mvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk()).andReturn();
        MockHttpSession anonima = (MockHttpSession) inicio.getRequest().getSession(false);
        assertNotNull(anonima);
        String token = json.readTree(inicio.getResponse().getContentAsString())
                .path("token").asText();

        MvcResult autenticacao = mvc.perform(post("/api/auth/login").session(anonima)
                    .header("X-CSRF-TOKEN", token)
                    .param("email", email).param("senha", "SenhaForte123!"))
                .andExpect(status().isNoContent()).andReturn();
        MockHttpSession autenticada =
                (MockHttpSession) autenticacao.getRequest().getSession(false);
        assertNotNull(autenticada);
        MvcResult tokenNovo = mvc.perform(get("/api/auth/csrf").session(autenticada))
                .andExpect(status().isOk()).andReturn();
        String csrfValido = json.readTree(tokenNovo.getResponse().getContentAsString())
                .path("token").asText();
        assertFalse(csrfValido.isBlank());
        return new Sessao(autenticada, csrfValido);
    }

    @Test
    void solicitanteAlheioRecebe403SemAlterarReservaNemGerarAuditoria() throws Exception {
        Sessao atacante = login("intruso@teste.local");

        mvc.perform(patch("/api/reservas/55")
                .session(atacante.http()).header("X-CSRF-TOKEN", atacante.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(requisicaoEdicao()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("OPERACAO_NAO_PERMITIDA"));

        assertEquals(utc(inicioOriginal), jdbc.queryForObject(
                "SELECT inicio_utc FROM reservas WHERE id=55",
                (rs, idx) -> rs.getObject(1, LocalDateTime.class)));
        assertEquals(0, jdbc.queryForObject(
                "SELECT COUNT(*) FROM auditoria WHERE entidade='RESERVA' AND entidade_id=55",
                Integer.class));
        assertEquals(0, jdbc.queryForObject(
                "SELECT COUNT(*) FROM notificacoes WHERE reserva_id=55", Integer.class));
    }

    @Test
    void csrfAusenteEh403EProprietarioComSessaoPodeEditar() throws Exception {
        Sessao dono = login("dono@teste.local");
        mvc.perform(patch("/api/reservas/55")
                .session(dono.http())
                .contentType(MediaType.APPLICATION_JSON).content(requisicaoEdicao()))
                .andExpect(status().isForbidden());
        assertEquals(utc(inicioOriginal), jdbc.queryForObject(
                "SELECT inicio_utc FROM reservas WHERE id=55",
                (rs, idx) -> rs.getObject(1, LocalDateTime.class)));

        mvc.perform(patch("/api/reservas/55")
                .session(dono.http()).header("X-CSRF-TOKEN", dono.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(requisicaoEdicao()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(55))
                .andExpect(jsonPath("$.solicitanteId").value(7));

        assertEquals(utc(inicioEditado), jdbc.queryForObject(
                "SELECT inicio_utc FROM reservas WHERE id=55",
                (rs, idx) -> rs.getObject(1, LocalDateTime.class)));
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM auditoria WHERE entidade='RESERVA'"
                    + " AND entidade_id=55 AND acao='EDICAO'",
                Integer.class));
    }

    @Test
    void outroPerfilMesmoAutenticadoNaoPodeEditarReservaAlheia() throws Exception {
        Sessao admin = login("admin@teste.local");
        mvc.perform(patch("/api/reservas/55")
                .session(admin.http()).header("X-CSRF-TOKEN", admin.csrf())
                .contentType(MediaType.APPLICATION_JSON).content(requisicaoEdicao()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("OPERACAO_NAO_PERMITIDA"));
        assertEquals(utc(inicioOriginal), jdbc.queryForObject(
                "SELECT inicio_utc FROM reservas WHERE id=55",
                (rs, idx) -> rs.getObject(1, LocalDateTime.class)));
    }
}
