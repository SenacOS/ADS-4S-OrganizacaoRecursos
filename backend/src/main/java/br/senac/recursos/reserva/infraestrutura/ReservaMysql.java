package br.senac.recursos.reserva.infraestrutura;

import br.senac.recursos.recurso.infraestrutura.Banco;
import br.senac.recursos.reserva.aplicacao.*;
import br.senac.recursos.reserva.dominio.*;
import java.util.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.*;

@Repository
public class ReservaMysql implements ReservaRepositorio {
  private final Banco b;
  private final jakarta.persistence.EntityManager em;

  public ReservaMysql(Banco b, jakarta.persistence.EntityManager em) {
    this.b = b;
    this.em = em;
  }

  @Transactional(propagation = Propagation.MANDATORY)
  public Reserva salvar(Reserva r) {
    var entidade = r.id() == null ? new ReservaEntidade() : em.find(ReservaEntidade.class, r.id());
    if (entidade == null) throw new ReservaNaoEncontradaException(r.id());
    entidade.solicitanteId = r.solicitanteId();
    entidade.inicio = r.intervalo().inicio();
    entidade.fim = r.intervalo().fim();
    entidade.restrita = r.restrita();
    entidade.status = r.status().name();
    entidade.motivo = r.motivoDecisao();
    entidade.recursos.clear();
    entidade.recursos.addAll(r.recursoIds());
    if (r.id() == null) em.persist(entidade);
    em.flush();
    return r.comId(entidade.id);
  }

  public Optional<Reserva> buscarPorId(long id) {
    var ids =
        b.jdbc.queryForList(
            "SELECT recurso_id FROM reserva_recursos WHERE reserva_id=? ORDER BY recurso_id",
            Long.class,
            id);
    return b
        .jdbc
        .query(
            "SELECT * FROM reservas WHERE id=?",
            (r, n) ->
                new Reserva(
                    r.getLong("id"),
                    r.getLong("solicitante_id"),
                    new IntervaloReserva(
                        Banco.instante(r, "inicio_utc"), Banco.instante(r, "fim_utc")),
                    ids,
                    r.getBoolean("restrita"),
                    StatusReserva.valueOf(r.getString("status")),
                    r.getString("motivo_decisao")),
            id)
        .stream()
        .findFirst();
  }
}
