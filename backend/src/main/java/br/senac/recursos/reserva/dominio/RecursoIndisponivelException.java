package br.senac.recursos.reserva.dominio;

/** Recurso desativado (HTTP 409). Conflito de agenda usa {@link ConflitoDisponibilidadeException}. */
public class RecursoIndisponivelException extends RuntimeException {

    public RecursoIndisponivelException(long id) {
        super("O recurso " + id + " está desativado e não pode ser reservado.");
    }
}
