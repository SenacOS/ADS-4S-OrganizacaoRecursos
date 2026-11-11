package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.shared.Pagina;

/** PORTA de leitura da fila de aprovação (a implementar com consulta SQL). */
public interface ReservaFilaPort {

    Pagina<ItemFilaAprovacao> buscarFila(FiltroFilaAprovacao filtro);
}
