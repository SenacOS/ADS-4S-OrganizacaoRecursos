package br.senac.recursos.reserva.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejeitarReservaRequest(
        @NotBlank(message = "é obrigatório")
        @Size(max = 500, message = "no máximo 500 caracteres")
        String motivo) {
}
