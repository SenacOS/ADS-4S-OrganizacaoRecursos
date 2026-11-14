package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.OrigemOcupacao;

/** Situação de um recurso no intervalo consultado. {@code motivo} é nulo quando disponível. */
public record DisponibilidadeRecurso(long recursoId, boolean disponivel, OrigemOcupacao motivo) {
}
