package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.Reserva;
import java.util.List;

/** Reserva restrita pendente, com as projeções necessárias para o Responsável decidir. */
public record ItemFilaAprovacao(Reserva reserva, SolicitanteResumo solicitante, List<RecursoResumo> recursos) {
}
