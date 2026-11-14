package br.senac.recursos.reserva.dominio;

import java.util.Objects;

/** Intervalo em que um recurso específico está ocupado. {@code reservaId} só existe para RESERVA. */
public record Ocupacao(long recursoId, IntervaloReserva intervalo, OrigemOcupacao origem, Long reservaId) {

    public Ocupacao {
        Objects.requireNonNull(intervalo, "intervalo");
        Objects.requireNonNull(origem, "origem");
    }
}
