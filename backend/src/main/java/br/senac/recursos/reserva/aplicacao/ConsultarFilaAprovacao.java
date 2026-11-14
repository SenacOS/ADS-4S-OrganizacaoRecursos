package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.shared.Pagina;
import java.util.Objects;

/**
 * Fila de aprovação (RF07): somente o Responsável lê reservas restritas em SOLICITADA.
 * Filtros, ordenação e paginação são responsabilidade da porta (no banco); este caso de uso
 * garante a autorização e recusa respostas que violem o contrato.
 */
public class ConsultarFilaAprovacao {

    private final ReservaFilaPort fila;

    public ConsultarFilaAprovacao(ReservaFilaPort fila) {
        this.fila = fila;
    }

    public Pagina<ItemFilaAprovacao> executar(FiltroFilaAprovacao filtro, AtorReserva ator) {
        Objects.requireNonNull(filtro, "filtro");
        Objects.requireNonNull(ator, "ator");
        if (ator.papel() != PapelAtor.RESPONSAVEL) {
            throw new OperacaoNaoPermitidaException("Somente o Responsável consulta a fila de aprovação.");
        }
        Pagina<ItemFilaAprovacao> pagina = fila.buscarFila(filtro, ator.usuarioId());
        validar(pagina, filtro);
        return pagina;
    }

    private static void validar(Pagina<ItemFilaAprovacao> pagina, FiltroFilaAprovacao filtro) {
        if (envelopeForaDoContrato(pagina, filtro)) {
            throw new IllegalStateException("A porta da fila devolveu uma página fora do contrato.");
        }
        if (pagina.itens().stream().anyMatch(ConsultarFilaAprovacao::naoEPendenteRestrita)) {
            throw new IllegalStateException("A fila só pode conter reservas restritas em SOLICITADA.");
        }
    }

    private static boolean envelopeForaDoContrato(Pagina<ItemFilaAprovacao> pagina, FiltroFilaAprovacao filtro) {
        return pagina == null
                || pagina.pagina() != filtro.pagina()
                || pagina.tamanho() != filtro.tamanho()
                || pagina.itens().size() > filtro.tamanho()
                || pagina.total() < pagina.itens().size();
    }

    private static boolean naoEPendenteRestrita(ItemFilaAprovacao item) {
        return item.reserva().status() != StatusReserva.SOLICITADA || !item.reserva().restrita();
    }
}
