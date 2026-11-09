package br.senac.recursos.reserva.aplicacao;

import java.util.List;

/**
 * Resposta informativa da consulta de disponibilidade. Não reserva nada: o servidor
 * sempre revalida sob lock ao criar ou editar.
 */
public record ResultadoDisponibilidade(boolean dentroDoExpediente, List<DisponibilidadeRecurso> recursos) {

    public ResultadoDisponibilidade {
        recursos = List.copyOf(recursos);
    }

    public boolean todosDisponiveis() {
        return dentroDoExpediente && recursos.stream().allMatch(DisponibilidadeRecurso::disponivel);
    }
}
