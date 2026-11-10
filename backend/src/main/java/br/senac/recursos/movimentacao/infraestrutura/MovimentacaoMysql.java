package br.senac.recursos.movimentacao.infraestrutura;

import br.senac.recursos.movimentacao.dominio.*;
import br.senac.recursos.recurso.infraestrutura.Banco;
import br.senac.recursos.shared.ErroDominio;
import java.util.*;
import org.springframework.stereotype.Repository;

@Repository
public class MovimentacaoMysql {
  private final Banco b;

  public MovimentacaoMysql(Banco b) {
    this.b = b;
  }

  public List<Movimentacao> listar(boolean abertas) {
    return b.jdbc.query(
        "SELECT * FROM movimentacoes"
            + (abertas ? " WHERE devolvido_em IS NULL" : "")
            + " ORDER BY id",
        (r, n) ->
            new Movimentacao(
                r.getLong("id"),
                r.getLong("recurso_id"),
                r.getLong("reserva_id"),
                r.getLong("responsavel_id"),
                Banco.instante(r, "retirado_em"),
                r.getObject("devolvido_em") == null ? null : Banco.instante(r, "devolvido_em"),
                (Long) r.getObject("devolvido_por"),
                Banco.instante(r, "fim_previsto"),
                r.getLong("atraso_segundos")));
  }

  public Movimentacao obter(long id) {
    return listar(false).stream()
        .filter(m -> m.id() == id)
        .findFirst()
        .orElseThrow(ErroDominio::ausente);
  }
}
