package br.senac.recursos.auditoria;

import br.senac.recursos.reserva.aplicacao.AuditoriaPort;
import br.senac.recursos.reserva.aplicacao.RegistroAuditoria;
import br.senac.recursos.shared.EventosDominioPort;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * RF10: integra auditoria de reservas e eventos de recursos/movimentacoes.
 * Nao inicia uma nova transacao: o INSERT participa do commit ou rollback do dominio.
 */
@Repository
public class AuditoriaJdbc implements AuditoriaPort, EventosDominioPort, AuditoriaConsulta {
    private static final Pattern IDENTIFICADOR = Pattern.compile("[A-Z_]{2,40}");
    private static final Pattern CORRELACAO = Pattern.compile("[A-Za-z0-9._-]{1,64}");
    private final JdbcTemplate jdbc;

    public AuditoriaJdbc(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void registrar(RegistroAuditoria registro) {
        Objects.requireNonNull(registro, "registro");
        inserir(registro.entidade(), registro.entidadeId(), registro.atorId(),
                registro.acao().name(), registro.antes(), registro.depois(),
                registro.correlacaoId(), registro.momento());
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void registrar(Evento evento) {
        Objects.requireNonNull(evento, "evento");
        inserir(evento.entidade(), evento.id(), evento.ator(), evento.acao(),
                evento.antes(), evento.depois(), correlacaoDaRequisicao(), evento.momento());
    }

    private void inserir(String entidade, long entidadeId, long atorId, String acao,
                         String antes, String depois, String correlacaoId, Instant momento) {
        if (!IDENTIFICADOR.matcher(Objects.requireNonNull(entidade)).matches()
                || !IDENTIFICADOR.matcher(Objects.requireNonNull(acao)).matches()
                || entidadeId <= 0 || atorId <= 0
                || !CORRELACAO.matcher(Objects.requireNonNull(correlacaoId)).matches()) {
            throw new IllegalArgumentException("Metadados de auditoria invalidos.");
        }
        jdbc.update("""
                INSERT INTO auditoria
                    (entidade, entidade_id, ator_id, acao, antes, depois, correlacao_id, momento)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                entidade, entidadeId, atorId, acao,
                AuditoriaResumo.seguro(entidade, antes),
                AuditoriaResumo.seguro(entidade, depois),
                correlacaoId,
                LocalDateTime.ofInstant(Objects.requireNonNull(momento), ZoneOffset.UTC));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Entrada> consultar(String entidade, long entidadeId) {
        if (entidade == null || !IDENTIFICADOR.matcher(entidade).matches() || entidadeId <= 0) {
            throw new IllegalArgumentException("Entidade ou identificador invalido.");
        }
        return jdbc.query("""
                SELECT id, entidade, entidade_id, ator_id, acao, antes, depois,
                       correlacao_id, momento
                  FROM auditoria
                 WHERE entidade = ? AND entidade_id = ?
                 ORDER BY id
                """, (rs, i) -> new Entrada(
                    rs.getLong("id"), rs.getString("entidade"),
                    rs.getLong("entidade_id"), rs.getLong("ator_id"),
                    rs.getString("acao"), rs.getString("antes"),
                    rs.getString("depois"), rs.getString("correlacao_id"),
                    rs.getObject("momento", LocalDateTime.class).toInstant(ZoneOffset.UTC)),
                entidade, entidadeId);
    }

    private static String correlacaoDaRequisicao() {
        var atributos = RequestContextHolder.getRequestAttributes();
        if (atributos instanceof ServletRequestAttributes servlet) {
            HttpServletRequest requisicao = servlet.getRequest();
            String recebido = requisicao.getHeader("X-Correlation-Id");
            if (recebido != null && CORRELACAO.matcher(recebido).matches()) {
                return recebido;
            }
        }
        return UUID.randomUUID().toString();
    }
}
