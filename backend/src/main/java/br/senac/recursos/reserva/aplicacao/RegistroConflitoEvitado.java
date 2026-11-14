package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.OrigemOcupacao;
import java.time.Instant;
import java.util.List;

/** Tentativa rejeitada por conflito, contada no relatório de "conflitos evitados" (RF12). */
public record RegistroConflitoEvitado(
        List<Long> recursoIds,
        IntervaloReserva intervalo,
        long solicitanteId,
        long recursoConflitanteId,
        OrigemOcupacao origem,
        Instant momento) {
}
