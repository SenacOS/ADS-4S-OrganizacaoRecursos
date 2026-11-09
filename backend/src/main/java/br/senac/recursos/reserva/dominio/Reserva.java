package br.senac.recursos.reserva.dominio;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

/**
 * Reserva imutável: cada operação devolve uma nova instância (facilita testes e auditoria).
 * Valida permissão primeiro e estado depois; nenhum método grava nada.
 *
 * <p>Regras marcadas PROPOSTO ainda dependem de decisão da equipe (ver relatório do módulo).
 */
public record Reserva(
        Long id,
        long solicitanteId,
        IntervaloReserva intervalo,
        List<Long> recursoIds,
        boolean restrita,
        StatusReserva status,
        String motivoDecisao) {

    public Reserva {
        Objects.requireNonNull(intervalo, "intervalo");
        Objects.requireNonNull(status, "status");
        if (recursoIds == null || recursoIds.isEmpty()) {
            throw new IllegalArgumentException("Informe ao menos um recurso.");
        }
        recursoIds = recursoIds.stream().distinct().sorted().toList();
    }

    public static Reserva solicitar(long solicitanteId, IntervaloReserva intervalo,
                                    Collection<Long> recursoIds, boolean restrita) {
        List<Long> ids = recursoIds == null ? null : new ArrayList<>(recursoIds);
        return new Reserva(null, solicitanteId, intervalo, ids, restrita, StatusReserva.SOLICITADA, null);
    }

    public Reserva comId(long novoId) {
        return new Reserva(novoId, solicitanteId, intervalo, recursoIds, restrita, status, motivoDecisao);
    }

    /** Reserva comum: SOLICITADA vira APROVADA na mesma transação (D07). */
    public Reserva aprovarAutomaticamente() {
        if (restrita) {
            throw new OperacaoNaoPermitidaException("Reserva com recurso restrito exige aprovação do Responsável.");
        }
        return comStatus(status.transitarPara(StatusReserva.APROVADA), null);
    }

    public Reserva aprovar(AtorReserva ator) {
        exigirPapel(ator, PapelAtor.RESPONSAVEL, "Somente o Responsável aprova reservas de recursos restritos.");
        return comStatus(status.transitarPara(StatusReserva.APROVADA), null);
    }

    public Reserva rejeitar(AtorReserva ator, String motivo) {
        exigirPapel(ator, PapelAtor.RESPONSAVEL, "Somente o Responsável rejeita reservas de recursos restritos.");
        if (motivo == null || motivo.isBlank()) {
            throw new IllegalArgumentException("Informe o motivo da rejeição.");
        }
        return comStatus(status.transitarPara(StatusReserva.REJEITADA), motivo.strip());
    }

    /** Dono ou Administrador. EM_USO não cancela (matriz de estados). */
    public Reserva cancelar(AtorReserva ator) {
        Objects.requireNonNull(ator, "ator");
        boolean dono = ator.usuarioId() == solicitanteId;
        if (!dono && ator.papel() != PapelAtor.ADMINISTRADOR) {
            throw new OperacaoNaoPermitidaException("Você não pode cancelar esta reserva.");
        }
        return comStatus(status.transitarPara(StatusReserva.CANCELADA), motivoDecisao);
    }

    /** PROPOSTO: quem inicia, conclui e marca ausência é Responsável ou Administrador. */
    public Reserva iniciarUso(AtorReserva ator) {
        exigirOperador(ator);
        return comStatus(status.transitarPara(StatusReserva.EM_USO), motivoDecisao);
    }

    public Reserva concluir(AtorReserva ator) {
        exigirOperador(ator);
        return comStatus(status.transitarPara(StatusReserva.CONCLUIDA), motivoDecisao);
    }

    public Reserva registrarNaoComparecimento(AtorReserva ator) {
        exigirOperador(ator);
        return comStatus(status.transitarPara(StatusReserva.NAO_COMPARECEU), motivoDecisao);
    }

    /**
     * Alteração de horário/recursos. PROPOSTO: só o dono; só em SOLICITADA ou em APROVADA comum;
     * não pode mudar a necessidade de aprovação (a matriz não prevê APROVADA -> SOLICITADA).
     */
    public Reserva reagendar(AtorReserva ator, IntervaloReserva novoIntervalo,
                             Collection<Long> novosRecursos, boolean novaRestrita) {
        Objects.requireNonNull(ator, "ator");
        if (ator.usuarioId() != solicitanteId) {
            throw new OperacaoNaoPermitidaException("Somente o solicitante pode alterar a reserva.");
        }
        boolean editavel = status == StatusReserva.SOLICITADA
                || (status == StatusReserva.APROVADA && !restrita);
        if (!editavel) {
            throw new OperacaoNaoPermitidaException("A reserva não pode ser alterada no estado " + status + ".");
        }
        if (novaRestrita != restrita) {
            throw new OperacaoNaoPermitidaException(
                    "A alteração mudaria a necessidade de aprovação; cancele e crie uma nova reserva.");
        }
        return new Reserva(id, solicitanteId, novoIntervalo, new ArrayList<>(novosRecursos),
                restrita, status, motivoDecisao);
    }

    public String resumo() {
        return "status=" + status + "; inicio=" + intervalo.inicio() + "; fim=" + intervalo.fim()
                + "; recursos=" + recursoIds;
    }

    private Reserva comStatus(StatusReserva novo, String motivo) {
        return new Reserva(id, solicitanteId, intervalo, recursoIds, restrita, novo, motivo);
    }

    private static void exigirPapel(AtorReserva ator, PapelAtor exigido, String mensagem) {
        Objects.requireNonNull(ator, "ator");
        if (ator.papel() != exigido) {
            throw new OperacaoNaoPermitidaException(mensagem);
        }
    }

    private static void exigirOperador(AtorReserva ator) {
        Objects.requireNonNull(ator, "ator");
        if (ator.papel() != PapelAtor.RESPONSAVEL && ator.papel() != PapelAtor.ADMINISTRADOR) {
            throw new OperacaoNaoPermitidaException("Operação restrita ao Responsável ou Administrador.");
        }
    }
}
