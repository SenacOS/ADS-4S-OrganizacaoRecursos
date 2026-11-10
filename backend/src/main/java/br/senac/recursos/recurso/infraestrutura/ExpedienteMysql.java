package br.senac.recursos.recurso.infraestrutura;

import br.senac.recursos.reserva.aplicacao.*;
import br.senac.recursos.reserva.dominio.*;
import java.time.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Repository
public class ExpedienteMysql implements ExpedientePort {
  private final Banco b;

  public ExpedienteMysql(Banco b) {
    this.b = b;
  }

  public Expediente atual() {
    if (TransactionSynchronizationManager.isActualTransactionActive()
        && !TransactionSynchronizationManager.isCurrentTransactionReadOnly())
      b.jdbc.queryForObject(
          "SELECT id FROM configuracao_expediente WHERE id=1 FOR SHARE", Integer.class);
    return new Expediente(
        ZoneId.of("America/Sao_Paulo"),
        b.jdbc.query(
            "SELECT * FROM horarios_funcionamento ORDER BY dia_semana,hora_inicio",
            (r, n) ->
                new JanelaFuncionamento(
                    DayOfWeek.of(r.getInt("dia_semana")),
                    r.getObject("hora_inicio", LocalTime.class),
                    r.getObject("hora_fim", LocalTime.class))));
  }

  public void exclusivo() {
    b.jdbc.queryForObject(
        "SELECT id FROM configuracao_expediente WHERE id=1 FOR UPDATE", Integer.class);
  }
}
