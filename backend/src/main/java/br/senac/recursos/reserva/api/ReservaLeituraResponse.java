package br.senac.recursos.reserva.api;

import br.senac.recursos.reserva.aplicacao.RecursoResumo;
import br.senac.recursos.reserva.aplicacao.SolicitanteResumo;
import java.time.OffsetDateTime;
import java.util.List;

/** DTO mínimo de leitura; nunca retorna e-mail, senha ou contato do solicitante. */
public record ReservaLeituraResponse(
        Long id,
        Long solicitanteId,
        String status,
        boolean restrita,
        OffsetDateTime inicio,
        OffsetDateTime fim,
        List<Long> recursosIds,
        String motivoDecisao,
        SolicitanteResumo solicitante,
        List<RecursoResumo> recursos) {
}
