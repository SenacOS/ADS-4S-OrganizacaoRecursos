package br.senac.recursos.reserva.infraestrutura;

import static org.junit.jupiter.api.Assertions.*;

import br.senac.recursos.reserva.aplicacao.ReservaService;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.TransicaoInvalidaException;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Q5 com MySQL real: a justificativa do cancelamento administrativo vai para a coluna própria
 * {@code motivo_cancelamento} (migration V7), sem tocar em {@code motivo_decisao}, preservando a
 * reserva, a auditoria e a notificação; sem justificativa nada é gravado.
 */
@SpringBootTest
@Testcontainers
class ReservaCancelamentoMysqlIT {
    @Container static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void banco(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired ReservaService reservas;

    private static final AtorReserva DONO = new AtorReserva(1, PapelAtor.SOLICITANTE);
    private static final AtorReserva OUTRO = new AtorReserva(2, PapelAtor.SOLICITANTE);
    private static final AtorReserva ADMIN = new AtorReserva(99, PapelAtor.ADMINISTRADOR);
    private static final String INI = "2026-11-17 13:00:00";
    private static final String FIM = "2026-11-17 14:00:00";

    @BeforeEach
    void dados() {
        for (String t : List.of("notificacoes", "conflitos_evitados", "movimentacoes",
                "bloqueios_recursos", "auditoria", "responsaveis_recursos", "reserva_recursos",
                "reservas", "materiais", "horarios_funcionamento", "recursos", "usuarios")) {
            jdbc.update("DELETE FROM " + t);
        }
        jdbc.update("""
                INSERT INTO usuarios(id,nome,email,senha_hash,perfil,ativo) VALUES
                (1,'Sol 1','s1@example.org','hash','SOLICITANTE',TRUE),
                (2,'Sol 2','s2@example.org','hash','SOLICITANTE',TRUE),
                (99,'Admin','a99@example.org','hash','ADMINISTRADOR',TRUE)
                """);
        jdbc.update("INSERT INTO recursos(id,tipo,codigo,ativo,restrito) VALUES (11,'SALA','SALA-11',TRUE,FALSE)");
        jdbc.update("INSERT INTO horarios_funcionamento(dia_semana,hora_inicio,hora_fim)"
                + " VALUES (2,'07:00:00','22:00:00')");
        reserva(101, 1, "APROVADA");
    }

    private void reserva(long id, long solicitante, String status) {
        jdbc.update("INSERT INTO reservas(id,solicitante_id,inicio_utc,fim_utc,restrita,status)"
                + " VALUES (?,?,?,?,FALSE,?)", id, solicitante, INI, FIM, status);
        jdbc.update("INSERT INTO reserva_recursos(reserva_id,recurso_id) VALUES (?,11)", id);
    }

    private long contar(String sql, Object... args) {
        return jdbc.queryForObject(sql, Long.class, args);
    }

    private String texto(String coluna, long id) {
        return jdbc.queryForObject("SELECT " + coluna + " FROM reservas WHERE id=?", String.class, id);
    }

    @Test
    void administradorCancelaReservaDeTerceiroGravandoJustificativaEmColunaPropria() {
        assertEquals("CANCELADA", reservas.cancelar(101, ADMIN, "  obra emergencial na sala  ").status().name());

        assertEquals("CANCELADA", texto("status", 101));
        assertEquals("obra emergencial na sala", texto("motivo_cancelamento", 101));
        assertNull(texto("motivo_decisao", 101));
        // histórico preservado: a reserva continua existindo, com o recurso vinculado
        assertEquals(1L, contar("SELECT COUNT(*) FROM reserva_recursos WHERE reserva_id=101"));
        assertEquals(1L, contar("SELECT COUNT(*) FROM auditoria WHERE entidade='RESERVA'"
                + " AND entidade_id=101 AND acao='CANCELAMENTO' AND ator_id=99"));
        assertEquals(1L, contar("SELECT COUNT(*) FROM notificacoes WHERE reserva_id=101"
                + " AND evento='RESERVA_CANCELADA'"));
    }

    @Test
    void administradorSemJustificativaNaoGravaNada() {
        assertThrows(IllegalArgumentException.class, () -> reservas.cancelar(101, ADMIN, null));
        assertThrows(IllegalArgumentException.class, () -> reservas.cancelar(101, ADMIN, "   "));

        assertEquals("APROVADA", texto("status", 101));
        assertNull(texto("motivo_cancelamento", 101));
        assertEquals(0L, contar("SELECT COUNT(*) FROM auditoria WHERE entidade='RESERVA' AND entidade_id=101"));
        assertEquals(0L, contar("SELECT COUNT(*) FROM notificacoes WHERE reserva_id=101"));
    }

    @Test
    void donoCancelaSemJustificativaEColunaFicaNula() {
        assertEquals("CANCELADA", reservas.cancelar(101, DONO, null).status().name());

        assertEquals("CANCELADA", texto("status", 101));
        assertNull(texto("motivo_cancelamento", 101));
        assertNull(texto("motivo_decisao", 101));
    }

    @Test
    void terceiroSemPermissaoNaoCancelaNemGravaJustificativa() {
        assertThrows(OperacaoNaoPermitidaException.class, () -> reservas.cancelar(101, OUTRO, "tentativa"));

        assertEquals("APROVADA", texto("status", 101));
        assertNull(texto("motivo_cancelamento", 101));
    }

    @Test
    void reservaEmUsoNaoCancelaMesmoComJustificativaDoAdministrador() {
        jdbc.update("UPDATE reservas SET status='EM_USO' WHERE id=101");

        assertThrows(TransicaoInvalidaException.class, () -> reservas.cancelar(101, ADMIN, "tentativa"));

        assertEquals("EM_USO", texto("status", 101));
        assertNull(texto("motivo_cancelamento", 101));
    }

    @Test
    void justificativaNoLimiteDe500CaracteresEPersistida() {
        String limite = "x".repeat(500);
        reservas.cancelar(101, ADMIN, limite);
        assertEquals(limite, texto("motivo_cancelamento", 101));
    }
}
