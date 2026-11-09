package br.senac.recursos.reserva.dominio;

/** Tentativa de mudar o estado da reserva por um caminho não permitido. */
public class TransicaoInvalidaException extends RuntimeException {

    public TransicaoInvalidaException(StatusReserva origem, StatusReserva destino) {
        super("Transição não permitida: " + origem + " -> " + destino);
    }
}
