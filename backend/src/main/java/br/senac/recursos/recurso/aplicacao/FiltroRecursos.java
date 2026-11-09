package br.senac.recursos.recurso.aplicacao;

import br.senac.recursos.recurso.dominio.TipoRecurso;
import java.time.OffsetDateTime;

public record FiltroRecursos(
    TipoRecurso tipo,
    Integer capacidadeMinima,
    String localizacao,
    String competencia,
    String patrimonio,
    OffsetDateTime inicio,
    OffsetDateTime fim,
    Boolean disponivel,
    Integer pagina,
    Integer tamanho) {
  public FiltroRecursos {
    pagina = pagina == null ? 0 : pagina;
    tamanho = tamanho == null ? 20 : tamanho;
    if (pagina < 0
        || tamanho < 1
        || tamanho > 100
        || (capacidadeMinima != null && capacidadeMinima < 1))
      throw new IllegalArgumentException("Paginação ou capacidade inválida.");
    if ((inicio == null) != (fim == null) || (disponivel != null && inicio == null))
      throw new IllegalArgumentException("Informe início e fim juntos.");
    if (inicio != null && !fim.isAfter(inicio))
      throw new IllegalArgumentException("Intervalo inválido.");
  }
}
