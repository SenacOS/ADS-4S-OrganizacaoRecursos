package br.senac.recursos.notificacao;

import java.time.Instant;

/** Contrato de entrega desacoplado do salvamento transacional. */
public interface GatewayNotificacao {
    void enviar(Mensagem mensagem);

    record Mensagem(long id, long reservaId, String evento,
                    String correlacaoId, Instant criadoEm) {}
}
