package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.OrigemOcupacao;
import java.time.Instant;

/**
 * Evento de conflito evitado (RF12), sem a identidade do solicitante.
 *
 * @param recursoId recurso conflitante registrado no evento
 * @param intervaloSolicitado intervalo da tentativa recusada, devolvido para contexto
 * @param momento instante da tentativa
 */
public record ConflitoEvitadoResumo(
        long id,
        long recursoId,
        IntervaloReserva intervaloSolicitado,
        OrigemOcupacao origem,
        Instant momento) {
}
