package br.senac.recursos.reserva.dominio;

/**
 * Perfis relevantes para as regras de reserva (ADR-004).
 * O módulo de segurança deve converter seus perfis para este enum ao montar o {@link AtorReserva}.
 */
public enum PapelAtor {
    SOLICITANTE,
    RESPONSAVEL,
    ADMINISTRADOR
}
