package br.senac.recursos.reserva.aplicacao;

import static org.junit.jupiter.api.Assertions.assertEquals;

import br.senac.recursos.recurso.infraestrutura.Banco;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.infraestrutura.ReservaFilaMysql;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@JdbcTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(ReservaFilaMysql.class)
@Testcontainers
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class ReservaFilaMysqlIT extends ReservaFilaPortContrato {

  @Container static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4");

  @DynamicPropertySource
  static void banco(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
    registry.add("spring.datasource.username", MYSQL::getUsername);
    registry.add("spring.datasource.password", MYSQL::getPassword);
  }

  @Autowired JdbcTemplate jdbc;
  @Autowired ReservaFilaPort fila;

  @BeforeEach
  void limparDados() {
    // O container é exclusivo desta suíte. Cada consulta abre sua própria transação.
    for (String tabela :
        List.of(
            "reserva_recursos",
            "reservas",
            "salas",
            "professores",
            "materiais",
            "recursos",
            "usuarios")) {
      jdbc.update("DELETE FROM " + tabela);
    }
  }

  @Override
  protected ReservaFilaPort portaComDados(List<ItemFilaAprovacao> dados) {
    var solicitantes = new HashSet<Long>();
    var recursos = new HashSet<Long>();
    for (var item : dados) {
      var reserva = item.reserva();
      if (solicitantes.add(reserva.solicitanteId())) {
        jdbc.update(
            "INSERT INTO usuarios(id,nome,email,senha_hash) VALUES(?,?,?,?)",
            reserva.solicitanteId(),
            "Nome privado",
            "privado" + reserva.solicitanteId() + "@local",
            "hash-de-teste");
      }
      jdbc.update(
          """
          INSERT INTO reservas(id,solicitante_id,inicio_utc,fim_utc,restrita,status,motivo_decisao)
          VALUES(?,?,?,?,?,?,?)
          """,
          reserva.id(),
          reserva.solicitanteId(),
          Banco.utc(reserva.intervalo().inicio()),
          Banco.utc(reserva.intervalo().fim()),
          reserva.restrita(),
          reserva.status().name(),
          reserva.motivoDecisao());
      for (var recurso : item.recursos()) {
        if (recursos.add(recurso.id())) {
          gravarRecurso(recurso);
        }
        jdbc.update(
            "INSERT INTO reserva_recursos(reserva_id,recurso_id) VALUES(?,?)",
            reserva.id(),
            recurso.id());
      }
    }
    return fila;
  }

  private void gravarRecurso(RecursoResumo recurso) {
    jdbc.update(
        "INSERT INTO recursos(id,tipo,codigo) VALUES(?,?,?)",
        recurso.id(),
        recurso.tipo(),
        recurso.identificacao());
    switch (recurso.tipo()) {
      case "SALA" ->
          jdbc.update(
              "INSERT INTO salas(recurso_id,capacidade,localizacao,tipo_sala)"
                  + " VALUES(?,20,'A','LAB')",
              recurso.id());
      case "PROFESSOR" ->
          jdbc.update(
              "INSERT INTO professores(recurso_id,nome) VALUES(?,?)",
              recurso.id(),
              recurso.identificacao());
      case "MATERIAL" ->
          jdbc.update(
              "INSERT INTO materiais(recurso_id,numero_patrimonio,descricao,condicao)"
                  + " VALUES(?,?,?,'BOM')",
              recurso.id(),
              recurso.patrimonio(),
              recurso.identificacao());
      default -> throw new IllegalArgumentException("Tipo de recurso inválido para o teste");
    }
  }

  @Test
  void filtraPeloMaterialMasPreservaTodosOsVinculosEIdentificaSolicitantePorId() {
    var periodo =
        new IntervaloReserva(
            Instant.parse("2026-11-10T14:00:00Z"), Instant.parse("2026-11-10T15:00:00Z"));
    var reserva = Reserva.solicitar(7, periodo, List.of(1L, 2L, 3L), true).comId(99);
    var solicitante = new SolicitanteResumo(7, "Solicitante 7");
    var recursos =
        List.of(
            new RecursoResumo(1, "SALA", "Laboratório", null),
            new RecursoResumo(2, "PROFESSOR", "Docente", null),
            new RecursoResumo(3, "MATERIAL", "Projetor", "PAT-3"));
    var item = new ItemFilaAprovacao(reserva, solicitante, recursos);
    var comumSolicitada = Reserva.solicitar(7, periodo, List.of(3L), false).comId(100);
    var itemComum =
        new ItemFilaAprovacao(comumSolicitada, solicitante, List.of(recursos.getLast()));

    var pagina =
        portaComDados(List.of(item, itemComum))
            .buscarFila(new FiltroFilaAprovacao(periodo, 3L, 0, 1));

    assertEquals(1L, pagina.total());
    assertEquals(List.of(item), pagina.itens());
  }
}
