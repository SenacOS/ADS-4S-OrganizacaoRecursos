package br.senac.recursos.auditoria;

import static org.junit.jupiter.api.Assertions.*;

import br.senac.recursos.reserva.aplicacao.AuditoriaPort;
import br.senac.recursos.reserva.aplicacao.RegistroAuditoria;
import br.senac.recursos.reserva.dominio.AcaoReserva;
import br.senac.recursos.shared.EventosDominioPort;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class AuditoriaMysqlIT {
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void propriedades(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", mysql::getJdbcUrl);
        r.add("spring.datasource.username", mysql::getUsername);
        r.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired AuditoriaPort reservas;
    @Autowired EventosDominioPort eventos;
    @Autowired AuditoriaConsulta consulta;
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager transacoes;

    private static final Instant MOMENTO = Instant.parse("2026-11-10T15:30:00Z");

    private TransactionTemplate transacao() {
        return new TransactionTemplate(transacoes);
    }

    @Test
    void criacaoEConclusaoPermanecemNoHistorico() {
        long id = 9001L;
        String idCorrelacao = UUID.randomUUID().toString();
        transacao().executeWithoutResult(t -> {
            reservas.registrar(new RegistroAuditoria("RESERVA", id, 3, AcaoReserva.CRIACAO,
                    null, "status=SOLICITADA; inicio=2026-11-10T12:00:00Z",
                    idCorrelacao, MOMENTO));
            reservas.registrar(new RegistroAuditoria("RESERVA", id, 2, AcaoReserva.CONCLUSAO,
                    "EM_USO", "CONCLUIDA", idCorrelacao, MOMENTO.plusSeconds(600)));
        });

        var historico = consulta.consultar("RESERVA", id);
        assertEquals(2, historico.size());
        assertEquals("CRIACAO", historico.get(0).acao());
        assertEquals("CONCLUSAO", historico.get(1).acao());
        assertEquals(3, historico.get(0).atorId());
        assertEquals("status=SOLICITADA; inicio=2026-11-10T12:00:00Z",
                historico.get(0).depois());
        assertEquals(MOMENTO.plusSeconds(600), historico.get(1).momento());
        assertEquals(idCorrelacao, historico.get(1).correlacaoId());
    }

    @Test
    void falhaDaOperacaoReverteAuditoria() {
        long id = 9002L;
        assertThrows(IllegalStateException.class, () ->
                transacao().executeWithoutResult(t -> {
                    eventos.registrar(new EventosDominioPort.Evento(
                            "MOVIMENTACAO", id, 2, "DEVOLUCAO", null,
                            "Movimentacao[recursoId=77, reservaId=88, devolvidoEm=2026-11-10T15:30:00Z]",
                            MOMENTO));
                    throw new IllegalStateException("Falha apos gravacao: simula rollback");
                }));
        assertTrue(consulta.consultar("MOVIMENTACAO", id).isEmpty());
    }

    @Test
    void resumosNaoRevelamDadosLivresOuCredenciais() {
        long id = 9003L;
        transacao().executeWithoutResult(t -> eventos.registrar(new EventosDominioPort.Evento(
                "RECURSO", id, 1, "EDICAO", null,
                "Recurso[dados=DadosRecurso[tipo=PROFESSOR, ativo=true, restrito=false, "
                        + "capacidade=null, nome=Pessoa Privada, senha=segredo]]", MOMENTO)));

        String resumo = consulta.consultar("RECURSO", id).getFirst().depois();
        assertTrue(resumo.contains("tipo=PROFESSOR"));
        assertFalse(resumo.contains("Pessoa"));
        assertFalse(resumo.contains("segredo"));
        assertFalse(resumo.contains("senha"));
    }

    @Test
    void bancoProibeUpdateEDeleteDoHistorico() {
        long id = 9004L;
        transacao().executeWithoutResult(t ->
                reservas.registrar(new RegistroAuditoria(
                        "RESERVA", id, 3, AcaoReserva.CRIACAO,
                        null, "SOLICITADA", UUID.randomUUID().toString(), MOMENTO)));
        assertThrows(DataAccessException.class, () ->
                jdbc.update("UPDATE auditoria SET acao='EDICAO' "
                        + "WHERE entidade='RESERVA' AND entidade_id=?", id));
        assertThrows(DataAccessException.class, () ->
                jdbc.update("DELETE FROM auditoria WHERE entidade='RESERVA' AND entidade_id=?", id));
        assertEquals(1, consulta.consultar("RESERVA", id).size());
    }

    @Test
    void insercaoExigeTransacaoDoDominio() {
        assertThrows(IllegalTransactionStateException.class, () ->
                reservas.registrar(new RegistroAuditoria(
                        "RESERVA", 9005L, 3, AcaoReserva.CRIACAO,
                        null, "SOLICITADA", UUID.randomUUID().toString(), MOMENTO)));
    }
}
