package br.senac.recursos.reserva.dominio;

/** Recurso inexistente (HTTP 404). Lançada pelo adaptador de lock ao não achar o ID. */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(long id) {
        super("Recurso não encontrado: " + id);
    }
}
