package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.IntervaloReserva;
import java.util.Collection;
import java.util.Objects;

/** Dados de entrada para criar ou alterar uma reserva. */
public record ComandoReserva(IntervaloReserva intervalo, Collection<Long> recursoIds) {

    public ComandoReserva {
        Objects.requireNonNull(intervalo, "intervalo");
    }
}
