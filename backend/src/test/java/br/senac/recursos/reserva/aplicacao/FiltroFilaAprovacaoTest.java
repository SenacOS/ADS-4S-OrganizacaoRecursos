package br.senac.recursos.reserva.aplicacao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import br.senac.recursos.reserva.dominio.IntervaloInvalidoException;
import java.time.Instant;
import org.junit.jupiter.api.Test;

/** Validação dos parâmetros da fila (contrato de leitura: reservas-leitura-contrato.md). */
class FiltroFilaAprovacaoTest {

    private static final Instant T1 = Instant.parse("2026-11-10T16:00:00Z");
    private static final Instant T2 = Instant.parse("2026-11-10T21:00:00Z");

    @Test
    void semParametrosUsaPadroes() {
        FiltroFilaAprovacao f = FiltroFilaAprovacao.de(null, null, null, null, null);
        assertNull(f.periodo());
        assertNull(f.recursoId());
        assertEquals(0, f.pagina());
        assertEquals(20, f.tamanho());
    }

    @Test
    void periodoCompletoViraIntervalo() {
        FiltroFilaAprovacao f = FiltroFilaAprovacao.de(T1, T2, 101L, 2, 50);
        assertEquals(T1, f.periodo().inicio());
        assertEquals(T2, f.periodo().fim());
        assertEquals(101L, f.recursoId().longValue());
        assertEquals(2, f.pagina());
        assertEquals(50, f.tamanho());
    }

    @Test
    void inicioEFimDevemVirJuntos() {
        assertThrows(ConsultaInvalidaException.class, () -> FiltroFilaAprovacao.de(T1, null, null, null, null));
        assertThrows(ConsultaInvalidaException.class, () -> FiltroFilaAprovacao.de(null, T2, null, null, null));
    }

    @Test
    void fimNaoPosteriorAoInicioEInvalido() {
        assertThrows(IntervaloInvalidoException.class, () -> FiltroFilaAprovacao.de(T2, T1, null, null, null));
        assertThrows(IntervaloInvalidoException.class, () -> FiltroFilaAprovacao.de(T1, T1, null, null, null));
    }

    @Test
    void recursoIdDevePositivo() {
        assertThrows(ConsultaInvalidaException.class, () -> FiltroFilaAprovacao.de(null, null, 0L, null, null));
        assertThrows(ConsultaInvalidaException.class, () -> FiltroFilaAprovacao.de(null, null, -5L, null, null));
    }

    @Test
    void paginaNegativaEInvalida() {
        assertThrows(ConsultaInvalidaException.class, () -> FiltroFilaAprovacao.de(null, null, null, -1, null));
    }

    @Test
    void tamanhoForaDeUmACemEInvalido() {
        assertThrows(ConsultaInvalidaException.class, () -> FiltroFilaAprovacao.de(null, null, null, null, 0));
        assertThrows(ConsultaInvalidaException.class, () -> FiltroFilaAprovacao.de(null, null, null, null, 101));
        assertThrows(ConsultaInvalidaException.class, () -> FiltroFilaAprovacao.de(null, null, null, null, -3));
    }

    @Test
    void limitesDeTamanhoSaoAceitos() {
        assertEquals(1, FiltroFilaAprovacao.de(null, null, null, null, 1).tamanho());
        assertEquals(100, FiltroFilaAprovacao.de(null, null, null, null, 100).tamanho());
    }
}
