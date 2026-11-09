package br.senac.recursos.reserva.dominio;

/** A reserva mudou por outra operação durante o bloqueio e não estabilizou (HTTP 409, TENTE_NOVAMENTE). */
public class AlteracaoConcorrenteException extends RuntimeException {

    public AlteracaoConcorrenteException() {
        super("A reserva foi alterada por outra operação; tente novamente.");
    }
}
