package br.senac.recursos.reserva.aplicacao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.shared.Pagina;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Contrato de comportamento da {@link ReservaFilaPort}. Para validar um adaptador real, estenda esta
 * classe, grave os dados recebidos em {@link #portaComDados} (no MySQL, por exemplo) e devolva a porta.
 * Fonte: docs/api/reservas-leitura-contrato.md (proposta de Marcos, ainda sem revisão de backend).
 */
public abstract class ReservaFilaPortContrato {

    private static final AtorReserva RESP = new AtorReserva(3, PapelAtor.RESPONSAVEL);

    /** Cria a porta sobre os dados informados (reservas de qualquer estado, restritas ou não). */
    protected abstract ReservaFilaPort portaComDados(List<ItemFilaAprovacao> dados);

    private static Instant h(String hhmm) {
        return Instant.parse("2026-11-10T" + hhmm + ":00Z");
    }

    private static ItemFilaAprovacao pendente(long id, String ini, String fim, Long... recursos) {
        return item(Reserva.solicitar(7, new IntervaloReserva(h(ini), h(fim)), List.of(recursos), true).comId(id));
    }

    private static ItemFilaAprovacao item(Reserva r) {
        return new ItemFilaAprovacao(r, new SolicitanteResumo(r.solicitanteId(), "Solicitante " + r.solicitanteId()),
                r.recursoIds().stream().map(id -> new RecursoResumo(id, "SALA", "Sala " + id, null)).toList());
    }

    private static List<Long> ids(Pagina<ItemFilaAprovacao> p) {
        return p.itens().stream().map(i -> i.reserva().id()).toList();
    }

    @Test
    void semDadosRetornaPaginaVazia() {
        Pagina<ItemFilaAprovacao> p = portaComDados(List.of()).buscarFila(FiltroFilaAprovacao.de(null, null, null, null, null));
        assertTrue(p.itens().isEmpty());
        assertEquals(0L, p.total());
    }

    @Test
    void soEntramReservasRestritasEmSolicitada() {
        Reserva restritaAprovada = Reserva.solicitar(7, new IntervaloReserva(h("09:00"), h("10:00")), List.of(5L), true)
                .comId(2).aprovar(RESP);
        Reserva comum = Reserva.solicitar(7, new IntervaloReserva(h("09:00"), h("10:00")), List.of(6L), false)
                .comId(3).aprovarAutomaticamente();
        Reserva rejeitada = Reserva.solicitar(7, new IntervaloReserva(h("09:00"), h("10:00")), List.of(7L), true)
                .comId(4).rejeitar(RESP, "x");
        ReservaFilaPort porta = portaComDados(List.of(pendente(1, "09:00", "10:00", 5L), item(restritaAprovada),
                item(comum), item(rejeitada)));

        Pagina<ItemFilaAprovacao> p = porta.buscarFila(FiltroFilaAprovacao.de(null, null, null, null, null));

        assertEquals(List.of(1L), ids(p));
        assertEquals(1L, p.total());
    }

    @Test
    void ordenaPorInicioEDepoisPorId() {
        ReservaFilaPort porta = portaComDados(List.of(pendente(30, "11:00", "12:00", 1L), pendente(20, "09:00", "10:00", 1L),
                pendente(10, "09:00", "10:00", 2L)));
        assertEquals(List.of(10L, 20L, 30L), ids(porta.buscarFila(FiltroFilaAprovacao.de(null, null, null, null, null))));
    }

    @Test
    void periodoSelecionaPorIntersecaoComIntervaloSemiaberto() {
        ReservaFilaPort porta = portaComDados(List.of(
                pendente(1, "08:00", "09:00", 1L),   // termina quando o período começa: fora
                pendente(2, "08:30", "09:30", 1L),   // atravessa o início: dentro
                pendente(3, "09:30", "10:30", 1L),   // contido: dentro
                pendente(4, "10:00", "11:00", 1L))); // começa quando o período termina: fora
        FiltroFilaAprovacao f = FiltroFilaAprovacao.de(h("09:00"), h("10:00"), null, null, null);
        assertEquals(List.of(2L, 3L), ids(porta.buscarFila(f)));
    }

    @Test
    void recursoIdSelecionaReservasQueContemORecurso() {
        ReservaFilaPort porta = portaComDados(List.of(pendente(1, "09:00", "10:00", 5L), pendente(2, "09:00", "10:00", 5L, 6L),
                pendente(3, "09:00", "10:00", 6L)));
        assertEquals(List.of(2L, 3L), ids(porta.buscarFila(FiltroFilaAprovacao.de(null, null, 6L, null, null))));
    }

    @Test
    void filtrosCombinadosAplicamTodosAoMesmoTempo() {
        ReservaFilaPort porta = portaComDados(List.of(pendente(1, "09:00", "10:00", 5L), pendente(2, "09:00", "10:00", 6L),
                pendente(3, "12:00", "13:00", 5L)));
        FiltroFilaAprovacao f = FiltroFilaAprovacao.de(h("08:00"), h("11:00"), 5L, null, null);
        assertEquals(List.of(1L), ids(porta.buscarFila(f)));
    }

    @Test
    void totalVemAntesDaPaginacaoENaoRepeteItensEntrePaginas() {
        List<ItemFilaAprovacao> dados = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            dados.add(pendente(i, "0" + (i + 3) + ":00", "0" + (i + 3) + ":30", 1L));
        }
        ReservaFilaPort porta = portaComDados(dados);

        Pagina<ItemFilaAprovacao> p0 = porta.buscarFila(FiltroFilaAprovacao.de(null, null, null, 0, 2));
        Pagina<ItemFilaAprovacao> p1 = porta.buscarFila(FiltroFilaAprovacao.de(null, null, null, 1, 2));
        Pagina<ItemFilaAprovacao> p2 = porta.buscarFila(FiltroFilaAprovacao.de(null, null, null, 2, 2));
        Pagina<ItemFilaAprovacao> p3 = porta.buscarFila(FiltroFilaAprovacao.de(null, null, null, 3, 2));

        assertEquals(List.of(1L, 2L), ids(p0));
        assertEquals(List.of(3L, 4L), ids(p1));
        assertEquals(List.of(5L), ids(p2));
        assertTrue(p3.itens().isEmpty());
        assertEquals(5L, p0.total());
        assertEquals(5L, p3.total());
    }
}
