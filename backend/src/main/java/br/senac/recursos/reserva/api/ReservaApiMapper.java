package br.senac.recursos.reserva.api;

import br.senac.recursos.reserva.aplicacao.ComandoReserva;
import br.senac.recursos.reserva.dominio.IntervaloInvalidoException;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.Reserva;
import java.time.ZoneId;

/** Conversão entre DTOs HTTP e objetos de aplicação/domínio. Sem regra de negócio. */
public final class ReservaApiMapper {

    /** Fuso de exibição (ADR-006). */
    static final ZoneId ZONA_EXIBICAO = ZoneId.of("America/Sao_Paulo");

    private ReservaApiMapper() {
    }

    public static ComandoReserva paraComando(ReservaRequest req) {
        if (req.inicio() == null || req.fim() == null) {
            throw new IntervaloInvalidoException("Início e fim são obrigatórios.");
        }
        IntervaloReserva intervalo = new IntervaloReserva(req.inicio().toInstant(), req.fim().toInstant());
        return new ComandoReserva(intervalo, req.recursosIds());
    }

    public static ReservaResponse paraResposta(Reserva r) {
        return new ReservaResponse(
                r.id(),
                r.solicitanteId(),
                r.status().name(),
                r.restrita(),
                r.intervalo().inicio().atZone(ZONA_EXIBICAO).toOffsetDateTime(),
                r.intervalo().fim().atZone(ZONA_EXIBICAO).toOffsetDateTime(),
                r.recursoIds(),
                r.motivoDecisao());
    }
}
