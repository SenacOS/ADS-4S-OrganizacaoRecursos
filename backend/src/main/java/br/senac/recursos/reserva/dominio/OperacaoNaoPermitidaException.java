package br.senac.recursos.reserva.dominio;

/** Ator sem permissão ou operação proibida pela regra de negócio (HTTP 403). */
public class OperacaoNaoPermitidaException extends RuntimeException {

    public OperacaoNaoPermitidaException(String mensagem) {
        super(mensagem);
    }
}
