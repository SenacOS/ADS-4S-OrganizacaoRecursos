package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.Reserva;
import java.util.List;
import java.util.Objects;

/**
 * Reserva restrita pendente, com as projeções necessárias para o Responsável decidir.
 * Inconsistência entre a reserva e suas projeções é defeito do adaptador (IllegalStateException, HTTP 500).
 */
public record ItemFilaAprovacao(Reserva reserva, SolicitanteResumo solicitante, List<RecursoResumo> recursos) {

    public ItemFilaAprovacao {
        Objects.requireNonNull(reserva, "reserva");
        Objects.requireNonNull(solicitante, "solicitante");
        recursos = List.copyOf(recursos);
        if (solicitante.usuarioId() != reserva.solicitanteId()) {
            throw new IllegalStateException("A projeção do solicitante não corresponde à reserva.");
        }
        List<Long> ids = recursos.stream().map(RecursoResumo::id).sorted().toList();
        if (!ids.equals(reserva.recursoIds())) {
            throw new IllegalStateException("As projeções de recursos não correspondem à reserva.");
        }
    }
}
