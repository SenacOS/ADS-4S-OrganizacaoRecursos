package br.senac.recursos.recurso.infraestrutura;

import br.senac.recursos.reserva.aplicacao.*;
import br.senac.recursos.reserva.dominio.*;
import java.util.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.*;

@Repository
public class RecursosMysql implements RecursosPort {
  private final Banco b;

  public RecursosMysql(Banco b) {
    this.b = b;
  }

  @Transactional(propagation = Propagation.MANDATORY)
  public List<RecursoInfo> bloquear(List<Long> ids) {
    var ordem = ids.stream().distinct().sorted().toList();
    if (!ordem.equals(ids))
      throw new IllegalArgumentException("IDs devem estar ordenados e únicos.");
    var resultado = new ArrayList<RecursoInfo>();
    for (long id : ids) {
      var encontrados =
          b.jdbc.query(
              "SELECT id,ativo,restrito FROM recursos WHERE id=? FOR UPDATE",
              (r, n) -> new RecursoInfo(r.getLong(1), r.getBoolean(2), r.getBoolean(3)),
              id);
      if (encontrados.isEmpty()) throw new RecursoNaoEncontradoException(id);
      resultado.add(encontrados.getFirst());
    }
    return resultado;
  }
}
