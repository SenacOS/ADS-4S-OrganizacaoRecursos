package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.AcaoReserva;
import java.time.Instant;

/** Dados mínimos de auditoria (RF10). {@code antes} é nulo na criação. */
public record RegistroAuditoria(
        String entidade,
        long entidadeId,
        long atorId,
        AcaoReserva acao,
        String antes,
        String depois,
        String correlacaoId,
        Instant momento) {
}
