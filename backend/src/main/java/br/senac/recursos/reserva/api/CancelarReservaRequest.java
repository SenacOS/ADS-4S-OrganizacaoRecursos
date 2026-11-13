package br.senac.recursos.reserva.api;

import jakarta.validation.constraints.Size;

/** Corpo opcional do cancelamento. Papel e usuário vêm só da sessão, nunca deste corpo. */
public record CancelarReservaRequest(
        @Size(max = 500, message = "no máximo 500 caracteres")
        String motivo) {
}
