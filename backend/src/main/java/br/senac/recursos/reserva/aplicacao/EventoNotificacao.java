package br.senac.recursos.reserva.aplicacao;

import java.time.Instant;

public record EventoNotificacao(long reservaId, TipoEventoNotificacao tipo, String correlacaoId, Instant momento) {
}
