package br.senac.recursos.reserva.dominio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import br.senac.recursos.reserva.aplicacao.AmbienteFake;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

/** Q1: somente RESPONSAVEL inicia, conclui e registra não comparecimento. */
class ReservaOperacoesResponsavelTest {

    private static final long DONO = 10L;
    private static final AtorReserva RESPONSAVEL = new AtorReserva(20L, PapelAtor.RESPONSAVEL);

    private static Reserva comumAprovada() {
        return Reserva.solicitar(DONO, AmbienteFake.intervalo("10:00", "11:00"), List.of(1L), false)
                .aprovarAutomaticamente();
    }

    @Test
    void responsavelExecutaAsTresTransicoes() {
        assertEquals(StatusReserva.EM_USO, comumAprovada().iniciarUso(RESPONSAVEL).status());
        assertEquals(StatusReserva.CONCLUIDA, comumAprovada().iniciarUso(RESPONSAVEL).concluir(RESPONSAVEL).status());
        assertEquals(StatusReserva.NAO_COMPARECEU,
                comumAprovada().registrarNaoComparecimento(RESPONSAVEL).status());
    }

    @ParameterizedTest
    @EnumSource(value = PapelAtor.class, names = "RESPONSAVEL", mode = EnumSource.Mode.EXCLUDE)
    void outrosPapeisNaoIniciamNemRegistramAusencia(PapelAtor papel) {
        AtorReserva ator = new AtorReserva(99L, papel);
        Reserva reserva = comumAprovada();

        assertThrows(OperacaoNaoPermitidaException.class, () -> reserva.iniciarUso(ator));
        assertThrows(OperacaoNaoPermitidaException.class, () -> reserva.registrarNaoComparecimento(ator));
    }

    @ParameterizedTest
    @EnumSource(value = PapelAtor.class, names = "RESPONSAVEL", mode = EnumSource.Mode.EXCLUDE)
    void outrosPapeisNaoConcluem(PapelAtor papel) {
        Reserva emUso = comumAprovada().iniciarUso(RESPONSAVEL);
        AtorReserva ator = new AtorReserva(99L, papel);

        assertThrows(OperacaoNaoPermitidaException.class, () -> emUso.concluir(ator));
    }

    @Test
    void donoSolicitanteNaoExecutaTransicaoOperacional() {
        AtorReserva dono = new AtorReserva(DONO, PapelAtor.SOLICITANTE);

        assertThrows(OperacaoNaoPermitidaException.class, () -> comumAprovada().iniciarUso(dono));
    }
}
