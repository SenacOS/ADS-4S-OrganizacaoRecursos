package br.senac.recursos.reserva.dominio;

/** Ações que geram registro de auditoria (RF10). */
public enum AcaoReserva {
    CRIACAO,
    APROVACAO_AUTOMATICA,
    APROVACAO,
    REJEICAO,
    CANCELAMENTO,
    EDICAO,
    INICIO_DE_USO,
    CONCLUSAO,
    NAO_COMPARECIMENTO
}
