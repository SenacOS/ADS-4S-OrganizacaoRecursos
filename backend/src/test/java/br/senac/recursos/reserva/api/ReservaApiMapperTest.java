package br.senac.recursos.reserva.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import br.senac.recursos.reserva.aplicacao.ComandoReserva;
import br.senac.recursos.reserva.dominio.IntervaloInvalidoException;
import br.senac.recursos.reserva.dominio.Reserva;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class ReservaApiMapperTest {

    private static final OffsetDateTime INICIO = OffsetDateTime.parse("2026-11-10T13:00:00-03:00");
    private static final OffsetDateTime FIM = OffsetDateTime.parse("2026-11-10T14:00:00-03:00");

    @Test
    void convertePedidoParaComandoEmInstantesUtc() {
        ComandoReserva c = ReservaApiMapper.paraComando(new ReservaRequest(INICIO, FIM, List.of(101L, 305L)));
        assertEquals(Instant.parse("2026-11-10T16:00:00Z"), c.intervalo().inicio());
        assertEquals(Instant.parse("2026-11-10T17:00:00Z"), c.intervalo().fim());
        assertEquals(List.of(101L, 305L), List.copyOf(c.recursoIds()));
    }

    @Test
    void offsetsDiferentesRepresentamOMesmoInstante() {
        OffsetDateTime utc = OffsetDateTime.parse("2026-11-10T16:00:00Z");
        ComandoReserva c = ReservaApiMapper.paraComando(new ReservaRequest(utc, FIM, List.of(1L)));
        assertEquals(ReservaApiMapper.paraComando(new ReservaRequest(INICIO, FIM, List.of(1L))).intervalo(),
                c.intervalo());
    }

    @Test
    void fimNaoPosteriorOuNuloViraIntervaloInvalido() {
        assertThrows(IntervaloInvalidoException.class,
                () -> ReservaApiMapper.paraComando(new ReservaRequest(INICIO, INICIO, List.of(1L))));
        assertThrows(IntervaloInvalidoException.class,
                () -> ReservaApiMapper.paraComando(new ReservaRequest(null, FIM, List.of(1L))));
        assertThrows(IntervaloInvalidoException.class,
                () -> ReservaApiMapper.paraComando(new ReservaRequest(INICIO, null, List.of(1L))));
    }

    @Test
    void respostaUsaFusoDeExibicaoEExpoeCamposDaReserva() {
        Reserva r = Reserva.solicitar(7,
                new br.senac.recursos.reserva.dominio.IntervaloReserva(
                        Instant.parse("2026-11-10T16:00:00Z"), Instant.parse("2026-11-10T17:00:00Z")),
                List.of(305L, 101L), true).comId(1001);
        ReservaResponse resp = ReservaApiMapper.paraResposta(r);

        assertEquals(Long.valueOf(1001), resp.id());
        assertEquals(Long.valueOf(7), resp.solicitanteId());
        assertEquals("SOLICITADA", resp.status());
        assertEquals(true, resp.restrita());
        assertEquals(INICIO, resp.inicio());
        assertEquals(FIM, resp.fim());
        assertEquals(List.of(101L, 305L), resp.recursosIds());
        assertNull(resp.motivoDecisao());
    }
}
