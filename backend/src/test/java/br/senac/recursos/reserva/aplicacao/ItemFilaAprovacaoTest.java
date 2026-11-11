package br.senac.recursos.reserva.aplicacao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.Reserva;
import java.lang.reflect.RecordComponent;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

/** Invariantes da projeção: ela deve corresponder à reserva e não expor dados pessoais. */
class ItemFilaAprovacaoTest {

    private static final IntervaloReserva INTERVALO = new IntervaloReserva(
            Instant.parse("2026-11-10T16:00:00Z"), Instant.parse("2026-11-10T17:00:00Z"));

    private static Reserva reserva() {
        return Reserva.solicitar(7, INTERVALO, List.of(101L, 305L), true).comId(1001);
    }

    private static List<RecursoResumo> recursosCorretos() {
        return List.of(new RecursoResumo(101, "MATERIAL", "Projetor PROJ-01", "PAT-01"),
                new RecursoResumo(305, "SALA", "Sala 305", null));
    }

    @Test
    void itemConsistenteEAceito() {
        ItemFilaAprovacao item = new ItemFilaAprovacao(reserva(), new SolicitanteResumo(7, "Solicitante 7"),
                recursosCorretos());
        assertEquals(1001L, item.reserva().id().longValue());
        assertNull(item.recursos().get(1).patrimonio());
    }

    @Test
    void solicitanteDivergenteDaReservaEDefeitoDoAdaptador() {
        assertThrows(IllegalStateException.class, () ->
                new ItemFilaAprovacao(reserva(), new SolicitanteResumo(8, "Solicitante 8"), recursosCorretos()));
    }

    @Test
    void recursosFaltandoOuSobrandoSaoDefeitoDoAdaptador() {
        SolicitanteResumo s = new SolicitanteResumo(7, "Solicitante 7");
        assertThrows(IllegalStateException.class, () ->
                new ItemFilaAprovacao(reserva(), s, List.of(new RecursoResumo(101, "MATERIAL", "Projetor", "PAT-01"))));
        assertThrows(IllegalStateException.class, () -> new ItemFilaAprovacao(reserva(), s, List.of(
                new RecursoResumo(101, "MATERIAL", "Projetor", "PAT-01"),
                new RecursoResumo(305, "SALA", "Sala 305", null),
                new RecursoResumo(999, "SALA", "Sala 999", null))));
    }

    @Test
    void identificacaoEmBrancoEInvalida() {
        assertThrows(IllegalStateException.class, () -> new SolicitanteResumo(7, " "));
        assertThrows(IllegalStateException.class, () -> new RecursoResumo(1, "SALA", "", null));
        assertThrows(IllegalStateException.class, () -> new RecursoResumo(1, " ", "Sala 1", null));
    }

    @Test
    void projecaoDoSolicitanteNaoTemDadosPessoais() {
        Set<String> campos = Arrays.stream(SolicitanteResumo.class.getRecordComponents())
                .map(RecordComponent::getName).collect(Collectors.toSet());
        assertEquals(Set.of("usuarioId", "identificacao"), campos);
    }
}
