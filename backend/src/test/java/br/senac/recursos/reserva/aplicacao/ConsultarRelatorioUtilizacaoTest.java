package br.senac.recursos.reserva.aplicacao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.reserva.dominio.UtilizacaoReservas;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ConsultarRelatorioUtilizacaoTest {

    private static final Instant INI = Instant.parse("2026-11-02T00:00:00Z");
    private static final Instant FIM = Instant.parse("2026-11-09T00:00:00Z");

    /** AJUSTAR se o construtor de AtorReserva for diferente. */
    private static AtorReserva ator(PapelAtor papel) {
        return new AtorReserva(1L, papel);
    }

    private static Reserva aprovada(String de, String ate, Long... recursos) {
        return Reserva.solicitar(2L, new IntervaloReserva(Instant.parse(de), Instant.parse(ate)),
                List.of(recursos), false).aprovarAutomaticamente();
    }

    private static final class PortaFake implements ReservaRelatorioPort {
        int chamadas;
        List<Reserva> reservas = List.of();
        List<ConflitoEvitadoResumo> conflitos = List.of();

        @Override
        public List<Reserva> buscarReservas(IntervaloReserva p, Set<StatusReserva> e, Long recursoId) {
            chamadas++;
            return reservas;
        }

        @Override
        public List<ConflitoEvitadoResumo> buscarConflitosEvitados(IntervaloReserva p, Long recursoId) {
            chamadas++;
            return conflitos;
        }
    }

    @Test
    void administradorExecutaAsDuasConsultasECalculaPelaFuncaoExistente() {
        var porta = new PortaFake();
        porta.reservas = List.of(aprovada("2026-11-03T10:00:00Z", "2026-11-03T12:00:00Z", 5L, 6L));
        var conflito = new ConflitoEvitadoResumo(9L, 5L, new IntervaloReserva(INI, FIM), null, INI);
        porta.conflitos = List.of(conflito);

        var r = new ConsultarRelatorioUtilizacao(porta)
                .executar(ConsultarRelatorioUtilizacao.Filtro.de(INI, FIM, null, null), ator(PapelAtor.ADMINISTRADOR));

        assertEquals(2, porta.chamadas);
        assertEquals(1, r.utilizacao().reservasConsideradas());
        assertEquals(120, r.utilizacao().horasReservadas().toMinutes());
        assertEquals(List.of(conflito), r.conflitosEvitados());
    }

    @Test
    void solicitanteEResponsavelRecebemRecusaSemConsultarAPorta() {
        for (PapelAtor papel : PapelAtor.values()) {
            if (papel == PapelAtor.ADMINISTRADOR) {
                continue;
            }
            var porta = new PortaFake();
            var filtro = ConsultarRelatorioUtilizacao.Filtro.de(INI, FIM, null, null);
            assertThrows(OperacaoNaoPermitidaException.class,
                    () -> new ConsultarRelatorioUtilizacao(porta).executar(filtro, ator(papel)));
            assertEquals(0, porta.chamadas);
        }
    }

    @Test
    void estadosAusentesOuVaziosUsamPadraoEConjuntoEImutavel() {
        var f1 = ConsultarRelatorioUtilizacao.Filtro.de(INI, FIM, null, null);
        var f2 = ConsultarRelatorioUtilizacao.Filtro.de(INI, FIM, Set.of(), null);
        assertEquals(UtilizacaoReservas.ESTADOS_PADRAO, f1.estados());
        assertEquals(UtilizacaoReservas.ESTADOS_PADRAO, f2.estados());
        assertThrows(UnsupportedOperationException.class, () -> f1.estados().add(StatusReserva.CANCELADA));
    }

    @Test
    void filtroInvalidoEhRecusado() {
        assertThrows(ConsultaInvalidaException.class,
                () -> ConsultarRelatorioUtilizacao.Filtro.de(INI, FIM, null, 0L));
        assertThrows(ConsultaInvalidaException.class,
                () -> ConsultarRelatorioUtilizacao.Filtro.de(null, FIM, null, null));
        assertTrue(assertThrows(RuntimeException.class,
                () -> ConsultarRelatorioUtilizacao.Filtro.de(FIM, INI, null, null)) != null);
    }
}
