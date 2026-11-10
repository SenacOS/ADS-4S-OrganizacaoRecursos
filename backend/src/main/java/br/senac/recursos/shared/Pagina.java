package br.senac.recursos.shared;

import java.util.List;

public record Pagina<T>(List<T> itens, int pagina, int tamanho, long total) {}
