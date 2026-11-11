package br.senac.recursos.reserva.aplicacao;

import java.util.List;

/** Verifica a implementação de referência contra o contrato; o adaptador MySQL fará o mesmo. */
class FilaEmMemoriaContratoTest extends ReservaFilaPortContrato {

    @Override
    protected ReservaFilaPort portaComDados(List<ItemFilaAprovacao> dados) {
        return new FilaEmMemoria(dados);
    }
}
