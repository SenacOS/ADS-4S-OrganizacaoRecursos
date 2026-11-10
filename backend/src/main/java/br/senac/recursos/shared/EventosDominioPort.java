package br.senac.recursos.shared;

import java.time.Instant;

/** Implementar no módulo de auditoria: mesma transação; notificação pendente na devolução. */
public interface EventosDominioPort {
  void registrar(Evento evento);

  record Evento(
      String entidade,
      long id,
      long ator,
      String acao,
      String antes,
      String depois,
      Instant momento) {}
}
