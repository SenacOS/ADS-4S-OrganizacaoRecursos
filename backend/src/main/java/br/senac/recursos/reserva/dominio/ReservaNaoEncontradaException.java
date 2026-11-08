package br.senac.recursos.reserva.dominio;

/** Reserva inexistente (HTTP 404). */
public class ReservaNaoEncontradaException extends RuntimeException {

    public ReservaNaoEncontradaException(long id) {
        super("Reserva não encontrada: " + id);
    }
}
