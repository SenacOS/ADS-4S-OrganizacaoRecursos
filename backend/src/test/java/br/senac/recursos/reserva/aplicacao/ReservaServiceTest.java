package br.senac.recursos.reserva.aplicacao;

import static br.senac.recursos.reserva.aplicacao.AmbienteFake.intervalo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.senac.recursos.reserva.dominio.AcaoReserva;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.ConflitoDisponibilidadeException;
import br.senac.recursos.reserva.dominio.ForaDoExpedienteException;
import br.senac.recursos.reserva.dominio.Ocupacao;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.OrigemOcupacao;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.RecursoIndisponivelException;
import br.senac.recursos.reserva.dominio.RecursoNaoEncontradoException;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.ReservaNaoEncontradaException;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.reserva.dominio.TransicaoInvalidaException;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Casos de uso com portas em memória: RF04, RF05, RF07 e protocolo do RF06 (ordem e releitura). */
class ReservaServiceTest {

    private static final AtorReserva ANA = new AtorReserva(1, PapelAtor.SOLICITANTE);
    private static final AtorReserva BIA = new AtorReserva(2, PapelAtor.SOLICITANTE);
    private static final AtorReserva RESP = new AtorReserva(3, PapelAtor.RESPONSAVEL);
    private static final AtorReserva ADMIN = new AtorReserva(4, PapelAtor.ADMINISTRADOR);

    private static ComandoReserva cmd(String ini, String fim, Long... recursos) {
        return new ComandoReserva(intervalo(ini, fim), List.of(recursos));
    }

    private static AmbienteFake ambiente() {
        return new AmbienteFake().comRecursos(1, 2, 3, 4, 10, 20, 30);
    }

    // ---------- criação ----------

    @Test
    void ct13_reservaComumNasceAutoaprovadaEComAuditoriaDeAmbasAsTransicoes() {
        AmbienteFake amb = ambiente();
        Reserva r = amb.servico().criar(cmd("13:00", "14:00", 1L, 2L), ANA);

        assertEquals(StatusReserva.APROVADA, r.status());
        assertEquals(StatusReserva.APROVADA, amb.armazem.get(r.id()).status());
        assertEquals(2, amb.auditorias.size());
        assertEquals(AcaoReserva.CRIACAO, amb.auditorias.get(0).acao());
        assertNull(amb.auditorias.get(0).antes());
        assertEquals(AcaoReserva.APROVACAO_AUTOMATICA, amb.auditorias.get(1).acao());
        assertEquals("SOLICITADA", amb.auditorias.get(1).antes());
        assertEquals("APROVADA", amb.auditorias.get(1).depois());
        assertEquals(amb.auditorias.get(0).correlacaoId(), amb.auditorias.get(1).correlacaoId());
        assertEquals(List.of(TipoEventoNotificacao.RESERVA_CRIADA, TipoEventoNotificacao.RESERVA_APROVADA),
                amb.eventos.stream().map(EventoNotificacao::tipo).toList());
    }

    @Test
    void ct11_restritaFicaSolicitadaEJaBloqueiaAAgenda() {
        AmbienteFake amb = ambiente().comRecursoRestrito(5);
        ReservaService s = amb.servico();
        Reserva r = s.criar(cmd("13:00", "14:00", 5L), ANA);

        assertEquals(StatusReserva.SOLICITADA, r.status());
        assertEquals(1, amb.auditorias.size());
        assertThrows(ConflitoDisponibilidadeException.class, () -> s.criar(cmd("13:30", "14:30", 5L), BIA));
    }

    @Test
    void ct12_rejeitarLiberaAAgendaEPreservaOHistorico() {
        AmbienteFake amb = ambiente().comRecursoRestrito(5);
        ReservaService s = amb.servico();
        Reserva r = s.criar(cmd("13:00", "14:00", 5L), ANA);

        Reserva rejeitada = s.rejeitar(r.id(), RESP, "equipamento em uso pela coordenação");
        assertEquals(StatusReserva.REJEITADA, rejeitada.status());
        assertTrue(amb.armazem.containsKey(r.id()));
        Reserva nova = s.criar(cmd("13:00", "14:00", 5L), BIA);
        assertEquals(StatusReserva.SOLICITADA, nova.status());
        assertEquals(AcaoReserva.REJEICAO, amb.auditorias.get(amb.auditorias.size() - 2).acao());
    }

