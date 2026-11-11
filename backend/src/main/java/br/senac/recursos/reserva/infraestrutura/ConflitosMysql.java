package br.senac.recursos.reserva.infraestrutura;

import br.senac.recursos.recurso.infraestrutura.Banco;
import br.senac.recursos.reserva.aplicacao.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.*;
import org.springframework.transaction.support.*;

@Component
public class ConflitosMysql implements ConflitosEvitadosPort {
  private final Banco b;
  private final TransactionTemplate nova;

  public ConflitosMysql(Banco b, PlatformTransactionManager tm) {
    this.b = b;
    nova = new TransactionTemplate(tm);
    nova.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
  }

  public void registrar(RegistroConflitoEvitado r) {
    if (!TransactionSynchronizationManager.isSynchronizationActive())
      throw new IllegalStateException("Transação necessária.");
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          public void afterCompletion(int status) {
            if (status == STATUS_ROLLED_BACK)
              nova.executeWithoutResult(
                  s ->
                      b.jdbc.update(
                          "INSERT INTO"
                              + " conflitos_evitados(solicitante_id,recurso_id,inicio_utc,fim_utc,origem,momento)"
                              + " VALUES(?,?,?,?,?,?)",
                          r.solicitanteId(),
                          r.recursoConflitanteId(),
                          Banco.utc(r.intervalo().inicio()),
                          Banco.utc(r.intervalo().fim()),
                          r.origem().name(),
                          Banco.utc(r.momento())));
          }
        });
  }
}
