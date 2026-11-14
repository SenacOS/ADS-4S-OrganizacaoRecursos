package br.senac.recursos.reserva.api;

/** Corpo padrão de erro da API (contrato: codigo, mensagem, correlationId). */
public record ErroApi(String codigo, String mensagem, String correlationId) {
}
