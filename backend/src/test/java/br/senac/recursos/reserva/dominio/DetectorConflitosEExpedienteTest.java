package br.senac.recursos.reserva.dominio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

/** RF05 (conflito entre recursos) e D04 (expediente). */
class DetectorConflitosEExpedienteTest {

    private static Instant h(String hhmm) {
        return OffsetDateTime.parse("2026-11-10T" + hhmm + ":00-03:00").toInstant(); // terça-feira
    }

    private static IntervaloReserva i(String a, String b) {
        return new IntervaloReserva(h(a), h(b));
    }

    private static Ocupacao reserva(long recurso, String a, String b, long reservaId) {
        return new Ocupacao(recurso, i(a, b), OrigemOcupacao.RESERVA, reservaId);
    }

    @Test
    void ct05_ct06_ct07_mesmoRecursoConflitaIndependenteDosOutros() {
        List<Ocupacao> existentes = List.of(reserva(1, "09:00", "10:00", 1), reserva(2, "09:00", "10:00", 1));
        assertTrue(DetectorConflitos.primeiroConflito(i("09:30", "10:30"), Set.of(1L, 9L), existentes, null).isPresent());
        assertTrue(DetectorConflitos.primeiroConflito(i("09:30", "10:30"), Set.of(8L, 2L), existentes, null).isPresent());
    }

    @Test
    void ct08_recursosDiferentesCoexistem() {
        List<Ocupacao> existentes = List.of(reserva(1, "09:00", "10:00", 1));
        assertFalse(DetectorConflitos.primeiroConflito(i("09:00", "10:00"), Set.of(2L), existentes, null).isPresent());
    }

    @Test
    void ct03_intervalosQueSoEncostamNaoConflitam() {
        List<Ocupacao> existentes = List.of(reserva(1, "09:00", "10:00", 1));
        assertFalse(DetectorConflitos.primeiroConflito(i("10:00", "11:00"), Set.of(1L), existentes, null).isPresent());
        assertFalse(DetectorConflitos.primeiroConflito(i("08:00", "09:00"), Set.of(1L), existentes, null).isPresent());
    }

    @Test
    void reservaEmEdicaoNaoConflitaConsigoMesma() {
        List<Ocupacao> existentes = List.of(reserva(1, "09:00", "10:00", 77));
        assertFalse(DetectorConflitos.primeiroConflito(i("09:30", "10:30"), Set.of(1L), existentes, 77L).isPresent());
        assertTrue(DetectorConflitos.primeiroConflito(i("09:30", "10:30"), Set.of(1L), existentes, 78L).isPresent());
    }

    @Test
    void manutencaoERetiradaAbertaTambemBloqueiam() {
        Ocupacao manutencao = new Ocupacao(1, i("09:00", "12:00"), OrigemOcupacao.MANUTENCAO, null);
        Ocupacao retirada = new Ocupacao(2,
                new IntervaloReserva(h("08:00"), Instant.MAX), OrigemOcupacao.RETIRADA_ABERTA, null);
        List<Ocupacao> existentes = List.of(manutencao, retirada);
        assertEquals(OrigemOcupacao.MANUTENCAO,
                DetectorConflitos.primeiroConflito(i("10:00", "11:00"), Set.of(1L), existentes, null).get().origem());
        assertEquals(OrigemOcupacao.RETIRADA_ABERTA,
                DetectorConflitos.primeiroConflito(i("20:00", "21:00"), Set.of(2L), existentes, null).get().origem());
    }

    @Test
    void semOcupacoesNaoHaConflito() {
        assertFalse(DetectorConflitos.primeiroConflito(i("09:00", "10:00"), Set.of(1L), List.of(), null).isPresent());
    }

    // ---- expediente ----

    private static Expediente terca7as22() {
        return new Expediente(ZoneId.of("America/Sao_Paulo"),
                List.of(new JanelaFuncionamento(DayOfWeek.TUESDAY, LocalTime.of(7, 0), LocalTime.of(22, 0))));
    }

    @Test
    void expedienteAceitaIntervaloDentroDaJanelaEIncluindoLimites() {
        assertTrue(terca7as22().comporta(i("07:00", "08:00")));
        assertTrue(terca7as22().comporta(i("21:00", "22:00")));
        assertTrue(terca7as22().comporta(i("13:00", "14:00")));
    }

    @Test
    void expedienteRecusaForaDaJanelaOuOutroDia() {
        assertFalse(terca7as22().comporta(i("06:59", "08:00")));
        assertFalse(terca7as22().comporta(i("21:30", "22:01")));
        Instant quarta = OffsetDateTime.parse("2026-11-11T10:00:00-03:00").toInstant();
        assertFalse(terca7as22().comporta(new IntervaloReserva(quarta, quarta.plusSeconds(3600))));
    }

    @Test
    void expedienteRecusaReservaQueAtravessaOdia() {
        Instant ini = OffsetDateTime.parse("2026-11-10T21:00:00-03:00").toInstant();
        Instant fim = OffsetDateTime.parse("2026-11-11T08:00:00-03:00").toInstant();
        assertFalse(terca7as22().comporta(new IntervaloReserva(ini, fim)));
    }

    @Test
    void expedienteUsaOFusoLocalENaoUtc() {
        // 01:00Z de quarta = 22:00 de terça em São Paulo: 22:00-22:30 fora; 21:30-22:00 dentro
        Instant ini = Instant.parse("2026-11-10T22:00:00Z"); // 19:00 local
        assertTrue(terca7as22().comporta(new IntervaloReserva(ini, ini.plusSeconds(3600))));
        Instant tarde = Instant.parse("2026-11-11T01:00:00Z"); // 22:00 local de terça
        assertFalse(terca7as22().comporta(new IntervaloReserva(tarde, tarde.plusSeconds(1800))));
    }

    @Test
    void expedienteSemJanelasNaoAceitaNada() {
        assertFalse(new Expediente(ZoneId.of("America/Sao_Paulo"), List.of()).comporta(i("09:00", "10:00")));
    }

    @Test
    void janelaInvalidaERecusada() {
        assertThrows(IllegalArgumentException.class,
                () -> new JanelaFuncionamento(DayOfWeek.MONDAY, LocalTime.of(10, 0), LocalTime.of(10, 0)));
    }
}
