package br.senac.recursos.recurso.dominio;

import java.util.*;

public record DadosRecurso(
    TipoRecurso tipo,
    String codigo,
    boolean ativo,
    boolean restrito,
    Integer capacidade,
    String localizacao,
    String tipoSala,
    String nome,
    List<String> competencias,
    String patrimonio,
    String descricao,
    String condicao) {
  public DadosRecurso {
    Objects.requireNonNull(tipo, "Tipo obrigatório");
    codigo = texto(codigo, 80);
    if (tipo == TipoRecurso.SALA) {
      if (capacidade == null || capacidade <= 0)
        throw new IllegalArgumentException("Capacidade deve ser positiva.");
      localizacao = texto(localizacao, 200);
      tipoSala = texto(tipoSala, 80);
    }
    if (tipo == TipoRecurso.PROFESSOR) {
      nome = texto(nome, 120);
      competencias =
          (competencias == null ? List.<String>of() : competencias)
              .stream()
                  .map(x -> texto(x, 120).toLowerCase(Locale.ROOT))
                  .distinct()
                  .sorted()
                  .toList();
    } else competencias = List.of();
    if (tipo == TipoRecurso.MATERIAL) {
      patrimonio = texto(patrimonio, 80);
      descricao = texto(descricao, 500);
      condicao = texto(condicao, 120);
    }
  }

  public static String texto(String s, int max) {
    if (s == null || s.isBlank()) throw new IllegalArgumentException("Campo obrigatório.");
    String v = s.strip().replaceAll("\s+", " ");
    if (v.length() > max) throw new IllegalArgumentException("Campo excede tamanho permitido.");
    return v;
  }
}
