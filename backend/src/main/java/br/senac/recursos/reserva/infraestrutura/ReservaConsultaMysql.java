package br.senac.recursos.reserva.infraestrutura;

import br.senac.recursos.recurso.infraestrutura.Banco;
import br.senac.recursos.reserva.api.ReservaLeituraResponse;
import br.senac.recursos.reserva.aplicacao.ConsultaInvalidaException;
import br.senac.recursos.reserva.aplicacao.RecursoResumo;
import br.senac.recursos.reserva.aplicacao.SolicitanteResumo;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.ReservaNaoEncontradaException;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.shared.Pagina;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Q9: aplica o escopo no SQL, antes da contagem/paginação e antes de projetar dados.
 * Fora do escopo em detalhe responde como inexistente (404), prevenindo enumeração.
 * A autorização multi-recurso exige responsabilidade por TODOS os recursos.
 */
@Repository
public class ReservaConsultaMysql {
    private static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");
    private final NamedParameterJdbcTemplate jdbc;

    public ReservaConsultaMysql(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public Pagina<ReservaLeituraResponse> listar(AtorReserva ator, String status,
            OffsetDateTime inicio, OffsetDateTime fim, Long recursoId, int pagina, int tamanho) {
        if (pagina < 0 || tamanho < 1 || tamanho > 100) {
            throw new ConsultaInvalidaException("Página ou tamanho inválido.");
        }
        if (recursoId != null && recursoId <= 0) {
            throw new ConsultaInvalidaException("Recurso inválido.");
        }
        if ((inicio == null) != (fim == null) ||
                (inicio != null && !fim.toInstant().isAfter(inicio.toInstant()))) {
            throw new ConsultaInvalidaException("Informe início e fim válidos, juntos.");
        }

        var params = new MapSqlParameterSource();
        StringBuilder filtro = new StringBuilder(" FROM reservas r WHERE 1=1");
        escopo(filtro, params, ator);

        if (status != null) {
            try {
                StatusReserva.valueOf(status);
            } catch (IllegalArgumentException ex) {
                throw new ConsultaInvalidaException("Status inválido.");
            }
            filtro.append(" AND r.status = :status");
            params.addValue("status", status);
        }
        if (inicio != null) {
            filtro.append(" AND r.inicio_utc < :fim AND r.fim_utc > :inicio");
            params.addValue("inicio", Banco.utc(inicio.toInstant()));
            params.addValue("fim", Banco.utc(fim.toInstant()));
        }
        if (recursoId != null) {
            filtro.append("""
                     AND EXISTS (
                         SELECT 1 FROM reserva_recursos rf
                         WHERE rf.reserva_id = r.id AND rf.recurso_id = :recursoId
                     )
                    """);
            params.addValue("recursoId", recursoId);
        }

        Long total = jdbc.queryForObject("SELECT COUNT(*)" + filtro, params, Long.class);
        long quantidade = total == null ? 0L : total;
        long deslocamento = (long) pagina * tamanho;
        if (deslocamento >= quantidade) {
            return new Pagina<>(List.of(), pagina, tamanho, quantidade);
        }
        params.addValue("limite", tamanho).addValue("deslocamento", deslocamento);
        List<Bruta> reservas = jdbc.query(
                "SELECT r.id,r.solicitante_id,r.status,r.restrita,r.inicio_utc,r.fim_utc,r.motivo_decisao"
                        + filtro + " ORDER BY r.inicio_utc ASC, r.id ASC LIMIT :limite OFFSET :deslocamento",
                params, (rs, linha) -> new Bruta(
                        rs.getLong("id"), rs.getLong("solicitante_id"), rs.getString("status"),
                        rs.getBoolean("restrita"),
                        Banco.instante(rs, "inicio_utc").atZone(ZONA).toOffsetDateTime(),
                        Banco.instante(rs, "fim_utc").atZone(ZONA).toOffsetDateTime(),
                        rs.getString("motivo_decisao")));
        Map<Long, List<RecursoResumo>> recursos = buscarRecursos(reservas.stream().map(Bruta::id).toList());
        return new Pagina<>(reservas.stream().map(r -> r.resposta(recursos.get(r.id()))).toList(),
                pagina, tamanho, quantidade);
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public ReservaLeituraResponse detalhe(long reservaId, AtorReserva ator) {
        if (reservaId <= 0) {
            throw new ConsultaInvalidaException("Identificador inválido.");
        }
        var params = new MapSqlParameterSource("id", reservaId);
        StringBuilder filtro = new StringBuilder(" FROM reservas r WHERE r.id = :id");
        escopo(filtro, params, ator);
        List<Bruta> encontradas = jdbc.query(
                "SELECT r.id,r.solicitante_id,r.status,r.restrita,r.inicio_utc,r.fim_utc,r.motivo_decisao"
                        + filtro,
                params, (rs, linha) -> new Bruta(
                        rs.getLong("id"), rs.getLong("solicitante_id"), rs.getString("status"),
                        rs.getBoolean("restrita"),
                        Banco.instante(rs, "inicio_utc").atZone(ZONA).toOffsetDateTime(),
                        Banco.instante(rs, "fim_utc").atZone(ZONA).toOffsetDateTime(),
                        rs.getString("motivo_decisao")));
        if (encontradas.isEmpty()) {
            throw new ReservaNaoEncontradaException(reservaId);
        }
        return encontradas.getFirst().resposta(buscarRecursos(List.of(reservaId)).get(reservaId));
    }

    private static void escopo(StringBuilder sql, MapSqlParameterSource params, AtorReserva ator) {
        params.addValue("usuarioId", ator.usuarioId());
        switch (ator.papel()) {
            case SOLICITANTE -> sql.append(" AND r.solicitante_id = :usuarioId");
            case RESPONSAVEL -> sql.append(ReservaAcessoMysql.ESCOPO_RESPONSAVEL);
            case ADMINISTRADOR -> { /* acesso administrativo de leitura */ }
        }
    }

    private Map<Long, List<RecursoResumo>> buscarRecursos(List<Long> ids) {
        if (ids.isEmpty()) return Map.of();
        Map<Long, List<RecursoResumo>> mapa = new HashMap<>();
        jdbc.query("""
                SELECT rr.reserva_id, rec.id, rec.tipo,
                       COALESCE(p.nome, m.descricao, rec.codigo) AS identificacao,
                       m.numero_patrimonio
                FROM reserva_recursos rr
                JOIN recursos rec ON rec.id = rr.recurso_id
                LEFT JOIN professores p ON p.recurso_id = rec.id
                LEFT JOIN materiais m ON m.recurso_id = rec.id
                WHERE rr.reserva_id IN (:ids)
                ORDER BY rr.reserva_id, rec.id
                """, Map.of("ids", ids), rs -> {
            mapa.computeIfAbsent(rs.getLong("reserva_id"), chave -> new ArrayList<>())
                    .add(new RecursoResumo(rs.getLong("id"), rs.getString("tipo"),
                            rs.getString("identificacao"), rs.getString("numero_patrimonio")));
        });
        return mapa;
    }

    private record Bruta(long id, long solicitanteId, String status, boolean restrita,
            OffsetDateTime inicio, OffsetDateTime fim, String motivo) {
        ReservaLeituraResponse resposta(List<RecursoResumo> recursos) {
            if (recursos == null || recursos.isEmpty()) {
                throw new IllegalStateException("Reserva sem vínculos válidos.");
            }
            var lista = List.copyOf(recursos);
            return new ReservaLeituraResponse(id, solicitanteId, status, restrita,
                    inicio, fim, lista.stream().map(RecursoResumo::id).toList(), motivo,
                    new SolicitanteResumo(solicitanteId, "Solicitante " + solicitanteId), lista);
        }
    }
}
