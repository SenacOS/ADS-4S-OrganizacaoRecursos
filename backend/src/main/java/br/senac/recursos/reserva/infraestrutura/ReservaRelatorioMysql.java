package br.senac.recursos.reserva.infraestrutura;

import br.senac.recursos.recurso.infraestrutura.Banco;
import br.senac.recursos.reserva.aplicacao.ConflitoEvitadoResumo;
import br.senac.recursos.reserva.aplicacao.ConsultaInvalidaException;
import br.senac.recursos.reserva.aplicacao.ReservaRelatorioPort;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.OrigemOcupacao;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.StatusReserva;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

/** Leitura MySQL do RF12. Somente consulta: não bloqueia a agenda nem grava nada. */
@Repository
public class ReservaRelatorioMysql implements ReservaRelatorioPort {

  private final NamedParameterJdbcTemplate jdbc;

  public ReservaRelatorioMysql(NamedParameterJdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public List<Reserva> buscarReservas(
      IntervaloReserva periodo, Set<StatusReserva> estados, Long recursoId) {
    validar(periodo, recursoId);
    if (estados == null || estados.isEmpty()) {
      throw new ConsultaInvalidaException("Informe ao menos um estado de reserva.");
    }
    var sql =
        new StringBuilder(
            "SELECT r.id, r.solicitante_id, r.inicio_utc, r.fim_utc, r.restrita, r.status,"
                + " r.motivo_decisao FROM reservas r"
                + " WHERE r.inicio_utc < :fim AND r.fim_utc > :inicio AND r.status IN (:estados)");
    var p = parametrosPeriodo(periodo);
    p.addValue("estados", estados.stream().map(Enum::name).toList());
    if (recursoId != null) {
      sql.append(
          " AND EXISTS (SELECT 1 FROM reserva_recursos x"
              + " WHERE x.reserva_id = r.id AND x.recurso_id = :recursoId)");
      p.addValue("recursoId", recursoId);
    }
    sql.append(" ORDER BY r.inicio_utc, r.id");

    List<Linha> linhas =
        jdbc.query(
            sql.toString(),
            p,
            (rs, n) ->
                new Linha(
                    rs.getLong("id"),
                    rs.getLong("solicitante_id"),
                    new IntervaloReserva(
                        Banco.instante(rs, "inicio_utc"), Banco.instante(rs, "fim_utc")),
                    rs.getBoolean("restrita"),
                    StatusReserva.valueOf(rs.getString("status")),
                    rs.getString("motivo_decisao")));
    if (linhas.isEmpty()) {
      return List.of();
    }

    // Vínculos em lote (todos os recursos de cada reserva, não só o filtrado).
    Map<Long, List<Long>> vinculos = new HashMap<>();
    jdbc.query(
        "SELECT reserva_id, recurso_id FROM reserva_recursos"
            + " WHERE reserva_id IN (:ids) ORDER BY reserva_id, recurso_id",
        new MapSqlParameterSource("ids", linhas.stream().map(Linha::id).toList()),
        rs -> {
          vinculos
              .computeIfAbsent(rs.getLong("reserva_id"), k -> new ArrayList<>())
              .add(rs.getLong("recurso_id"));
        });

    List<Reserva> reservas = new ArrayList<>(linhas.size());
    for (Linha l : linhas) {
      reservas.add(
          new Reserva(
              l.id(),
              l.solicitanteId(),
              l.intervalo(),
              vinculos.getOrDefault(l.id(), List.of()),
              l.restrita(),
              l.status(),
              l.motivo()));
    }
    return reservas;
  }

  @Override
  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public List<ConflitoEvitadoResumo> buscarConflitosEvitados(
      IntervaloReserva periodo, Long recursoId) {
    validar(periodo, recursoId);
    var sql =
        new StringBuilder(
            "SELECT id, recurso_id, inicio_utc, fim_utc, origem, momento FROM conflitos_evitados"
                + " WHERE momento >= :inicio AND momento < :fim");
    var p = parametrosPeriodo(periodo);
    if (recursoId != null) {
      sql.append(" AND recurso_id = :recursoId");
      p.addValue("recursoId", recursoId);
    }
    sql.append(" ORDER BY momento, id");
    return jdbc.query(
        sql.toString(),
        p,
        (rs, n) ->
            new ConflitoEvitadoResumo(
                rs.getLong("id"),
                rs.getLong("recurso_id"),
                new IntervaloReserva(Banco.instante(rs, "inicio_utc"), Banco.instante(rs, "fim_utc")),
                OrigemOcupacao.valueOf(rs.getString("origem")),
                Banco.instante(rs, "momento")));
  }

  private static void validar(IntervaloReserva periodo, Long recursoId) {
    if (periodo == null) {
      throw new ConsultaInvalidaException("O período é obrigatório.");
    }
    if (recursoId != null && recursoId <= 0) {
      throw new ConsultaInvalidaException("O recurso informado é inválido.");
    }
  }

  private static MapSqlParameterSource parametrosPeriodo(IntervaloReserva periodo) {
    return new MapSqlParameterSource()
        .addValue("inicio", Banco.utc(periodo.inicio()))
        .addValue("fim", Banco.utc(periodo.fim()));
  }

  private record Linha(
      long id,
      long solicitanteId,
      IntervaloReserva intervalo,
      boolean restrita,
      StatusReserva status,
      String motivo) {}
}
