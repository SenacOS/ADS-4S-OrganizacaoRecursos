package br.senac.recursos.reserva.dominio;

/** Intervalo fora do funcionamento configurado pelo Administrador (HTTP 409 ou 422, a combinar). */
public class ForaDoExpedienteException extends RuntimeException {

    public ForaDoExpedienteException() {
        super("O horário solicitado está fora do funcionamento configurado.");
    }
}
