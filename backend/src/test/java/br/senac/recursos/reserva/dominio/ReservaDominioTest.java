package br.senac.recursos.reserva.dominio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Regras de domínio da Reserva: permissões, estados e imutabilidade (RF04, RF07). */
class ReservaDominioTest {

    private static final AtorReserva DONA = new AtorReserva(1, PapelAtor.SOLICITANTE);
    private static final AtorReserva OUTRO = new AtorReserva(2, PapelAtor.SOLICITANTE);
    private static final AtorReserva RESP = new AtorReserva(3, PapelAtor.RESPONSAVEL);
    private static final AtorReserva ADMIN = new AtorReserva(4, PapelAtor.ADMINISTRADOR);

    private static final IntervaloReserva INTERVALO = new IntervaloReserva(
            Instant.parse("2026-11-10T16:00:00Z"), Instant.parse("2026-11-10T17:00:00Z"));

    private static Reserva restritaSolicitada() {
        return Reserva.solicitar(1, INTERVALO, List.of(30L, 10L, 10L), true).comId(1);
    }

    private static Reserva comumSolicitada() {
        return Reserva.solicitar(1, INTERVALO, List.of(10L), false).comId(2);
    }

    @Test
    void recursosSaoOrdenadosEsemDuplicatas() {
        assertEquals(List.of(10L, 30L), restritaSolicitada().recursoIds());
    }

    @Test
    void reservaSemRecursosEInvalida() {
        assertThrows(IllegalArgumentException.class, () -> Reserva.solicitar(1, INTERVALO, List.of(), false));
        assertThrows(IllegalArgumentException.class, () -> Reserva.solicitar(1, INTERVALO, null, false));
    }

    @Test
    void comumEAutoaprovada() {
        Reserva r = comumSolicitada().aprovarAutomaticamente();
        assertEquals(StatusReserva.APROVADA, r.status());
    }

    @Test
    void restritaNaoPodeSerAutoaprovada() {
        assertThrows(OperacaoNaoPermitidaException.class, () -> restritaSolicitada().aprovarAutomaticamente());
    }

    @Test
    void ct14_somenteResponsavelAprovaRestrita() {
        Reserva r = restritaSolicitada();
        assertThrows(OperacaoNaoPermitidaException.class, () -> r.aprovar(DONA));
        assertThrows(OperacaoNaoPermitidaException.class, () -> r.aprovar(ADMIN));
        assertEquals(StatusReserva.APROVADA, r.aprovar(RESP).status());
        assertEquals(StatusReserva.SOLICITADA, r.status());
    }

    @Test
    void rejeitarExigeResponsavelEmotivo() {
        Reserva r = restritaSolicitada();
        assertThrows(OperacaoNaoPermitidaException.class, () -> r.rejeitar(DONA, "x"));
        assertThrows(IllegalArgumentException.class, () -> r.rejeitar(RESP, "  "));
        Reserva rejeitada = r.rejeitar(RESP, " sala em reforma ");
        assertEquals(StatusReserva.REJEITADA, rejeitada.status());
        assertEquals("sala em reforma", rejeitada.motivoDecisao());
        assertFalse(rejeitada.status().ocupaAgenda());
    }

    @Test
    void aprovarDuasVezesEInvalido() {
        Reserva aprovada = restritaSolicitada().aprovar(RESP);
        assertThrows(TransicaoInvalidaException.class, () -> aprovada.aprovar(RESP));
    }

    @Test
    void cancelarPeloDonoPeloAdminENuncaPorOutro() {
        Reserva r = comumSolicitada().aprovarAutomaticamente();
        assertThrows(OperacaoNaoPermitidaException.class, () -> r.cancelar(OUTRO));
        assertThrows(OperacaoNaoPermitidaException.class, () -> r.cancelar(RESP));
        assertEquals(StatusReserva.CANCELADA, r.cancelar(DONA).status());
        assertEquals(StatusReserva.CANCELADA, r.cancelar(ADMIN).status());
    }

    @Test
    void emUsoNaoCancela() {
        Reserva emUso = comumSolicitada()
                .aprovarAutomaticamente()
                .iniciarUso(RESP);

        assertThrows(
            TransicaoInvalidaException.class,
            () -> emUso.cancelar(DONA)
        );

        assertTrue(emUso.status().ocupaAgenda());

        // Q1: Administrador não pode concluir a utilização.
        assertThrows(
            OperacaoNaoPermitidaException.class,
            () -> emUso.concluir(ADMIN)
        );

        // O Responsável continua podendo concluir.
        assertEquals(
            StatusReserva.CONCLUIDA,
            emUso.concluir(RESP).status()
        );
    }

    @Test
    void iniciarConcluirEAusenciaExigemOperador() {
        Reserva aprovada = comumSolicitada().aprovarAutomaticamente();
        assertThrows(OperacaoNaoPermitidaException.class, () -> aprovada.iniciarUso(DONA));
        assertThrows(OperacaoNaoPermitidaException.class, () -> aprovada.registrarNaoComparecimento(DONA));
        assertEquals(StatusReserva.NAO_COMPARECEU, aprovada.registrarNaoComparecimento(RESP).status());
    }

    @Test
    void permissaoEVerificadaAntesDoEstado() {
        Reserva concluida = comumSolicitada().aprovarAutomaticamente().iniciarUso(RESP).concluir(RESP);
        assertThrows(OperacaoNaoPermitidaException.class, () -> concluida.cancelar(OUTRO));
        assertThrows(TransicaoInvalidaException.class, () -> concluida.cancelar(DONA));
    }

    @Test
    void reagendarSomenteDonoEmEstadoEditavelSemMudarAprovacao() {
        Reserva comum = comumSolicitada().aprovarAutomaticamente();
        IntervaloReserva novo = new IntervaloReserva(
                Instant.parse("2026-11-10T18:00:00Z"), Instant.parse("2026-11-10T19:00:00Z"));

        Reserva editada = comum.reagendar(DONA, novo, List.of(11L, 10L), false);
        assertEquals(novo, editada.intervalo());
        assertEquals(List.of(10L, 11L), editada.recursoIds());
        assertEquals(StatusReserva.APROVADA, editada.status());

        assertThrows(OperacaoNaoPermitidaException.class, () -> comum.reagendar(OUTRO, novo, List.of(10L), false));
        assertThrows(OperacaoNaoPermitidaException.class, () -> comum.reagendar(DONA, novo, List.of(10L), true));

        Reserva restritaAprovada = restritaSolicitada().aprovar(RESP);
        assertThrows(OperacaoNaoPermitidaException.class,
                () -> restritaAprovada.reagendar(DONA, novo, List.of(10L), true));
        Reserva emUso = comum.iniciarUso(RESP);
        assertThrows(OperacaoNaoPermitidaException.class, () -> emUso.reagendar(DONA, novo, List.of(10L), false));
    }

    @Test
    void resumoNaoExpoeDadosPessoais() {
        String resumo = comumSolicitada().resumo();
        assertTrue(resumo.contains("recursos=[10]"));
        assertNull(comumSolicitada().motivoDecisao());
    }
}
