package br.senac.recursos.item18;

import static org.junit.jupiter.api.Assertions.*;

import br.senac.recursos.movimentacao.aplicacao.*;
import br.senac.recursos.movimentacao.dominio.*;
import br.senac.recursos.movimentacao.infraestrutura.*;
import br.senac.recursos.recurso.aplicacao.*;
import br.senac.recursos.recurso.dominio.*;
import br.senac.recursos.recurso.infraestrutura.*;
import br.senac.recursos.reserva.aplicacao.*;
import br.senac.recursos.reserva.dominio.*;
import br.senac.recursos.reserva.infraestrutura.*;
import br.senac.recursos.shared.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.*;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.*;

@SpringBootTest
@Testcontainers
@Import(Item18MysqlIT.Fixtures.class)
class Item18MysqlIT {
  @Container static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry r) {
    r.add("spring.datasource.url", mysql::getJdbcUrl);
    r.add("spring.datasource.username", mysql::getUsername);
    r.add("spring.datasource.password", mysql::getPassword);
  }

  static final Instant NOW = Instant.parse("2026-11-10T15:30:00Z");
  static final AtorReserva ADMIN = new AtorReserva(1, PapelAtor.ADMINISTRADOR),
      RESP = new AtorReserva(2, PapelAtor.RESPONSAVEL),
      SOL = new AtorReserva(3, PapelAtor.SOLICITANTE);

  @TestConfiguration
  static class Fixtures {
    @Bean
    @Primary
    Clock testeClock() {
      return Clock.fixed(NOW, ZoneOffset.UTC);
    }

    @Bean
    EventosDominioPort eventos(JdbcTemplate j) {
      return e -> {
        j.update("INSERT INTO eventos_teste(acao) VALUES(?)", e.acao());
        if (e.depois() != null && e.depois().contains("FALHAR"))
          throw new IllegalStateException(
              "falha injetada apÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³s gravaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o");
      };
    }

    @Bean
    AuditoriaPort auditoria(JdbcTemplate j) {
      return e -> j.update("INSERT INTO eventos_teste(acao) VALUES(?)", e.acao().name());
    }

    @Bean
    NotificacaoPort notificacao() {
      return e -> {};
    }
  }

  @Autowired JdbcTemplate j;
  @Autowired RecursoService recursos;
  @Autowired MovimentacaoService movimentos;
  @Autowired ReservaService reservas;
  @Autowired RecursosPort locks;
  @Autowired PlatformTransactionManager tm;

  @BeforeEach
  void limpar() {
    j.execute(
        "CREATE TABLE IF NOT EXISTS eventos_teste(id BIGINT AUTO_INCREMENT PRIMARY KEY,acao"
            + " VARCHAR(80)) ENGINE=InnoDB");
    for (String t :
        List.of(
            "conflitos_evitados",
            "movimentacoes",
            "bloqueios_recursos",
            "reserva_recursos",
            "reservas",
            "professor_competencias",
            "salas",
            "professores",
            "materiais",
            "recursos",
            "horarios_funcionamento",
            "eventos_teste",
            "usuarios")) j.update("DELETE FROM " + t);
    for (int id = 1; id <= 3; id++)
      j.update(
          "INSERT INTO usuarios(id,nome,email,senha_hash) VALUES(?,?,?,?)",
          id,
          "Teste",
          "teste" + id + "@local",
          "hash");
    recursos.substituirExpediente(
        List.of(
            new JanelaFuncionamento(DayOfWeek.TUESDAY, LocalTime.of(7, 0), LocalTime.of(22, 0))),
        ADMIN);
  }

  static DadosRecurso material(String codigo, String patrimonio) {
    return new DadosRecurso(
        TipoRecurso.MATERIAL,
        codigo,
        true,
        false,
        null,
        null,
        null,
        null,
        List.of(),
        patrimonio,
        "Material",
        "BOM");
  }

  static IntervaloReserva intervalo() {
    return new IntervaloReserva(NOW.minusSeconds(1800), NOW.plusSeconds(1800));
  }

  Reserva reservar(long... ids) {
    return reservas.criar(
        new ComandoReserva(intervalo(), Arrays.stream(ids).boxed().toList()), SOL);
  }

  @Test
  void migracaoIntegridadeRollbackETipos() {
    long id = recursos.salvar(null, material("M1", "P1"), ADMIN).id();
    assertThrows(
        org.springframework.dao.DataIntegrityViolationException.class,
        () -> recursos.salvar(null, material("M2", "P1"), ADMIN));
    assertEquals(1, j.queryForObject("SELECT COUNT(*) FROM recursos", Integer.class));
    assertThrows(
        org.springframework.dao.DataIntegrityViolationException.class,
        () ->
            j.update(
                "INSERT INTO salas(recurso_id,capacidade,localizacao,tipo_sala)"
                    + " VALUES(?,10,'A','A')",
                id));
    assertThrows(
        IllegalStateException.class, () -> recursos.salvar(null, material("FALHAR", "P2"), ADMIN));
    assertEquals(1, j.queryForObject("SELECT COUNT(*) FROM materiais", Integer.class));
  }

  @Test
  void retiradaMantemIndisponivelEDevolucaoRespeitaAgenda() {
    long id = recursos.salvar(null, material("M", "P"), ADMIN).id();
    var r = reservar(id);
    var m = movimentos.retirar(r.id(), id, RESP);
    assertThrows(ErroDominio.class, () -> movimentos.retirar(r.id(), id, RESP));
    assertThrows(ErroDominio.class, () -> recursos.desativar(id, ADMIN));
    var futuro =
        new FiltroRecursos(
            null,
            null,
            null,
            null,
            null,
            NOW.plusSeconds(3600).atOffset(ZoneOffset.UTC),
            NOW.plusSeconds(7200).atOffset(ZoneOffset.UTC),
            true,
            0,
            20);
    assertEquals(0, recursos.pesquisar(futuro, SOL).total());
    var devolvida = movimentos.devolver(m.id(), RESP);
    assertEquals(devolvida, movimentos.devolver(m.id(), RESP));
    assertEquals(1, recursos.pesquisar(futuro, SOL).total());
    assertFalse(reservas.consultarDisponibilidade(List.of(id), intervalo()).todosDisponiveis());
  }

  @Test
  void manutencaoNaoCancelaReservasEExpedienteNaoAsInvalida() {
    long id = recursos.salvar(null, material("M", "P"), ADMIN).id();
    reservar(id);
    assertThrows(
        ErroDominio.class,
        () -> recursos.bloquear(id, intervalo(), "RevisÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o", ADMIN));
    assertThrows(ErroDominio.class, () -> recursos.substituirExpediente(List.of(), ADMIN));
    assertEquals(0, j.queryForObject("SELECT COUNT(*) FROM bloqueios_recursos", Integer.class));
  }

  @Test
  void filtrosCompetenciasEPaginacao() {
    recursos.salvar(
        null,
        new DadosRecurso(
            TipoRecurso.PROFESSOR,
            "PR",
            true,
            false,
            null,
            null,
            null,
            "Prof",
            List.of(" Java ", "JAVA", "Banco   de Dados"),
            null,
            null,
            null),
        ADMIN);
    assertEquals(2, j.queryForObject("SELECT COUNT(*) FROM professor_competencias", Integer.class));
    assertEquals(
        1,
        recursos
            .pesquisar(
                new FiltroRecursos(
                    TipoRecurso.PROFESSOR, null, null, "java", null, null, null, null, 0, 1),
                SOL)
            .total());
    assertThrows(ErroDominio.class, () -> recursos.salvar(null, material("M", "P"), SOL));
  }

  private List<Object> disputar(Callable<?> a, Callable<?> b) throws Exception {
    var inicio = new CountDownLatch(1);
    try (var pool = Executors.newFixedThreadPool(2)) {
      var x =
          pool.submit(
              () -> {
                inicio.await();
                try {
                  return a.call();
                } catch (RuntimeException e) {
                  return e;
                }
              });
      var y =
          pool.submit(
              () -> {
                inicio.await();
                try {
                  return b.call();
                } catch (RuntimeException e) {
                  return e;
                }
              });
      inicio.countDown();
      return List.of(x.get(30, TimeUnit.SECONDS), y.get(30, TimeUnit.SECONDS));
    }
  }

  @Test
  void reservasConcorrentesUmaVenceEConflitoSobreviveRollback() throws Exception {
    for (var tipo : TipoRecurso.values()) {
      DadosRecurso d =
          switch (tipo) {
            case MATERIAL -> material("M", "P");
            case SALA ->
                new DadosRecurso(
                    tipo, "S", true, false, 20, "A", "LAB", null, null, null, null, null);
            case PROFESSOR ->
                new DadosRecurso(
                    tipo,
                    "PR",
                    true,
                    false,
                    null,
                    null,
                    null,
                    "Prof",
                    List.of("Java"),
                    null,
                    null,
                    null);
          };
      long id = recursos.salvar(null, d, ADMIN).id();
      var rs = disputar(() -> reservar(id), () -> reservar(id));
      assertEquals(1, rs.stream().filter(Reserva.class::isInstance).count());
      assertEquals(
          1, rs.stream().filter(ConflitoDisponibilidadeException.class::isInstance).count());
    }
    assertEquals(3, j.queryForObject("SELECT COUNT(*) FROM reservas", Integer.class));
    assertEquals(3, j.queryForObject("SELECT COUNT(*) FROM conflitos_evitados", Integer.class));
  }

  @Test
  void retiradaConcorrenteUmaVence() throws Exception {
    long id = recursos.salvar(null, material("M", "P"), ADMIN).id();
    var r = reservar(id);
    var rs =
        disputar(
            () -> movimentos.retirar(r.id(), id, RESP), () -> movimentos.retirar(r.id(), id, RESP));
    assertEquals(1, rs.stream().filter(Movimentacao.class::isInstance).count());
    assertEquals(
        1,
        j.queryForObject(
            "SELECT COUNT(*) FROM movimentacoes WHERE devolvido_em IS NULL", Integer.class));
  }

  @Test
  void bancoImpedeDuplaRetiradaMesmoSemServico() {
    long id = recursos.salvar(null, material("M", "P"), ADMIN).id();
    var r = reservar(id);
    movimentos.retirar(r.id(), id, RESP);
    assertThrows(
        org.springframework.dao.DuplicateKeyException.class,
        () ->
            j.update(
                "INSERT INTO"
                    + " movimentacoes(recurso_id,reserva_id,responsavel_id,retirado_em,fim_previsto)"
                    + " SELECT recurso_id,reserva_id,responsavel_id,retirado_em,fim_previsto FROM"
                    + " movimentacoes WHERE recurso_id=?",
                id));
    assertEquals(1, j.queryForObject("SELECT COUNT(*) FROM movimentacoes", Integer.class));
  }

  @Test
  void manutencaoContraReservaUmaVence() throws Exception {
    long id = recursos.salvar(null, material("M", "P"), ADMIN).id();
    var rs =
        disputar(
            () -> reservar(id),
            () ->
                recursos.bloquear(
                    id, intervalo(), "ManutenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o", ADMIN));
    assertEquals(1, rs.stream().filter(x -> !(x instanceof RuntimeException)).count());
  }

  @Test
  void locksExigemTransacaoEOrdem() {
    assertThrows(RuntimeException.class, () -> locks.bloquear(List.of(1L)));
    new TransactionTemplate(tm)
        .executeWithoutResult(
            s -> {
              assertThrows(
                  org.springframework.dao.InvalidDataAccessApiUsageException.class,
                  () -> locks.bloquear(List.of(2L, 1L)));
              s.setRollbackOnly();
            });
  }

  @Test
  void multirecursoAtomicoEDevolucoesConcorrentes() throws Exception {
    long a = recursos.salvar(null, material("M1", "P1"), ADMIN).id(),
        b = recursos.salvar(null, material("M2", "P2"), ADMIN).id();
    var rs = disputar(() -> reservar(a, b), () -> reservar(b, a));
    assertEquals(1, rs.stream().filter(Reserva.class::isInstance).count());
    assertEquals(2, j.queryForObject("SELECT COUNT(*) FROM reserva_recursos", Integer.class));
    var r = (Reserva) rs.stream().filter(Reserva.class::isInstance).findFirst().orElseThrow();
    var m = movimentos.retirar(r.id(), a, RESP);
    var ds =
        disputar(() -> movimentos.devolver(m.id(), RESP), () -> movimentos.devolver(m.id(), RESP));
    assertEquals(ds.get(0), ds.get(1));
    assertEquals(
        1,
        j.queryForObject(
            "SELECT COUNT(*) FROM eventos_teste WHERE acao='DEVOLUCAO'", Integer.class));
  }

  @Test
  void manutencaoCanceladaAdjacenciaERecursoInativo() {
    long id = recursos.salvar(null, material("M", "P"), ADMIN).id();
    var bloqueio = recursos.bloquear(id, intervalo(), "Teste", ADMIN);
    assertThrows(ConflitoDisponibilidadeException.class, () -> reservar(id));
    long bid = ((Number) bloqueio.get("id")).longValue();
    recursos.cancelarBloqueio(bid, ADMIN);
    recursos.cancelarBloqueio(bid, ADMIN);
    var r = reservar(id);
    reservas.criar(
        new ComandoReserva(
            new IntervaloReserva(intervalo().fim(), intervalo().fim().plusSeconds(3600)),
            List.of(id)),
        SOL);
    assertEquals(StatusReserva.APROVADA, r.status());
  }

  @Test
  void pendenteForaDoHorarioEUnidadeAlheiaNaoPermitemRetirada() {
    long a = recursos.salvar(null, material("A", "A"), ADMIN).id(),
        b = recursos.salvar(null, material("B", "B"), ADMIN).id();
    var r = reservar(a);
    assertThrows(ErroDominio.class, () -> movimentos.retirar(r.id(), b, RESP));
    assertThrows(ErroDominio.class, () -> movimentos.retirar(r.id(), a, SOL));
    var futuro =
        reservas.criar(
            new ComandoReserva(
                new IntervaloReserva(NOW.plusSeconds(3600), NOW.plusSeconds(7200)), List.of(b)),
            SOL);
    assertThrows(ErroDominio.class, () -> movimentos.retirar(futuro.id(), b, RESP));
    j.update("UPDATE reservas SET status='SOLICITADA' WHERE id=?", r.id());
    assertThrows(ErroDominio.class, () -> movimentos.retirar(r.id(), a, RESP));
  }

  @Test
  void devolucaoTardiaDepoisDoEncerramentoPreservaHistorico() {
    long id = recursos.salvar(null, material("M", "P"), ADMIN).id();
    var r = reservar(id);
    var m = movimentos.retirar(r.id(), id, RESP);
    j.update(
        "UPDATE movimentacoes SET fim_previsto=? WHERE id=?",
        Banco.utc(NOW.minusSeconds(60)),
        m.id());
    j.update("UPDATE reservas SET status='CONCLUIDA' WHERE id=?", r.id());
    var devolvida = movimentos.devolver(m.id(), RESP);
    assertEquals(60, devolvida.atrasoSegundos());
    assertEquals(1, j.queryForObject("SELECT COUNT(*) FROM movimentacoes", Integer.class));
  }

  @Test
  void recursosDistintosNaoEsperamOMesmoLock() throws Exception {
    long a = recursos.salvar(null, material("A", "A"), ADMIN).id(),
        b = recursos.salvar(null, material("B", "B"), ADMIN).id();
    var entrou = new CountDownLatch(1);
    var liberar = new CountDownLatch(1);
    try (var pool = Executors.newFixedThreadPool(2)) {
      var segura =
          pool.submit(
              () ->
                  new TransactionTemplate(tm)
                      .executeWithoutResult(
                          t -> {
                            locks.bloquear(List.of(a));
                            entrou.countDown();
                            try {
                              liberar.await(10, TimeUnit.SECONDS);
                            } catch (InterruptedException ex) {
                              Thread.currentThread().interrupt();
                            }
                          }));
      assertTrue(entrou.await(5, TimeUnit.SECONDS));
      try {
        assertNotNull(pool.submit(() -> reservar(b)).get(3, TimeUnit.SECONDS));
      } finally {
        liberar.countDown();
      }
      segura.get(5, TimeUnit.SECONDS);
    }
  }

  @Test
  void aplicacaoIniciaComApisDesligadasSemProvedoresExternos() {
    try (var contexto =
        new org.springframework.boot.builder.SpringApplicationBuilder(
                br.senac.recursos.OrganizacaoRecursosApplication.class)
            .web(org.springframework.boot.WebApplicationType.NONE)
            .run(
                "--spring.datasource.url=" + mysql.getJdbcUrl(),
                "--spring.datasource.username=" + mysql.getUsername(),
                "--spring.datasource.password=" + mysql.getPassword(),
                "--spring.main.banner-mode=off")) {
          assertInstanceOf(
              br.senac.recursos.seguranca.SpringSecurityAtorProvider.class,
              contexto.getBean(
                  br.senac.recursos.reserva.api.AtorAutenticadoProvider.class
              )
          );
      assertTrue(contexto.getBeansOfType(EventosDominioPort.class).isEmpty());
      assertTrue(
          contexto.getBeansOfType(br.senac.recursos.recurso.api.RecursoController.class).isEmpty());
      assertTrue(
          contexto
              .getBeansOfType(br.senac.recursos.movimentacao.api.MovimentacaoController.class)
              .isEmpty());
      assertThrows(
          org.springframework.beans.BeansException.class,
          () -> contexto.getBean(RecursoService.class));
    }
  }
}
