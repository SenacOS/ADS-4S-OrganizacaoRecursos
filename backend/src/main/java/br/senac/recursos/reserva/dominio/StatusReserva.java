package br.senac.recursos.reserva.dominio;

import java.util.EnumSet;
import java.util.Set;

/**
 * Estados da reserva e transições permitidas (ADR-005).
 *
 * <p>Esta enumeração define apenas o grafo de transições. A permissão de quem pode
 * executar cada transição (dono, Responsável, Administrador) é verificada na camada
 * de serviço, com os perfis do módulo de segurança.
 */
public enum StatusReserva {
    SOLICITADA,
    APROVADA,
    EM_USO,
    CONCLUIDA,
    REJEITADA,
    CANCELADA,
    NAO_COMPARECEU;

    private Set<StatusReserva> destinos() {
        return switch (this) {
            case SOLICITADA -> EnumSet.of(APROVADA, REJEITADA, CANCELADA);
            case APROVADA -> EnumSet.of(EM_USO, CANCELADA, NAO_COMPARECEU);
            case EM_USO -> EnumSet.of(CONCLUIDA);
            case CONCLUIDA, REJEITADA, CANCELADA, NAO_COMPARECEU -> EnumSet.noneOf(StatusReserva.class);
        };
    }

    public boolean podeTransitarPara(StatusReserva destino) {
        return destino != null && destinos().contains(destino);
    }

    /** Retorna o novo estado ou lança {@link TransicaoInvalidaException}. */
    public StatusReserva transitarPara(StatusReserva destino) {
        if (!podeTransitarPara(destino)) {
            throw new TransicaoInvalidaException(this, destino);
        }
        return destino;
    }

    /** Estados que bloqueiam a agenda dos recursos (D06, ADR-005). */
    public boolean ocupaAgenda() {
        return this == SOLICITADA || this == APROVADA || this == EM_USO;
    }

    public boolean terminal() {
        return destinos().isEmpty();
    }
}
