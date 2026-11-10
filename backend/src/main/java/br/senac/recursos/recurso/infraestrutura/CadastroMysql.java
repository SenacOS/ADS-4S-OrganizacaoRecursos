package br.senac.recursos.recurso.infraestrutura;

import br.senac.recursos.recurso.dominio.*;
import br.senac.recursos.shared.*;
import java.util.*;
import org.springframework.stereotype.Repository;

@Repository
public class CadastroMysql {
  private final Banco b;

  public CadastroMysql(Banco b) {
    this.b = b;
  }

  public List<Recurso> todos() {
    return b.jdbc.query(
        "SELECT"
            + " r.*,s.capacidade,s.localizacao,s.tipo_sala,p.nome,m.numero_patrimonio,m.descricao,m.condicao"
            + " FROM recursos r LEFT JOIN salas s ON s.recurso_id=r.id LEFT JOIN professores p ON"
            + " p.recurso_id=r.id LEFT JOIN materiais m ON m.recurso_id=r.id ORDER BY r.id",
        (r, n) ->
            new Recurso(
                r.getLong("id"),
                new DadosRecurso(
                    TipoRecurso.valueOf(r.getString("tipo")),
                    r.getString("codigo"),
                    r.getBoolean("ativo"),
                    r.getBoolean("restrito"),
                    (Integer) r.getObject("capacidade"),
                    r.getString("localizacao"),
                    r.getString("tipo_sala"),
                    r.getString("nome"),
                    List.of(),
                    r.getString("numero_patrimonio"),
                    r.getString("descricao"),
                    r.getString("condicao")),
                null));
  }

  public Map<Long, List<String>> competencias() {
    Map<Long, List<String>> map = new HashMap<>();
    b.jdbc.query(
        "SELECT recurso_id,competencia FROM professor_competencias ORDER BY competencia",
        (org.springframework.jdbc.core.RowCallbackHandler)
            r -> map.computeIfAbsent(r.getLong(1), k -> new ArrayList<>()).add(r.getString(2)));
    return map;
  }

  public Recurso obter(long id) {
    var r =
        todos().stream().filter(x -> x.id() == id).findFirst().orElseThrow(ErroDominio::ausente);
    return preencher(r, competencias());
  }

  public Recurso preencher(Recurso r, Map<Long, List<String>> cs) {
    var d = r.dados();
    return new Recurso(
        r.id(),
        new DadosRecurso(
            d.tipo(),
            d.codigo(),
            d.ativo(),
            d.restrito(),
            d.capacidade(),
            d.localizacao(),
            d.tipoSala(),
            d.nome(),
            cs.getOrDefault(r.id(), List.of()),
            d.patrimonio(),
            d.descricao(),
            d.condicao()),
        r.disponivel());
  }

  public Recurso salvar(Long id, DadosRecurso d) {
    long rid =
        id == null
            ? b.inserir(
                "INSERT INTO recursos(tipo,codigo,ativo,restrito) VALUES(?,?,?,?)",
                d.tipo().name(),
                d.codigo(),
                d.ativo(),
                d.restrito())
            : id;
    if (id != null)
      b.jdbc.update(
          "UPDATE recursos SET codigo=?,ativo=?,restrito=? WHERE id=?",
          d.codigo(),
          d.ativo(),
          d.restrito(),
          rid);
    switch (d.tipo()) {
      case SALA ->
          b.jdbc.update(
              "INSERT INTO salas(recurso_id,capacidade,localizacao,tipo_sala) VALUES(?,?,?,?) ON"
                  + " DUPLICATE KEY UPDATE capacidade=?,localizacao=?,tipo_sala=?",
              rid,
              d.capacidade(),
              d.localizacao(),
              d.tipoSala(),
              d.capacidade(),
              d.localizacao(),
              d.tipoSala());
      case PROFESSOR -> {
        b.jdbc.update(
            "INSERT INTO professores(recurso_id,nome) VALUES(?,?) ON DUPLICATE KEY UPDATE nome=?",
            rid,
            d.nome(),
            d.nome());
        b.jdbc.update("DELETE FROM professor_competencias WHERE recurso_id=?", rid);
        for (var c : d.competencias())
          b.jdbc.update("INSERT INTO professor_competencias VALUES(?,?)", rid, c);
      }
      case MATERIAL -> {
        if (id == null)
          b.jdbc.update(
              "INSERT INTO materiais(recurso_id,numero_patrimonio,descricao,condicao)"
                  + " VALUES(?,?,?,?)",
              rid,
              d.patrimonio(),
              d.descricao(),
              d.condicao());
        else
          b.jdbc.update(
              "UPDATE materiais SET numero_patrimonio=?,descricao=?,condicao=? WHERE recurso_id=?",
              d.patrimonio(),
              d.descricao(),
              d.condicao(),
              rid);
      }
    }
    return obter(rid);
  }
}
