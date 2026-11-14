package br.senac.recursos.reserva.api;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Corpo de POST /api/reservas e PATCH /api/reservas/{id}.
 * Datas ISO 8601 com offset. Não existe campo de solicitante: ele vem da sessão autenticada.
 */
public record ReservaRequest(
        @NotNull(message = "é obrigatório") OffsetDateTime inicio,
        @NotNull(message = "é obrigatório") OffsetDateTime fim,
        @NotEmpty(message = "informe ao menos um recurso")
        List<@NotNull(message = "id inválido") @Positive(message = "id inválido") Long> recursosIds) {
}
