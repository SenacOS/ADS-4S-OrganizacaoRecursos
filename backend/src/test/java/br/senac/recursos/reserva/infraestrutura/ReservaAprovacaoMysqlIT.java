package br.senac.recursos.reserva.infraestrutura;

import static org.junit.jupiter.api.Assertions.*;

import br.senac.recursos.reserva.aplicacao.RecursosPort;
import br.senac.recursos.reserva.aplicacao.ReservaService;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.ConflitoDisponibilidadeException;
import br.senac.recursos.reserva.dominio.ForaDoExpedienteException;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.RecursoIndisponivelException;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Q8 com MySQL real: revalidação na aprovação, rollback sem efeitos e lock dos recursos. */
@SpringBootTest
@Testcontainers
class ReservaAprovacaoMysqlIT {
    @Container static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void banco(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired ReservaService reservas;
    @Autowired RecursosPort locks;
    @Autowired PlatformTransactionManager tm;

    private static final AtorReserva RESP = new AtorReserva(31, PapelAtor.RESPONSAVEL);
    // Terça-feira 17/11/2026, 10h–11h em America/Sao_Paulo.
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
                (31,'Resp','r31@example.org','hash','RESPONSAVEL',TRUE),
                (99,'Admin','a99@example.org','hash','ADMINISTRADOR',TRUE)
                """);
        jdbc.update("""
                INSERT INTO recursos(id,tipo,codigo,ativo,restrito) VALUES
                (11,'SALA','SALA-11',TRUE,TRUE),(12,'MATERIAL','MAT-12',TRUE,TRUE)
                """);
        jdbc.update("INSERT INTO materiais(recurso_id,numero_patrimonio,descricao,condicao)"
                + " VALUES (12,'PAT-12','Projetor','BOM')");
        jdbc.update("INSERT INTO responsaveis_recursos(recurso_id,usuario_id) VALUES (11,31),(12,31)");
        jdbc.update("INSERT INTO horarios_funcionamento(dia_semana,hora_inicio,hora_fim)"
                + " VALUES (2,'07:00:00','22:00:00')");
        reserva(101, 1, "SOLICITADA", INI, FIM, 11);
    }

    private void reserva(long id, long solicitante, String status, String ini, String fim, long recurso) {
        jdbc.update("INSERT INTO reservas(id,solicitante_id,inicio_utc,fim_utc,restrita,status)"
                + " VALUES (?,?,?,?,TRUE,?)", id, solicitante, ini, fim, status);
        jdbc.update("INSERT INTO reserva_recursos(reserva_id,recurso_id) VALUES (?,?)", id, recurso);
    }

    private void bloqueio(long recurso, String ini, String fim, String status) {
        jdbc.update("INSERT INTO bloqueios_recursos(recurso_id,inicio_utc,fim_utc,motivo,status,autor_id)"
                + " VALUES (?,?,?,'Manutenção',?,99)", recurso, ini, fim, status);
    }

    private long contar(String sql, Object... args) {
        return jdbc.queryForObject(sql, Long.class, args);
    }

    private String status(long id) {
        return jdbc.queryForObject("SELECT status FROM reservas WHERE id=?", String.class, id);
    }

    /** Recusa: exceção esperada, reserva intacta, sem auditoria/notificação e conflito conforme o caso. */
    private void exigirRecusaSemEfeitos(long id, Class<? extends RuntimeException> tipo,
                                        long conflitosEsperados, String origemEsperada) {
        assertThrows(tipo, () -> reservas.aprovar(id, RESP));
        assertEquals("SOLICITADA", status(id));
        assertEquals(0L, contar("SELECT COUNT(*) FROM auditoria WHERE entidade='RESERVA' AND entidade_id=?", id));
        assertEquals(0L, contar("SELECT COUNT(*) FROM notificacoes WHERE reserva_id=?", id));
        assertEquals(conflitosEsperados, contar("SELECT COUNT(*) FROM conflitos_evitados"));
        if (origemEsperada != null) {
            assertEquals(origemEsperada,
                    jdbc.queryForObject("SELECT origem FROM conflitos_evitados", String.class));
        }
    }

    @Test
    void aprovacaoValidaGravaAuditaENotificaIgnorandoAPropriaReserva() {
        reserva(103, 2, "APROVADA", FIM, "2026-11-17 15:00:00", 11); // apenas encosta: [inicio, fim)
        assertEquals("APROVADA", reservas.aprovar(101, RESP).status().name());
        assertEquals("APROVADA", status(101));
        assertEquals(1L, contar("SELECT COUNT(*) FROM auditoria WHERE entidade='RESERVA'"
                + " AND entidade_id=101 AND acao='APROVACAO'"));
        assertEquals(1L, contar("SELECT COUNT(*) FROM notificacoes WHERE reserva_id=101"
                + " AND evento='RESERVA_APROVADA'"));
        assertEquals(0L, contar("SELECT COUNT(*) FROM conflitos_evitados"));
    }

    @Test
    void manutencaoAtivaImpedeEPreservaOConflitoAposRollback() {
        bloqueio(11, "2026-11-17 13:30:00", "2026-11-17 14:30:00", "ATIVO");
        exigirRecusaSemEfeitos(101, ConflitoDisponibilidadeException.class, 1, "MANUTENCAO");
    }

    @Test
    void manutencaoCanceladaOuReservaCanceladaNaoImpedem() {
        bloqueio(11, "2026-11-17 13:30:00", "2026-11-17 14:30:00", "CANCELADO");
        reserva(102, 2, "CANCELADA", "2026-11-17 13:30:00", "2026-11-17 14:30:00", 11);
        assertEquals("APROVADA", reservas.aprovar(101, RESP).status().name());
    }

    @Test
    void outraReservaAprovadaSobrepostaImpede() {
        reserva(102, 2, "APROVADA", "2026-11-17 13:30:00", "2026-11-17 14:30:00", 11);
        exigirRecusaSemEfeitos(101, ConflitoDisponibilidadeException.class, 1, "RESERVA");
    }

    @Test
    void retiradaAbertaImpedeMesmoComAReservaOriginalEncerrada() {
        reserva(105, 1, "SOLICITADA", INI, FIM, 12);
        reserva(121, 2, "EM_USO", "2026-11-17 11:00:00", "2026-11-17 12:00:00", 12);
        jdbc.update("INSERT INTO movimentacoes(recurso_id,reserva_id,responsavel_id,retirado_em,fim_previsto)"
                + " VALUES (12,121,31,'2026-11-17 11:30:00','2026-11-17 12:00:00')");
        exigirRecusaSemEfeitos(105, ConflitoDisponibilidadeException.class, 1, "RETIRADA_ABERTA");
    }

    @Test
    void recursoDesativadoDepoisDaSolicitacaoImpede() {
        jdbc.update("UPDATE recursos SET ativo=FALSE WHERE id=11");
        exigirRecusaSemEfeitos(101, RecursoIndisponivelException.class, 0, null);
    }

    @Test
    void expedienteAlteradoDepoisDaSolicitacaoImpede() {
        jdbc.update("DELETE FROM horarios_funcionamento");
        jdbc.update("INSERT INTO horarios_funcionamento(dia_semana,hora_inicio,hora_fim)"
                + " VALUES (2,'14:00:00','22:00:00')"); // 10h–11h SP deixa de caber
        exigirRecusaSemEfeitos(101, ForaDoExpedienteException.class, 0, null);
    }

    @Test
    void responsavelSemVinculoNaoAprovaESemEfeitos() {
        jdbc.update("DELETE FROM responsaveis_recursos WHERE usuario_id=31");
        exigirRecusaSemEfeitos(101, OperacaoNaoPermitidaException.class, 0, null);
    }

    @Test
    void aprovacaoEsperaOLockDoRecursoEVeAManutencaoConfirmada() throws Exception {
        var travou = new CountDownLatch(1);
        var liberar = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(2);
        try {
            Future<?> manutencao = pool.submit(() -> new TransactionTemplate(tm).executeWithoutResult(s -> {
                locks.bloquear(List.of(11L));
                bloqueio(11, "2026-11-17 13:30:00", "2026-11-17 14:30:00", "ATIVO");
                travou.countDown();
                try {
                    liberar.await(10, TimeUnit.SECONDS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }));
            assertTrue(travou.await(5, TimeUnit.SECONDS));
            Future<Object> aprovacao = pool.submit(() -> {
                try {
                    return reservas.aprovar(101, RESP);
                } catch (RuntimeException e) {
                    return e;
                }
            });
            Thread.sleep(500);
            assertFalse(aprovacao.isDone(), "a aprovação deveria aguardar o lock do recurso");
            liberar.countDown();
            manutencao.get(10, TimeUnit.SECONDS);
            assertInstanceOf(ConflitoDisponibilidadeException.class, aprovacao.get(10, TimeUnit.SECONDS));
            assertEquals("SOLICITADA", status(101));
            assertEquals(1L, contar("SELECT COUNT(*) FROM conflitos_evitados"));
        } finally {
            pool.shutdownNow();
        }
    }
}