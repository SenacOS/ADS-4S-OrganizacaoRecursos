package br.senac.recursos.reserva.dominio;

/** Intervalo de reserva com dados ausentes ou fim não posterior ao início. */
public class IntervaloInvalidoException extends RuntimeException {

    public IntervaloInvalidoException(String mensagem) {
        super(mensagem);
    }
}
