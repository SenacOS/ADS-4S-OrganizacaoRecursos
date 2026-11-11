package br.senac.recursos.movimentacao.dominio;

import java.time.Instant;

public record Movimentacao(
    long id,
    long recursoId,
    long reservaId,
    long responsavelId,
    Instant retiradoEm,
    Instant devolvidoEm,
    Long devolvidoPor,
    Instant fimPrevisto,
    long atrasoSegundos) {}
