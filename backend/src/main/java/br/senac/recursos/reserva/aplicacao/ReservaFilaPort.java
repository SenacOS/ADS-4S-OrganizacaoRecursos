package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.shared.Pagina;

/** PORTA de leitura da fila de aprovação (a implementar com consulta SQL). */
public interface ReservaFilaPort {

    /**
     * Acesso legado sem usuário: usado somente em testes de contrato da porta.
     * NUNCA expor diretamente por HTTP.
     */
    @Deprecated
    Pagina<ItemFilaAprovacao> buscarFila(FiltroFilaAprovacao filtro);

    /** Fila segura: o ID vem do contexto autenticado e o SQL verifica vínculos. */
    default Pagina<ItemFilaAprovacao> buscarFila(FiltroFilaAprovacao filtro, long responsavelId) {
        throw new br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException(
                "Adaptador de fila sem suporte a escopo de responsável.");
    }
}
