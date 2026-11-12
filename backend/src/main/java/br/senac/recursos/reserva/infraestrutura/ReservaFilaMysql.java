package br.senac.recursos.reserva.infraestrutura;

import br.senac.recursos.recurso.infraestrutura.Banco;
import br.senac.recursos.reserva.aplicacao.FiltroFilaAprovacao;
import br.senac.recursos.reserva.aplicacao.ItemFilaAprovacao;
import br.senac.recursos.reserva.aplicacao.RecursoResumo;
import br.senac.recursos.reserva.aplicacao.ReservaFilaPort;
import br.senac.recursos.reserva.aplicacao.SolicitanteResumo;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.shared.Pagina;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class ReservaFilaMysql implements ReservaFilaPort {

  private final NamedParameterJdbcTemplate jdbc;

  public ReservaFilaMysql(NamedParameterJdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  @Deprecated
  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public Pagina<ItemFilaAprovacao> buscarFila(FiltroFilaAprovacao filtro) {
    return buscarFilaInterno(filtro, null);
  }

  @Override
  @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
  public Pagina<ItemFilaAprovacao> buscarFila(FiltroFilaAprovacao filtro, long responsavelId) {
    if (responsavelId <= 0) {
      throw new br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException(
          "Responsável inválido.");
    }
    return buscarFilaInterno(filtro, responsavelId);
  }

  private Pagina<ItemFilaAprovacao> buscarFilaInterno(FiltroFilaAprovacao filtro, Long responsavelId) {
    // O total, a página e os vínculos usam o mesmo snapshot, sem bloquear a agenda.
    var condicoes =
        new StringBuilder(" FROM reservas r WHERE r.status = 'SOLICITADA' AND r.restrita = TRUE");
    var parametros = new MapSqlParameterSource();
    if (responsavelId != null) {
      parametros.addValue("responsavelId", responsavelId);
      condicoes.append("""
          AND EXISTS (
              SELECT 1 FROM reserva_recursos rr
              JOIN responsaveis_recursos vinculo ON vinculo.recurso_id = rr.recurso_id
              JOIN usuarios u ON u.id = vinculo.usuario_id
              WHERE rr.reserva_id = r.id AND vinculo.usuario_id = :responsavelId
                AND u.perfil = 'RESPONSAVEL' AND u.ativo = TRUE
          )
          AND NOT EXISTS (
              SELECT 1 FROM reserva_recursos rr
              WHERE rr.reserva_id = r.id AND NOT EXISTS (
                  SELECT 1 FROM responsaveis_recursos vinculo
                  JOIN usuarios u ON u.id = vinculo.usuario_id
                  WHERE vinculo.recurso_id = rr.recurso_id
                    AND vinculo.usuario_id = :responsavelId
                    AND u.perfil = 'RESPONSAVEL' AND u.ativo = TRUE
              )
          )
          """);
    }
    if (filtro.periodo() != null) {
      condicoes.append(" AND r.inicio_utc < :fim AND r.fim_utc > :inicio");
      parametros.addValue("inicio", Banco.utc(filtro.periodo().inicio()));
      parametros.addValue("fim", Banco.utc(filtro.periodo().fim()));
    }
    if (filtro.recursoId() != null) {
      condicoes.append(
          """
           AND EXISTS (
                SELECT 1 FROM reserva_recursos rr
                WHERE rr.reserva_id = r.id AND rr.recurso_id = :recursoId
           )
          """);
      parametros.addValue("recursoId", filtro.recursoId());
    }

    long total = jdbc.queryForObject("SELECT COUNT(*)" + condicoes, parametros, Long.class);
    long deslocamento = (long) filtro.pagina() * filtro.tamanho();
    if (deslocamento >= total) {
      return new Pagina<>(List.of(), filtro.pagina(), filtro.tamanho(), total);
    }
    parametros.addValue("limite", filtro.tamanho()).addValue("deslocamento", deslocamento);
    var pendentes =
        jdbc.query(
            """
            SELECT r.id, r.solicitante_id, r.inicio_utc, r.fim_utc, r.motivo_decisao
            """
                + condicoes
                + " ORDER BY r.inicio_utc ASC, r.id ASC LIMIT :limite OFFSET :deslocamento",
            parametros,
            (rs, linha) ->
                new Pendente(
                    rs.getLong("id"),
                    rs.getLong("solicitante_id"),
                    new IntervaloReserva(
                        Banco.instante(rs, "inicio_utc"), Banco.instante(rs, "fim_utc")),
                    rs.getString("motivo_decisao")));

    var recursos = buscarRecursos(pendentes.stream().map(Pendente::id).toList());
    var itens =
        pendentes.stream()
            .map(pendente -> pendente.projetar(recursos.getOrDefault(pendente.id(), List.of())))
            .toList();
    return new Pagina<>(itens, filtro.pagina(), filtro.tamanho(), total);
  }

  private Map<Long, List<RecursoResumo>> buscarRecursos(List<Long> reservas) {
    Map<Long, List<RecursoResumo>> porReserva = new HashMap<>();
    jdbc.query(
        """
        SELECT rr.reserva_id, rec.id, rec.tipo,
               COALESCE(p.nome, m.descricao, rec.codigo) AS identificacao,
               m.numero_patrimonio
        FROM reserva_recursos rr
        JOIN recursos rec ON rec.id = rr.recurso_id
        LEFT JOIN professores p ON p.recurso_id = rec.id
        LEFT JOIN materiais m ON m.recurso_id = rec.id
        WHERE rr.reserva_id IN (:reservas)
        ORDER BY rr.reserva_id, rec.id
        """,
        Map.of("reservas", reservas),
        rs -> {
          var recurso =
              new RecursoResumo(
                  rs.getLong("id"),
                  rs.getString("tipo"),
                  rs.getString("identificacao"),
                  rs.getString("numero_patrimonio"));
          porReserva
              .computeIfAbsent(rs.getLong("reserva_id"), id -> new ArrayList<>())
              .add(recurso);
        });
    return porReserva;
  }

  private record Pendente(long id, long solicitanteId, IntervaloReserva periodo, String motivo) {
    ItemFilaAprovacao projetar(List<RecursoResumo> recursos) {
      var reserva =
          new Reserva(
              id,
              solicitanteId,
              periodo,
              recursos.stream().map(RecursoResumo::id).toList(),
              true,
              StatusReserva.SOLICITADA,
              motivo);
      var solicitante = new SolicitanteResumo(solicitanteId, "Solicitante " + solicitanteId);
      return new ItemFilaAprovacao(reserva, solicitante, recursos);
    }
  }
}
