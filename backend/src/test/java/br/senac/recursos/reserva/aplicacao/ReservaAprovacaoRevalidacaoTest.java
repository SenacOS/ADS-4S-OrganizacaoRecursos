package br.senac.recursos.reserva.aplicacao;

import static br.senac.recursos.reserva.aplicacao.AmbienteFake.intervalo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import br.senac.recursos.reserva.dominio.AcaoReserva;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.ConflitoDisponibilidadeException;
import br.senac.recursos.reserva.dominio.Expediente;
import br.senac.recursos.reserva.dominio.ForaDoExpedienteException;
import br.senac.recursos.reserva.dominio.JanelaFuncionamento;
import br.senac.recursos.reserva.dominio.Ocupacao;
import br.senac.recursos.reserva.dominio.OrigemOcupacao;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.RecursoIndisponivelException;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.reserva.dominio.TransicaoInvalidaException;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Q8: a aprovação revalida recurso, expediente e ocupações sob lock, ignorando a própria reserva. */
class ReservaAprovacaoRevalidacaoTest {

    private static final AtorReserva ANA = new AtorReserva(1, PapelAtor.SOLICITANTE);
    private static final AtorReserva BIA = new AtorReserva(2, PapelAtor.SOLICITANTE);
    private static final AtorReserva RESP = new AtorReserva(3, PapelAtor.RESPONSAVEL);

    private AmbienteFake amb;
    private ReservaService servico;
    private Reserva solicitada;

    @BeforeEach
    void preparar() {
        amb = new AmbienteFake().comRecursos(1).comRecursoRestrito(5);
        servico = amb.servico();
        solicitada = servico.criar(new ComandoReserva(intervalo("13:00", "14:00"), List.of(5L)), ANA);
        assertEquals(StatusReserva.SOLICITADA, solicitada.status());
    }

    private void exigirSemEfeitosDeAprovacao() {
        assertEquals(StatusReserva.SOLICITADA, amb.armazem.get(solicitada.id()).status());
        assertEquals(1, amb.auditorias.size(), "só a auditoria de criação");
        assertEquals(1, amb.eventos.size(), "só a notificação de criação");
    }

    @Test
    void aprovacaoValidaGravaAuditaENotificaIgnorandoAPropriaReserva() {
        Reserva aprovada = servico.aprovar(solicitada.id(), RESP);

        assertEquals(StatusReserva.APROVADA, aprovada.status());
        assertEquals(StatusReserva.APROVADA, amb.armazem.get(solicitada.id()).status());
        assertEquals(AcaoReserva.APROVACAO, amb.auditorias.get(1).acao());
        assertEquals(RESP.usuarioId(), amb.auditorias.get(1).atorId());
        assertEquals(TipoEventoNotificacao.RESERVA_APROVADA, amb.eventos.get(1).tipo());
        assertEquals(0, amb.conflitos.size());
    }

    @Test
    void recursoDesativadoDepoisDaSolicitacaoImpedeAprovacao() {
        amb.comRecursoInativo(5);

        assertThrows(RecursoIndisponivelException.class, () -> servico.aprovar(solicitada.id(), RESP));

        exigirSemEfeitosDeAprovacao();
    }

    @Test
    void expedienteAlteradoDepoisDaSolicitacaoImpedeAprovacao() {
        Expediente reduzido = new Expediente(ZoneId.of("America/Sao_Paulo"),
                List.of(DayOfWeek.values()).stream()
                        .map(d -> new JanelaFuncionamento(d, LocalTime.of(7, 0), LocalTime.of(12, 0)))
                        .toList());
        ReservaService comNovoExpediente = new ReservaService(amb, amb, amb, () -> reduzido, amb, amb, amb,
                amb.clock);

        assertThrows(ForaDoExpedienteException.class,
                () -> comNovoExpediente.aprovar(solicitada.id(), RESP));

        exigirSemEfeitosDeAprovacao();
    }

    @Test
    void manutencaoAtivaQueIntersectaImpedeAprovacaoERegistraConflitoEvitado() {
        amb.bloqueiosExternos.add(new Ocupacao(5, intervalo("13:30", "15:00"), OrigemOcupacao.MANUTENCAO, null));

        assertThrows(ConflitoDisponibilidadeException.class, () -> servico.aprovar(solicitada.id(), RESP));

        exigirSemEfeitosDeAprovacao();
        assertEquals(1, amb.conflitos.size());
        assertEquals(OrigemOcupacao.MANUTENCAO, amb.conflitos.get(0).origem());
    }

    @Test
    void retiradaAbertaQueIntersectaImpedeAprovacao() {
        amb.bloqueiosExternos.add(new Ocupacao(5,
                new br.senac.recursos.reserva.dominio.IntervaloReserva(
                        AmbienteFake.instante("12:00"), Instant.MAX),
                OrigemOcupacao.RETIRADA_ABERTA, null));

        assertThrows(ConflitoDisponibilidadeException.class, () -> servico.aprovar(solicitada.id(), RESP));

        exigirSemEfeitosDeAprovacao();
        assertEquals(OrigemOcupacao.RETIRADA_ABERTA, amb.conflitos.get(0).origem());
    }

    @Test
    void outraReservaConflitanteImpedeAprovacao() {
        // Ocupação preexistente/inconsistente: outra reserva ativa sobre o mesmo recurso e horário.
        amb.armazem.put(900L, new Reserva(900L, BIA.usuarioId(), intervalo("13:30", "14:30"), List.of(5L),
                true, StatusReserva.APROVADA, null));

        assertThrows(ConflitoDisponibilidadeException.class, () -> servico.aprovar(solicitada.id(), RESP));

        exigirSemEfeitosDeAprovacao();
        assertEquals(OrigemOcupacao.RESERVA, amb.conflitos.get(0).origem());
    }

    @Test
    void ocupacaoQueApenasEncostaNaoImpedeAprovacao() {
        amb.bloqueiosExternos.add(new Ocupacao(5, intervalo("14:00", "15:00"), OrigemOcupacao.MANUTENCAO, null));

        assertEquals(StatusReserva.APROVADA, servico.aprovar(solicitada.id(), RESP).status());
    }

    @Test
    void estadoInvalidoContinuaSendoErroDeTransicaoENaoDeConflito() {
        servico.rejeitar(solicitada.id(), RESP, "sem disponibilidade de equipe");
        amb.bloqueiosExternos.add(new Ocupacao(5, intervalo("13:00", "14:00"), OrigemOcupacao.MANUTENCAO, null));

        assertThrows(TransicaoInvalidaException.class, () -> servico.aprovar(solicitada.id(), RESP));
        assertEquals(0, amb.conflitos.size());
    }
}
