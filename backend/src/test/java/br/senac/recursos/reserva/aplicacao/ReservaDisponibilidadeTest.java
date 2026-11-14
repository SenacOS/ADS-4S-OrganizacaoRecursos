package br.senac.recursos.reserva.aplicacao;

import static br.senac.recursos.reserva.aplicacao.AmbienteFake.intervalo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.Ocupacao;
import br.senac.recursos.reserva.dominio.OrigemOcupacao;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

/** S4: consulta de disponibilidade reutilizando o detector, sem efeitos colaterais. */
class ReservaDisponibilidadeTest {

    private static final AtorReserva ANA = new AtorReserva(1, PapelAtor.SOLICITANTE);

    private static AmbienteFake ambiente() {
        return new AmbienteFake().comRecursos(1, 2, 3);
    }

    private static ComandoReserva cmd(String ini, String fim, Long... ids) {
        return new ComandoReserva(intervalo(ini, fim), List.of(ids));
    }

    @Test
    void tudoLivreDentroDoExpedienteEDisponivel() {
        ResultadoDisponibilidade r = ambiente().servico().consultarDisponibilidade(List.of(1L, 2L), intervalo("09:00", "10:00"));
        assertTrue(r.dentroDoExpediente());
        assertTrue(r.todosDisponiveis());
        assertEquals(2, r.recursos().size());
    }

    @Test
    void indicaPorRecursoQuemEstaOcupadoEComQualOrigem() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        s.criar(cmd("09:00", "10:00", 1L), ANA);
        amb.bloqueiosExternos.add(new Ocupacao(3, intervalo("09:00", "12:00"), OrigemOcupacao.MANUTENCAO, null));

        ResultadoDisponibilidade r = s.consultarDisponibilidade(List.of(3L, 1L, 2L), intervalo("09:30", "10:30"));

        assertFalse(r.todosDisponiveis());
        assertEquals(List.of(1L, 2L, 3L), r.recursos().stream().map(DisponibilidadeRecurso::recursoId).toList());
        assertEquals(OrigemOcupacao.RESERVA, r.recursos().get(0).motivo());
        assertTrue(r.recursos().get(1).disponivel());
        assertNull(r.recursos().get(1).motivo());
        assertEquals(OrigemOcupacao.MANUTENCAO, r.recursos().get(2).motivo());
    }

    @Test
    void retiradaAbertaEIndicadaEHorarioQueApenasEncostaEstaLivre() {
        AmbienteFake amb = ambiente();
        amb.bloqueiosExternos.add(new Ocupacao(2,
                new IntervaloReserva(AmbienteFake.instante("08:00"), Instant.MAX), OrigemOcupacao.RETIRADA_ABERTA, null));
        ReservaService s = amb.servico();
        s.criar(cmd("09:00", "10:00", 1L), ANA);

        ResultadoDisponibilidade r = s.consultarDisponibilidade(List.of(1L, 2L), intervalo("10:00", "11:00"));
        assertTrue(r.recursos().get(0).disponivel());
        assertEquals(OrigemOcupacao.RETIRADA_ABERTA, r.recursos().get(1).motivo());
    }

    @Test
    void foraDoExpedienteNaoEDisponivelMesmoSemOcupacao() {
        ResultadoDisponibilidade r = ambiente().servico().consultarDisponibilidade(List.of(1L), intervalo("05:00", "06:00"));
        assertFalse(r.dentroDoExpediente());
        assertTrue(r.recursos().get(0).disponivel());
        assertFalse(r.todosDisponiveis());
    }

    @Test
    void reservaEmEdicaoPodeSerIgnorada() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        Reserva minha = s.criar(cmd("09:00", "10:00", 1L), ANA);

        assertFalse(s.consultarDisponibilidade(List.of(1L), intervalo("09:30", "10:30")).todosDisponiveis());
        assertTrue(s.consultarDisponibilidade(List.of(1L), intervalo("09:30", "10:30"), minha.id()).todosDisponiveis());
    }

    @Test
    void consultaNaoBloqueiaNaoGravaNaoAuditaENaoContaConflito() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        s.criar(cmd("09:00", "10:00", 1L), ANA);
        int reservas = amb.armazem.size();
        int auditorias = amb.auditorias.size();
        int eventos = amb.eventos.size();
        amb.ordensDeBloqueio.clear();

        s.consultarDisponibilidade(List.of(1L), intervalo("09:00", "10:00"));

        assertTrue(amb.ordensDeBloqueio.isEmpty());
        assertEquals(reservas, amb.armazem.size());
        assertEquals(auditorias, amb.auditorias.size());
        assertEquals(eventos, amb.eventos.size());
        assertTrue(amb.conflitos.isEmpty());
    }

    @Test
    void listaVaziaDeRecursosEInvalida() {
        assertThrows(IllegalArgumentException.class,
                () -> ambiente().servico().consultarDisponibilidade(List.of(), intervalo("09:00", "10:00")));
    }
}
