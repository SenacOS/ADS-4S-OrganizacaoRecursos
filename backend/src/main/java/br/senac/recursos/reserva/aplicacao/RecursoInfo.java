package br.senac.recursos.reserva.aplicacao;

/** Dados do recurso lidos já sob lock. */
public record RecursoInfo(long id, boolean ativo, boolean restrito) {
}
