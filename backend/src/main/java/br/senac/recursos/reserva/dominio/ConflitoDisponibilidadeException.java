package br.senac.recursos.reserva.dominio;

/** Recurso ocupado, em manutenção ou com retirada aberta (HTTP 409, código RECURSO_INDISPONIVEL). */
public class ConflitoDisponibilidadeException extends RuntimeException {

    private final transient Ocupacao conflito;

    public ConflitoDisponibilidadeException(Ocupacao conflito) {
        super("Um recurso já está ocupado no intervalo solicitado.");
        this.conflito = conflito;
    }

    public Ocupacao conflito() {
        return conflito;
    }
}
