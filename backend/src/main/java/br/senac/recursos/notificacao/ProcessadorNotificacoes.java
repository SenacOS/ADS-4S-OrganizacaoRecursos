package br.senac.recursos.notificacao;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Claim e conclusao em transacoes curtas. HTTP sempre FORA da transacao.
 * Claim concorrente usa SKIP LOCKED; lease de 5 min recupera quedas.
 * Sem garantia exactly-once: consumidor deve deduplicar por ID de notificacao.
 */
@Service
public class ProcessadorNotificacoes {
    private static final Logger LOG = LoggerFactory.getLogger(ProcessadorNotificacoes.class);
    private static final int MAX_TENTATIVAS = 3;
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transacao;
    private final GatewayNotificacao gateway;
    private final Clock clock;

    public ProcessadorNotificacoes(JdbcTemplate jdbc,
                                   PlatformTransactionManager gerenciador,
                                   GatewayNotificacao gateway, Clock clock) {
        this.jdbc = jdbc;
        this.gateway = gateway;
        this.clock = clock;
        this.transacao = new TransactionTemplate(gerenciador);
        this.transacao.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    /** Retorna quantidade de tentativas efetuadas, inclusive as que falharam. */
    public int processarLote(int limite) {
        if (limite < 1 || limite > 100) throw new IllegalArgumentException("Lote invalido.");
        int processadas = 0;
        for (int i = 0; i < limite; i++) {
            Pendente pendente = reservarProxima();
            if (pendente == null) break;
            try {
                gateway.enviar(new GatewayNotificacao.Mensagem(
                        pendente.id(), pendente.reservaId(), pendente.evento(),
                        pendente.correlacaoId(), pendente.criadoEm()));
                Instant agora = clock.instant();
                transacao.executeWithoutResult(t -> jdbc.update("""
                        UPDATE notificacoes
                           SET status_envio='ENVIADA', enviado_em=?, atualizado_em=?,
                               ultimo_erro=NULL
                         WHERE id=? AND status_envio='ENVIANDO' AND tentativas=?
                        """, utc(agora), utc(agora), pendente.id(), pendente.tentativas()));
            } catch (Exception falha) {
                Instant agora = clock.instant();
                String status = pendente.tentativas() >= MAX_TENTATIVAS ? "FALHA" : "ERRO";
                Instant proxima = agora.plusSeconds(30L * (1L << (pendente.tentativas() - 1)));
                transacao.executeWithoutResult(t -> jdbc.update("""
                        UPDATE notificacoes
                           SET status_envio=?, proxima_tentativa_em=?, atualizado_em=?,
                               ultimo_erro='FALHA_DE_ENTREGA'
                         WHERE id=? AND status_envio='ENVIANDO' AND tentativas=?
                        """, status, utc(proxima), utc(agora),
                        pendente.id(), pendente.tentativas()));
                LOG.warn("Falha ao enviar notificacao id={} tentativa={}",
                        pendente.id(), pendente.tentativas());
            }
            processadas++;
        }
        return processadas;
    }

    private Pendente reservarProxima() {
        Instant agora = clock.instant();
        return transacao.execute(t -> {
            List<Pendente> linhas = jdbc.query("""
                    SELECT id, reserva_id, evento, correlacao_id, criado_em, tentativas
                      FROM notificacoes
                     WHERE ((status_envio IN ('PENDENTE', 'ERRO')
                             AND proxima_tentativa_em <= ?)
                         OR (status_envio = 'ENVIANDO' AND atualizado_em <= ?))
                       AND tentativas < ?
                     ORDER BY id
                     LIMIT 1 FOR UPDATE SKIP LOCKED
                    """, (rs, idx) -> new Pendente(
                        rs.getLong("id"), rs.getLong("reserva_id"),
                        rs.getString("evento"), rs.getString("correlacao_id"),
                        rs.getObject("criado_em", LocalDateTime.class)
                            .toInstant(ZoneOffset.UTC),
                        rs.getInt("tentativas") + 1),
                    utc(agora), utc(agora.minusSeconds(300)), MAX_TENTATIVAS);
            if (linhas.isEmpty()) return null;
            Pendente p = linhas.getFirst();
            jdbc.update("""
                    UPDATE notificacoes
                       SET status_envio='ENVIANDO', tentativas=?, atualizado_em=?
                     WHERE id=?
                    """, p.tentativas(), utc(agora), p.id());
            return p;
        });
    }

    private static LocalDateTime utc(Instant momento) {
        return LocalDateTime.ofInstant(momento, ZoneOffset.UTC);
    }

    private record Pendente(long id, long reservaId, String evento,
                            String correlacaoId, Instant criadoEm, int tentativas) {}
}
