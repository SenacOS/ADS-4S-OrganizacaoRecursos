package br.senac.recursos.reserva.aplicacao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.shared.Pagina;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Caso de uso RF07 (fila): autorização, delegação à porta e defesa contra adaptador incorreto. */
class ConsultarFilaAprovacaoTest {

    private static final AtorReserva RESP = new AtorReserva(3, PapelAtor.RESPONSAVEL);
    private static final AtorReserva ANA = new AtorReserva(1, PapelAtor.SOLICITANTE);
    private static final AtorReserva ADMIN = new AtorReserva(4, PapelAtor.ADMINISTRADOR);
    private static final IntervaloReserva INTERVALO = new IntervaloReserva(
            Instant.parse("2026-11-10T16:00:00Z"), Instant.parse("2026-11-10T17:00:00Z"));
    private static final Reserva RESP_PEND = Reserva.solicitar(7, INTERVALO, List.of(101L), true).comId(1001);

    /** Porta falsa: devolve o que for configurado e registra as chamadas. */
    private static final class FilaFalsa implements ReservaFilaPort {
        final List<FiltroFilaAprovacao> chamadas = new ArrayList<>();
        Pagina<ItemFilaAprovacao> resposta;

        @Override
        public Pagina<ItemFilaAprovacao> buscarFila(FiltroFilaAprovacao filtro) {
            chamadas.add(filtro);
            return resposta;
        }

        @Override
        public Pagina<ItemFilaAprovacao> buscarFila(FiltroFilaAprovacao filtro, long responsavelId) {
            if (responsavelId <= 0) throw new AssertionError("Responsável precisa vir da sessão");
            return buscarFila(filtro);
        }
    }

    private static ItemFilaAprovacao item(Reserva r) {
        return new ItemFilaAprovacao(r, new SolicitanteResumo(r.solicitanteId(), "Solicitante " + r.solicitanteId()),
                r.recursoIds().stream().map(id -> new RecursoResumo(id, "SALA", "Sala " + id, null)).toList());
    }

    private static FiltroFilaAprovacao filtro() {
        return FiltroFilaAprovacao.de(null, null, null, 0, 20);
    }

    @Test
    void responsavelRecebeAPaginaEAPortaRecebeOMesmoFiltro() {
        FilaFalsa fila = new FilaFalsa();
        fila.resposta = new Pagina<>(List.of(item(RESP_PEND)), 0, 20, 1);
        FiltroFilaAprovacao f = filtro();

        Pagina<ItemFilaAprovacao> resultado = new ConsultarFilaAprovacao(fila).executar(f, RESP);

        assertEquals(1, resultado.itens().size());
        assertEquals(1L, resultado.total());
        assertEquals(1, fila.chamadas.size());
        assertEquals(f, fila.chamadas.get(0));
    }

    @Test
    void solicitanteEAdministradorNaoConsultamEAPortaNaoEChamada() {
        FilaFalsa fila = new FilaFalsa();
        fila.resposta = new Pagina<>(List.of(), 0, 20, 0);
        ConsultarFilaAprovacao caso = new ConsultarFilaAprovacao(fila);

        assertThrows(OperacaoNaoPermitidaException.class, () -> caso.executar(filtro(), ANA));
        assertThrows(OperacaoNaoPermitidaException.class, () -> caso.executar(filtro(), ADMIN));
        assertTrue(fila.chamadas.isEmpty());
    }

    @Test
    void resultadoVazioEPreservado() {
        FilaFalsa fila = new FilaFalsa();
        fila.resposta = new Pagina<>(List.of(), 0, 20, 0);
        Pagina<ItemFilaAprovacao> r = new ConsultarFilaAprovacao(fila).executar(filtro(), RESP);
        assertTrue(r.itens().isEmpty());
        assertEquals(0L, r.total());
    }

    @Test
    void totalMaiorQueAPaginaEPreservado() {
        FilaFalsa fila = new FilaFalsa();
        fila.resposta = new Pagina<>(List.of(item(RESP_PEND)), 2, 1, 41);
        Pagina<ItemFilaAprovacao> r = new ConsultarFilaAprovacao(fila)
                .executar(FiltroFilaAprovacao.de(null, null, null, 2, 1), RESP);
        assertEquals(41L, r.total());
        assertEquals(2, r.pagina());
    }

    @Test
    void adaptadorQueDevolveReservaNaoPendenteEDetectado() {
        FilaFalsa fila = new FilaFalsa();
        Reserva aprovada = RESP_PEND.aprovar(RESP);
        fila.resposta = new Pagina<>(List.of(item(aprovada)), 0, 20, 1);
        assertThrows(IllegalStateException.class, () -> new ConsultarFilaAprovacao(fila).executar(filtro(), RESP));
    }

    @Test
    void adaptadorQueDevolveReservaNaoRestritaEDetectado() {
        FilaFalsa fila = new FilaFalsa();
        Reserva comum = Reserva.solicitar(7, INTERVALO, List.of(101L), false).comId(1002);
        fila.resposta = new Pagina<>(List.of(item(comum)), 0, 20, 1);
        assertThrows(IllegalStateException.class, () -> new ConsultarFilaAprovacao(fila).executar(filtro(), RESP));
    }

    @Test
    void adaptadorComEnvelopeIncoerenteEDetectado() {
        ConsultarFilaAprovacao caso;
        FilaFalsa fila = new FilaFalsa();
        caso = new ConsultarFilaAprovacao(fila);

        fila.resposta = new Pagina<>(List.of(), 1, 20, 0); // página diferente da pedida
        assertThrows(IllegalStateException.class, () -> caso.executar(filtro(), RESP));

        fila.resposta = new Pagina<>(List.of(), 0, 50, 0); // tamanho diferente do pedido
        assertThrows(IllegalStateException.class, () -> caso.executar(filtro(), RESP));

        fila.resposta = new Pagina<>(List.of(item(RESP_PEND), item(RESP_PEND.comId(1002))), 0, 1, 2); // excede tamanho
        assertThrows(IllegalStateException.class, () -> caso.executar(FiltroFilaAprovacao.de(null, null, null, 0, 1), RESP));

        fila.resposta = new Pagina<>(List.of(item(RESP_PEND)), 0, 20, 0); // total menor que os itens
        assertThrows(IllegalStateException.class, () -> caso.executar(filtro(), RESP));

        fila.resposta = null; // porta sem resposta
        assertThrows(IllegalStateException.class, () -> caso.executar(filtro(), RESP));
    }
}
