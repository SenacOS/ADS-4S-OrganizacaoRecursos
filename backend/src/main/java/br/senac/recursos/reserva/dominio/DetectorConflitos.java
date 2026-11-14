package br.senac.recursos.reserva.dominio;

import java.util.Collection;
import java.util.Objects;
import java.util.Optional;

/**
 * Regra única de conflito (RF05), reutilizada por criação, edição e consulta de disponibilidade.
 * Não acessa banco: recebe as ocupações já lidas, depois de adquiridos os locks (ADR-003).
 */
public final class DetectorConflitos {

    private DetectorConflitos() {
    }

    /**
     * @param ignorarReservaId reserva em edição, que não conflita consigo mesma (pode ser nulo)
     */
    public static Optional<Ocupacao> primeiroConflito(
            IntervaloReserva novo,
            Collection<Long> recursoIds,
            Collection<Ocupacao> existentes,
            Long ignorarReservaId) {
        Objects.requireNonNull(novo, "novo");
        return existentes.stream()
                .filter(o -> recursoIds.contains(o.recursoId()))
                .filter(o -> ignorarReservaId == null || !ignorarReservaId.equals(o.reservaId()))
                .filter(o -> novo.sobrepoe(o.intervalo()))
                .findFirst();
    }
}
