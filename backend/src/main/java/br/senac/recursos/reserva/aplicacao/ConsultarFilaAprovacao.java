package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.shared.Pagina;

public class ConsultarFilaAprovacao {

    private final ReservaFilaPort fila;

    public ConsultarFilaAprovacao(ReservaFilaPort fila) {
        this.fila = fila;
    }

    public Pagina<ItemFilaAprovacao> executar(FiltroFilaAprovacao filtro, AtorReserva ator) {
        throw new UnsupportedOperationException("não implementado");
    }
}
