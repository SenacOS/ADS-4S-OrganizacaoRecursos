package br.senac.recursos.reserva.aplicacao;

/**
 * PORTA (implementar: Débora). Apenas persiste o evento pendente na mesma transação;
 * o envio acontece depois do commit e uma falha de envio nunca desfaz a reserva (ADR-006).
 */
public interface NotificacaoPort {

    void registrarPendente(EventoNotificacao evento);
}
