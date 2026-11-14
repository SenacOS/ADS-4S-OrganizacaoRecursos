package br.senac.recursos.reserva.dominio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

/** RF12: horas alocadas sem contagem em triplicado e com recorte pelo período. */
class UtilizacaoReservasTest {

    private static final AtorReserva RESP = new AtorReserva(3, PapelAtor.RESPONSAVEL);

    private static Instant t(String hhmm) {
        return Instant.parse("2026-11-10T" + hhmm + ":00Z");
    }

    private static IntervaloReserva i(String a, String b) {
        return new IntervaloReserva(t(a), t(b));
    }

    private static Reserva aprovada(long id, String a, String b, Long... recursos) {
        return Reserva.solicitar(1, i(a, b), List.of(recursos), false).comId(id).aprovarAutomaticamente();
    }

    @Test
    void reservaComTresRecursosContaUmaVezNasHorasReservadasEUmaPorRecurso() {
        UtilizacaoReservas.Resultado r = UtilizacaoReservas.calcular(
                List.of(aprovada(1, "09:00", "10:00", 1L, 2L, 3L)), i("00:00", "23:00"));

        assertEquals(Duration.ofHours(1), r.horasReservadas());
        assertEquals(1, r.reservasConsideradas());
        assertEquals(Duration.ofHours(1), r.porRecurso().get(1L));
        assertEquals(Duration.ofHours(1), r.porRecurso().get(2L));
        assertEquals(Duration.ofHours(1), r.porRecurso().get(3L));
        assertEquals(3, r.porRecurso().size());
    }

    @Test
    void somaReservasDoMesmoRecursoEDistingueEstados() {
        Reserva emUso = aprovada(2, "11:00", "12:30", 1L).iniciarUso(RESP);
        Reserva concluida = aprovada(3, "14:00", "15:00", 1L).iniciarUso(RESP).concluir(RESP);

        UtilizacaoReservas.Resultado r = UtilizacaoReservas.calcular(
                List.of(aprovada(1, "09:00", "10:00", 1L), emUso, concluida), i("00:00", "23:00"));

        assertEquals(Duration.ofMinutes(60 + 90 + 60), r.porRecurso().get(1L));
        assertEquals(Duration.ofHours(1), r.porStatus().get(StatusReserva.APROVADA));
        assertEquals(Duration.ofMinutes(90), r.porStatus().get(StatusReserva.EM_USO));
        assertEquals(Duration.ofHours(1), r.porStatus().get(StatusReserva.CONCLUIDA));
    }

    @Test
    void estadosForaDoPadraoNaoContam() {
        Reserva solicitada = Reserva.solicitar(1, i("09:00", "10:00"), List.of(5L), true).comId(1);
        Reserva cancelada = aprovada(2, "09:00", "10:00", 1L).cancelar(new AtorReserva(1, PapelAtor.SOLICITANTE), null);
        Reserva rejeitada = solicitada.rejeitar(RESP, "x");

        UtilizacaoReservas.Resultado r = UtilizacaoReservas.calcular(
                List.of(solicitada, cancelada, rejeitada), i("00:00", "23:00"));
        assertEquals(Duration.ZERO, r.horasReservadas());
        assertTrue(r.porRecurso().isEmpty());

        UtilizacaoReservas.Resultado comSolicitada = UtilizacaoReservas.calcular(
                List.of(solicitada), i("00:00", "23:00"), Set.of(StatusReserva.SOLICITADA));
        assertEquals(Duration.ofHours(1), comSolicitada.horasReservadas());
    }

    @Test
    void reservaQueAtravessaOPeriodoEhRecortada() {
        UtilizacaoReservas.Resultado r = UtilizacaoReservas.calcular(
                List.of(aprovada(1, "09:00", "11:00", 1L)), i("10:00", "12:00"));
        assertEquals(Duration.ofHours(1), r.horasReservadas());
        assertEquals(Duration.ofHours(1), r.porRecurso().get(1L));
    }

    @Test
    void reservasForaOuApenasEncostandoNoPeriodoSaoIgnoradas() {
        UtilizacaoReservas.Resultado r = UtilizacaoReservas.calcular(
                List.of(aprovada(1, "08:00", "10:00", 1L), aprovada(2, "12:00", "13:00", 1L)), i("10:00", "12:00"));
        assertEquals(Duration.ZERO, r.horasReservadas());
        assertEquals(0, r.reservasConsideradas());
    }

    @Test
    void periodoSemReservasRetornaZeros() {
        UtilizacaoReservas.Resultado r = UtilizacaoReservas.calcular(List.of(), i("00:00", "23:00"));
        assertEquals(Duration.ZERO, r.horasReservadas());
        assertTrue(r.porRecurso().isEmpty());
        assertTrue(r.porStatus().isEmpty());
    }
}
