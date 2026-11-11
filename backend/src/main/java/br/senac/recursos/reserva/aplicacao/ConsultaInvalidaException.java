package br.senac.recursos.reserva.aplicacao;

/** Parâmetro de consulta inválido (HTTP 400). Mensagem segura para o cliente. */
public class ConsultaInvalidaException extends RuntimeException {

    public ConsultaInvalidaException(String mensagem) {
        super(mensagem);
    }
}
