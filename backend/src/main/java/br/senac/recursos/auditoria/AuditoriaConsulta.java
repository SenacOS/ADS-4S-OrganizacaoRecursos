package br.senac.recursos.auditoria;

import java.time.Instant;
import java.util.List;

/** Leitura da trilha append-only, sem operacoes de alteracao ou exclusao. */
public interface AuditoriaConsulta {
    List<Entrada> consultar(String entidade, long entidadeId);

    record Entrada(long id, String entidade, long entidadeId, long atorId,
                   String acao, String antes, String depois,
                   String correlacaoId, Instant momento) {}
}
