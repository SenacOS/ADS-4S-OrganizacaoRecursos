package br.senac.recursos.notificacao;

import br.senac.recursos.reserva.aplicacao.EventoNotificacao;
import br.senac.recursos.reserva.aplicacao.NotificacaoPort;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.regex.Pattern;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Outbox RF11: grava somente evento, sem chamada HTTP na transacao do dominio. */
@Repository
public class NotificacaoJdbc implements NotificacaoPort {
    private static final Pattern CORRELACAO = Pattern.compile("[A-Za-z0-9._-]{1,64}");
    private final JdbcTemplate jdbc;

    public NotificacaoJdbc(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void registrarPendente(EventoNotificacao evento) {
        Objects.requireNonNull(evento, "evento");
        if (evento.reservaId() <= 0 || evento.tipo() == null || evento.momento() == null
                || evento.correlacaoId() == null
                || !CORRELACAO.matcher(evento.correlacaoId()).matches()) {
            throw new IllegalArgumentException("Metadados de notificacao invalidos.");
        }
        LocalDateTime momento = LocalDateTime.ofInstant(evento.momento(), ZoneOffset.UTC);
        jdbc.update("""
                INSERT INTO notificacoes
                    (reserva_id, evento, status_envio, tentativas, correlacao_id,
                     criado_em, atualizado_em, proxima_tentativa_em)
                VALUES (?, ?, 'PENDENTE', 0, ?, ?, ?, ?)
                """, evento.reservaId(), evento.tipo().name(), evento.correlacaoId(),
                momento, momento, momento);
    }
}
