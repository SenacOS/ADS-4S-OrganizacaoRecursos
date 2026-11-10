package br.senac.recursos.recurso.infraestrutura;

import br.senac.recursos.reserva.aplicacao.*;
import br.senac.recursos.reserva.dominio.*;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Repository;

@Repository
public class OcupacoesMysql implements OcupacoesPort {
  private final Banco b;

  public OcupacoesMysql(Banco b) {
    this.b = b;
  }

  public List<Ocupacao> buscar(Collection<Long> ids, IntervaloReserva intervalo) {
    if (ids.isEmpty()) return List.of();
    String marks = String.join(",", Collections.nCopies(ids.size(), "?"));
    var args = new ArrayList<Object>(ids);
    args.add(Banco.utc(intervalo.fim()));
    args.add(Banco.utc(intervalo.inicio()));
    var saida =
        new ArrayList<Ocupacao>(
            b.jdbc.query(
                "SELECT rr.recurso_id,r.id,r.inicio_utc,r.fim_utc FROM reservas r JOIN"
                    + " reserva_recursos rr ON rr.reserva_id=r.id WHERE rr.recurso_id IN ("
                    + marks
                    + ") AND r.status IN ('SOLICITADA','APROVADA','EM_USO') AND r.inicio_utc<? AND"
                    + " r.fim_utc>?",
                (r, n) ->
                    new Ocupacao(
                        r.getLong(1),
                        new IntervaloReserva(
                            Banco.instante(r, "inicio_utc"), Banco.instante(r, "fim_utc")),
                        OrigemOcupacao.RESERVA,
                        r.getLong(2)),
                args.toArray()));
    saida.addAll(
        b.jdbc.query(
            "SELECT recurso_id,inicio_utc,fim_utc FROM bloqueios_recursos WHERE recurso_id IN ("
                + marks
                + ") AND status='ATIVO' AND inicio_utc<? AND fim_utc>?",
            (r, n) ->
                new Ocupacao(
                    r.getLong(1),
                    new IntervaloReserva(
                        Banco.instante(r, "inicio_utc"), Banco.instante(r, "fim_utc")),
                    OrigemOcupacao.MANUTENCAO,
                    null),
            args.toArray()));
    var abertos = new ArrayList<Object>(ids);
    abertos.add(Banco.utc(intervalo.fim()));
    saida.addAll(
        b.jdbc.query(
            "SELECT recurso_id,retirado_em FROM movimentacoes WHERE recurso_id IN ("
                + marks
                + ") AND devolvido_em IS NULL AND retirado_em<?",
            (r, n) ->
                new Ocupacao(
                    r.getLong(1),
                    new IntervaloReserva(Banco.instante(r, "retirado_em"), Instant.MAX),
                    OrigemOcupacao.RETIRADA_ABERTA,
                    null),
            abertos.toArray()));
    return saida;
  }
}
