package br.senac.recursos.reserva.dominio;

/** O que torna um recurso indisponível em um intervalo. */
public enum OrigemOcupacao {
    RESERVA,
    MANUTENCAO,
    /** Material retirado e ainda não devolvido; o intervalo termina em {@code Instant.MAX}. */
    RETIRADA_ABERTA
}
