package br.senac.recursos.reserva.api;

import java.time.OffsetDateTime;
import java.util.List;

/** Resposta de reserva. Datas em America/Sao_Paulo com offset (ADR-006). */
public record ReservaResponse(
        Long id,
        Long solicitanteId,
        String status,
        boolean restrita,
        OffsetDateTime inicio,
        OffsetDateTime fim,
        List<Long> recursosIds,
        String motivoDecisao) {
}
