package br.senac.recursos.reserva.dominio;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Objects;

/** Faixa de funcionamento em um dia da semana, no fuso do {@link Expediente}. */
public record JanelaFuncionamento(DayOfWeek dia, LocalTime inicio, LocalTime fim) {

    public JanelaFuncionamento {
        Objects.requireNonNull(dia, "dia");
        Objects.requireNonNull(inicio, "inicio");
        Objects.requireNonNull(fim, "fim");
        if (!fim.isAfter(inicio)) {
            throw new IllegalArgumentException("O fim da janela deve ser posterior ao início.");
        }
    }
}
