package br.senac.recursos.reserva.api;

import static org.junit.jupiter.api.Assertions.assertEquals;

import br.senac.recursos.reserva.aplicacao.ConsultarRelatorioUtilizacao;
import br.senac.recursos.reserva.dominio.UtilizacaoReservas;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class RelatorioUtilizacaoResponseTest {

    @Test
    void duracaoETruncadaParaMinutosInteirosEDatasUsamOffsetDeSaoPaulo() {
        var filtro = ConsultarRelatorioUtilizacao.Filtro.de(
                Instant.parse("2026-11-02T03:00:00Z"), Instant.parse("2026-11-09T03:00:00Z"), null, null);
        var utilizacao = new UtilizacaoReservas.Resultado(
                Duration.ofMinutes(59).plusSeconds(59), Map.of(5L, Duration.ofSeconds(3599)), Map.of(), 1);

        var resp = RelatorioUtilizacaoResponse.de(
                new ConsultarRelatorioUtilizacao.Resultado(filtro, utilizacao, List.of()));

        assertEquals(59, resp.minutosReservados());
        assertEquals(59, resp.porRecurso().get(0).minutos());
        assertEquals(-3 * 3600, resp.inicio().getOffset().getTotalSeconds());
        assertEquals(Instant.parse("2026-11-02T03:00:00Z"), resp.inicio().toInstant());
    }
}
