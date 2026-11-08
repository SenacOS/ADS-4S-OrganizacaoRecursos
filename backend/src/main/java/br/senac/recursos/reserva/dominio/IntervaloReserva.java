package br.senac.recursos.reserva.dominio;

import java.time.Duration;
import java.time.Instant;

/**
 * Intervalo semiaberto [inicio, fim) de uma reserva (RF05, ADR-003).
 *
 * <p>Instantes em UTC; a conversão para America/Sao_Paulo é feita nas bordas (ADR-006).
 * Intervalos que apenas se tocam (10h-11h e 11h-12h) não se sobrepõem.
 */
public record IntervaloReserva(Instant inicio, Instant fim) {

    public IntervaloReserva {
        if (inicio == null || fim == null) {
            throw new IntervaloInvalidoException("Início e fim são obrigatórios.");
        }
        if (!fim.isAfter(inicio)) {
            throw new IntervaloInvalidoException("O horário final deve ser posterior ao inicial.");
        }
    }

    /** Sobreposição: inicio &lt; outro.fim E fim &gt; outro.inicio. */
    public boolean sobrepoe(IntervaloReserva outro) {
        if (outro == null) {
            throw new IllegalArgumentException("Intervalo comparado é obrigatório.");
        }
        return inicio.isBefore(outro.fim) && fim.isAfter(outro.inicio);
    }

    public Duration duracao() {
        return Duration.between(inicio, fim);
    }
}
