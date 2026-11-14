package br.senac.recursos.reserva.dominio;

import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * Horas alocadas para o relatório de utilização (RF12). Cálculo puro; quem busca as reservas do
 * período é o repositório (Fausto/Silva).
 *
 * <p>Duas medidas distintas, para não confundir "3 itens na mesma hora" com "3x as horas":
 * {@code horasReservadas} conta cada reserva uma vez; {@code porRecurso} conta a duração em cada recurso.
 * Os intervalos são recortados pelo período consultado.
 */
public final class UtilizacaoReservas {

    /** Estados que representam uso efetivo ou previsto de agenda concluída/ativa. */
    public static final Set<StatusReserva> ESTADOS_PADRAO =
            EnumSet.of(StatusReserva.APROVADA, StatusReserva.EM_USO, StatusReserva.CONCLUIDA);

    private UtilizacaoReservas() {
    }

    public record Resultado(
            Duration horasReservadas,
            Map<Long, Duration> porRecurso,
            Map<StatusReserva, Duration> porStatus,
            int reservasConsideradas) {
    }

    public static Resultado calcular(Collection<Reserva> reservas, IntervaloReserva periodo,
                                     Set<StatusReserva> estados) {
        Duration total = Duration.ZERO;
        int consideradas = 0;
        Map<Long, Duration> porRecurso = new TreeMap<>();
        Map<StatusReserva, Duration> porStatus = new EnumMap<>(StatusReserva.class);

        for (Reserva r : reservas) {
            if (!estados.contains(r.status())) {
                continue;
            }
            Instant inicio = max(r.intervalo().inicio(), periodo.inicio());
            Instant fim = min(r.intervalo().fim(), periodo.fim());
            if (!fim.isAfter(inicio)) {
                continue;
            }
            Duration d = Duration.between(inicio, fim);
            total = total.plus(d);
            consideradas++;
            porStatus.merge(r.status(), d, Duration::plus);
            for (Long recurso : r.recursoIds()) {
                porRecurso.merge(recurso, d, Duration::plus);
            }
        }
        return new Resultado(total, porRecurso, porStatus, consideradas);
    }

    public static Resultado calcular(Collection<Reserva> reservas, IntervaloReserva periodo) {
        return calcular(reservas, periodo, ESTADOS_PADRAO);
    }

    private static Instant max(Instant a, Instant b) {
        return a.isAfter(b) ? a : b;
    }

    private static Instant min(Instant a, Instant b) {
        return a.isBefore(b) ? a : b;
    }
}
