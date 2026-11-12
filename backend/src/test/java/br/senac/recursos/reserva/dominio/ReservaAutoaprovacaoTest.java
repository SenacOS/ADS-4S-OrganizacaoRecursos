package br.senac.recursos.reserva.dominio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import br.senac.recursos.reserva.aplicacao.AmbienteFake;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Q3: um usuário não aprova reserva restrita da qual é solicitante, mesmo sendo RESPONSAVEL. */
class ReservaAutoaprovacaoTest {

    private static final long SOLICITANTE = 10L;
    private static final long OUTRO_RESPONSAVEL = 20L;

    private static Reserva restritaPendente() {
        return Reserva.solicitar(SOLICITANTE, AmbienteFake.intervalo("10:00", "11:00"), List.of(1L), true);
    }

    @Test
    void responsavelNaoAprovaAPropriaReserva() {
        Reserva reserva = restritaPendente();
        AtorReserva proprio = new AtorReserva(SOLICITANTE, PapelAtor.RESPONSAVEL);

        assertThrows(OperacaoNaoPermitidaException.class, () -> reserva.aprovar(proprio));
        assertEquals(StatusReserva.SOLICITADA, reserva.status());
    }

    @Test
    void outroResponsavelAprova() {
        Reserva aprovada = restritaPendente().aprovar(new AtorReserva(OUTRO_RESPONSAVEL, PapelAtor.RESPONSAVEL));

        assertEquals(StatusReserva.APROVADA, aprovada.status());
    }

    @Test
    void administradorContinuaSemPoderAprovar() {
        Reserva reserva = restritaPendente();
        AtorReserva admin = new AtorReserva(OUTRO_RESPONSAVEL, PapelAtor.ADMINISTRADOR);

        assertThrows(OperacaoNaoPermitidaException.class, () -> reserva.aprovar(admin));
    }
}
