package br.senac.recursos.reserva.dominio;

import java.util.Objects;

/** Quem executa a operação. Vem sempre do contexto autenticado, nunca do corpo da requisição. */
public record AtorReserva(long usuarioId, PapelAtor papel) {

    public AtorReserva {
        Objects.requireNonNull(papel, "papel");
    }
}
