package br.senac.recursos.reserva.aplicacao;

/** Projeção mínima do solicitante para a fila (sem e-mail, contato ou outros dados pessoais). */
public record SolicitanteResumo(long usuarioId, String identificacao) {

    public SolicitanteResumo {
        if (identificacao == null || identificacao.isBlank()) {
            throw new IllegalStateException("A identificação do solicitante é obrigatória.");
        }
    }
}
