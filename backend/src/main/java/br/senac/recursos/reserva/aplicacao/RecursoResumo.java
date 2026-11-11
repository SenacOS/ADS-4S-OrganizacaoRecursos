package br.senac.recursos.reserva.aplicacao;

/** Projeção legível de um recurso da reserva. {@code patrimonio} só existe para materiais. */
public record RecursoResumo(long id, String tipo, String identificacao, String patrimonio) {
}