    @Test
    void ct14_solicitanteNaoAprovaESemEfeitoColateral() {
        AmbienteFake amb = ambiente().comRecursoRestrito(5);
        ReservaService s = amb.servico();
        Reserva r = s.criar(cmd("13:00", "14:00", 5L), ANA);
        int auditoriasAntes = amb.auditorias.size();
        int eventosAntes = amb.eventos.size();

        assertThrows(OperacaoNaoPermitidaException.class, () -> s.aprovar(r.id(), ANA));
        assertThrows(OperacaoNaoPermitidaException.class, () -> s.aprovar(r.id(), ADMIN));

        assertEquals(StatusReserva.SOLICITADA, amb.armazem.get(r.id()).status());
        assertEquals(auditoriasAntes, amb.auditorias.size());
        assertEquals(eventosAntes, amb.eventos.size());
        assertEquals(StatusReserva.APROVADA, s.aprovar(r.id(), RESP).status());
    }

    @Test
    void conflitosPorRecursoCompartilhado_ct05_ct06_ct07_ct08() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        s.criar(cmd("09:00", "10:00", 1L, 2L, 3L), ANA); // sala 1, professor 2, material 3

        assertThrows(ConflitoDisponibilidadeException.class, () -> s.criar(cmd("09:30", "10:30", 1L, 20L), BIA)); // sala igual
        assertThrows(ConflitoDisponibilidadeException.class, () -> s.criar(cmd("09:30", "10:30", 10L, 2L), BIA)); // professor igual
        assertThrows(ConflitoDisponibilidadeException.class, () -> s.criar(cmd("09:30", "10:30", 20L, 3L), BIA)); // patrimônio igual
        assertEquals(StatusReserva.APROVADA, s.criar(cmd("09:30", "10:30", 4L, 10L), BIA).status()); // materiais diferentes
        assertEquals(StatusReserva.APROVADA, s.criar(cmd("10:00", "11:00", 1L, 2L, 3L), BIA).status()); // apenas encosta
    }

    @Test
    void ct10_conflitoNaoDeixaReservaAuditoriaOuNotificacaoParcial() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        s.criar(cmd("09:00", "10:00", 3L), ANA);
        int reservas = amb.armazem.size();
        int auditorias = amb.auditorias.size();
        int eventos = amb.eventos.size();

        assertThrows(ConflitoDisponibilidadeException.class, () -> s.criar(cmd("09:00", "10:00", 1L, 2L, 3L), BIA));

        assertEquals(reservas, amb.armazem.size());
        assertEquals(auditorias, amb.auditorias.size());
        assertEquals(eventos, amb.eventos.size());
    }

    @Test
    void conflitoRegistraEventoDeConflitoEvitadoComOrigem() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        s.criar(cmd("09:00", "10:00", 3L), ANA);
        assertThrows(ConflitoDisponibilidadeException.class, () -> s.criar(cmd("09:00", "10:00", 2L, 3L), BIA));

        assertEquals(1, amb.conflitos.size());
        RegistroConflitoEvitado c = amb.conflitos.get(0);
        assertEquals(3L, c.recursoConflitanteId());
        assertEquals(OrigemOcupacao.RESERVA, c.origem());
        assertEquals(2L, c.solicitanteId());
        assertEquals(List.of(2L, 3L), c.recursoIds());
    }

    @Test
    void ct15_ct16_manutencaoERetiradaAbertaBloqueiam() {
        AmbienteFake amb = ambiente();
        amb.bloqueiosExternos.add(new Ocupacao(1, intervalo("09:00", "12:00"), OrigemOcupacao.MANUTENCAO, null));
        amb.bloqueiosExternos.add(new Ocupacao(3,
                new br.senac.recursos.reserva.dominio.IntervaloReserva(
                        AmbienteFake.instante("08:00"), java.time.Instant.MAX),
                OrigemOcupacao.RETIRADA_ABERTA, null));
        ReservaService s = amb.servico();

        ConflitoDisponibilidadeException manut = assertThrows(ConflitoDisponibilidadeException.class,
                () -> s.criar(cmd("10:00", "11:00", 1L), ANA));
        assertEquals(OrigemOcupacao.MANUTENCAO, manut.conflito().origem());
        ConflitoDisponibilidadeException retirada = assertThrows(ConflitoDisponibilidadeException.class,
                () -> s.criar(cmd("20:00", "21:00", 3L), ANA));
        assertEquals(OrigemOcupacao.RETIRADA_ABERTA, retirada.conflito().origem());
    }

    @Test
    void locksSaoAdquiridosEmOrdemCrescenteESemDuplicatas() {
        AmbienteFake amb = ambiente();
        amb.servico().criar(cmd("13:00", "14:00", 30L, 10L, 20L, 10L), ANA);
        assertEquals(List.of(List.of(10L, 20L, 30L)), amb.ordensDeBloqueio);
    }

    @Test
    void foraDoExpedienteERecusadoAntesDeQualquerLock() {
        AmbienteFake amb = ambiente();
        assertThrows(ForaDoExpedienteException.class, () -> amb.servico().criar(cmd("05:00", "06:00", 1L), ANA));
        assertThrows(ForaDoExpedienteException.class, () -> amb.servico().criar(cmd("21:00", "23:00", 1L), ANA));
        assertTrue(amb.ordensDeBloqueio.isEmpty());
    }

    @Test
    void recursoInativoInexistenteEListaVazia() {
        AmbienteFake amb = ambiente().comRecursoInativo(9);
        ReservaService s = amb.servico();
        assertThrows(RecursoIndisponivelException.class, () -> s.criar(cmd("13:00", "14:00", 1L, 9L), ANA));
        assertThrows(RecursoNaoEncontradoException.class, () -> s.criar(cmd("13:00", "14:00", 999L), ANA));
        assertThrows(IllegalArgumentException.class,
                () -> s.criar(new ComandoReserva(intervalo("13:00", "14:00"), List.of()), ANA));
        assertTrue(amb.armazem.isEmpty());
        assertTrue(amb.auditorias.isEmpty());
    }

    // ---------- cancelamento e demais transições ----------

    @Test
    void cancelarLiberaAAgendaMantendoHistorico() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        Reserva r = s.criar(cmd("13:00", "14:00", 1L), ANA);

        assertThrows(OperacaoNaoPermitidaException.class, () -> s.cancelar(r.id(), BIA));
        assertEquals(StatusReserva.CANCELADA, s.cancelar(r.id(), ANA).status());
        assertTrue(amb.armazem.containsKey(r.id()));
        assertEquals(StatusReserva.APROVADA, s.criar(cmd("13:00", "14:00", 1L), BIA).status());
        assertEquals(TipoEventoNotificacao.RESERVA_CANCELADA,
                amb.eventos.stream().filter(e -> e.tipo() == TipoEventoNotificacao.RESERVA_CANCELADA)
                        .findFirst().get().tipo());
    }

    @Test
    void administradorCancelaReservaDeOutroUsuario() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        Reserva r = s.criar(cmd("13:00", "14:00", 1L), ANA);
        assertEquals(StatusReserva.CANCELADA, s.cancelar(r.id(), ADMIN).status());
        assertEquals(4L, amb.auditorias.get(amb.auditorias.size() - 1).atorId());
    }

    @Test
    void cicloCompletoAprovadaEmUsoConcluidaEEmUsoNaoCancela() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        Reserva r = s.criar(cmd("13:00", "14:00", 1L), ANA);

        assertThrows(OperacaoNaoPermitidaException.class, () -> s.iniciarUso(r.id(), ANA));
        assertEquals(StatusReserva.EM_USO, s.iniciarUso(r.id(), RESP).status());
        assertThrows(TransicaoInvalidaException.class, () -> s.cancelar(r.id(), ANA));
        assertThrows(ConflitoDisponibilidadeException.class, () -> s.criar(cmd("13:00", "14:00", 1L), BIA));
        assertEquals(StatusReserva.CONCLUIDA, s.concluir(r.id(), RESP).status());
        assertEquals(AcaoReserva.CONCLUSAO, amb.auditorias.get(amb.auditorias.size() - 1).acao());
    }

    @Test
    void naoComparecimentoLiberaAAgenda() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        Reserva r = s.criar(cmd("13:00", "14:00", 1L), ANA);

        // Q1: Administrador não pode registrar não comparecimento.
        assertThrows(
            OperacaoNaoPermitidaException.class,
            () -> s.registrarNaoComparecimento(r.id(), ADMIN)
        );

        // A tentativa negada não deve alterar a reserva.
        assertEquals(StatusReserva.APROVADA, amb.armazem.get(r.id()).status());

        // Somente o Responsável pode registrar a ausência.
        assertEquals(
            StatusReserva.NAO_COMPARECEU,
            s.registrarNaoComparecimento(r.id(), RESP).status()
        );

        assertEquals(
            StatusReserva.APROVADA,
            s.criar(cmd("13:00", "14:00", 1L), BIA).status()
        );
    }

    @Test
    void reservaInexistenteLancaNaoEncontrada() {
        assertThrows(ReservaNaoEncontradaException.class, () -> ambiente().servico().cancelar(42, ANA));
    }

    // ---------- edição ----------

    @Test
    void ct19_edicaoDetectaConflitoMasIgnoraAPropriaReserva() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        Reserva minha = s.criar(cmd("09:00", "10:00", 1L), ANA);
        s.criar(cmd("11:00", "12:00", 1L), BIA);

        assertThrows(ConflitoDisponibilidadeException.class, () -> s.editar(minha.id(), cmd("10:30", "11:30", 1L), ANA));
        Reserva ok = s.editar(minha.id(), cmd("09:30", "10:30", 1L), ANA); // sobrepõe o próprio horário antigo
        assertEquals(intervalo("09:30", "10:30"), ok.intervalo());
        assertEquals(intervalo("09:30", "10:30"), amb.armazem.get(minha.id()).intervalo());
    }

    @Test
    void edicaoBloqueiaAUniaoOrdenadaDeRecursosAntigosENovos() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        Reserva r = s.criar(cmd("09:00", "10:00", 20L, 30L), ANA);
        amb.ordensDeBloqueio.clear();

        s.editar(r.id(), cmd("09:00", "10:00", 30L, 10L), ANA);

        assertEquals(List.of(10L, 20L, 30L), amb.ordensDeBloqueio.get(0));
        assertEquals(List.of(10L, 30L), amb.armazem.get(r.id()).recursoIds());
        assertEquals(AcaoReserva.EDICAO, amb.auditorias.get(amb.auditorias.size() - 1).acao());
    }

    @Test
    void edicaoDeReservaAlheiaOuQueMudaAprovacaoENegadaSemEfeitos() {
        AmbienteFake amb = ambiente().comRecursoRestrito(5);
        ReservaService s = amb.servico();
        Reserva r = s.criar(cmd("09:00", "10:00", 1L), ANA);
        int auditorias = amb.auditorias.size();

        assertThrows(OperacaoNaoPermitidaException.class, () -> s.editar(r.id(), cmd("09:00", "10:00", 1L), BIA));
        assertThrows(OperacaoNaoPermitidaException.class, () -> s.editar(r.id(), cmd("09:00", "10:00", 1L, 5L), ANA));

        assertEquals(auditorias, amb.auditorias.size());
        assertEquals(List.of(1L), amb.armazem.get(r.id()).recursoIds());
    }

    @Test
    void conjuntoAlteradoAbortaSemAdquirirNovosLocks() {
        AmbienteFake amb = ambiente();
        ReservaService s = amb.servico();
        Reserva r = s.criar(cmd("09:00", "10:00", 1L), ANA);
        amb.ordensDeBloqueio.clear();
        // outra transação troca os recursos logo depois da primeira leitura (criar não lê pelo repositório)
        amb.aposPrimeiraBusca = () -> amb.armazem.put(r.id(),
                new Reserva(r.id(), r.solicitanteId(), r.intervalo(), List.of(1L, 2L), false, r.status(), null));

        assertThrows(br.senac.recursos.reserva.dominio.AlteracaoConcorrenteException.class, () -> s.cancelar(r.id(), ANA));
        assertEquals(List.of(List.of(1L)), amb.ordensDeBloqueio);
        assertEquals(StatusReserva.APROVADA, amb.armazem.get(r.id()).status());
    }
}
