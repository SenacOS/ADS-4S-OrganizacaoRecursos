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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
  private static final IntervaloReserva HORARIO_EDICAO =
      new IntervaloReserva(NOW.plusSeconds(5400), NOW.plusSeconds(9000));
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
    @Primary
    EventosDominioPort eventos(JdbcTemplate j) {
      return e -> {
        j.update("INSERT INTO eventos_teste(acao) VALUES(?)", e.acao());
        if (e.depois() != null && e.depois().contains("FALHAR"))
          throw new IllegalStateException(
              "falha injetada apÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³s gravaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o");
      };
    }

    @Bean
    @Primary
    NotificacaoPort notificacao() {
      return e -> {};
    }
  }

  @Autowired JdbcTemplate j;
  @Autowired RecursoService recursos;
  @Autowired MovimentacaoService movimentos;
  @Autowired ReservaService reservas;
  @Autowired ReservaRepositorio repositorioReservas;
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
            "auditoria",
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
    return disputar(List.of(a, b));
  }

  private List<Object> disputar(List<? extends Callable<?>> operacoes) throws Exception {
    var prontas = new CountDownLatch(operacoes.size());
    var inicio = new CountDownLatch(1);
    var pool = Executors.newFixedThreadPool(operacoes.size());
    try {
      var futuros = new ArrayList<Future<Object>>();
      for (var operacao : operacoes) {
        futuros.add(
            pool.submit(
                () -> {
                  prontas.countDown();
                  inicio.await();
                  try {
                    return operacao.call();
                  } catch (RuntimeException e) {
                    return e;
                  }
                }));
      }
      assertTrue(prontas.await(5, TimeUnit.SECONDS), "As tarefas não chegaram à barreira");
      inicio.countDown();
      var resultados = new ArrayList<Object>();
      for (var futuro : futuros) {
        resultados.add(futuro.get(15, TimeUnit.SECONDS));
      }
      return resultados;
    } finally {
      pool.shutdownNow();
    }
  }

  @ParameterizedTest
  @ValueSource(ints = {2, 3, 4, 5, 6})
  void ct19SomenteUmaEdicaoVenceEPerdedorasFicamIntactas(int quantidade) throws Exception {
    long origem = recursos.salvar(null, material("ORIGEM", "PO"), ADMIN).id();
    long destino = recursos.salvar(null, material("DESTINO", "PD"), ADMIN).id();
    var originais = new ArrayList<Reserva>();
    var operacoes = new ArrayList<Callable<?>>();
    for (int i = 0; i < quantidade; i++) {
      Instant inicio = NOW.minusSeconds(14400).plusSeconds(i * 1800L);
      var original =
          reservas.criar(
              new ComandoReserva(
                  new IntervaloReserva(inicio, inicio.plusSeconds(1800)), List.of(origem)),
              SOL);
      originais.add(original);
      operacoes.add(() -> editarNoHorarioAlvo(original, destino));
    }

    var vencedora = assertUmSucessoEConflitos(disputar(operacoes));
    assertEquals(List.of(destino), vencedora.recursoIds());
    assertEquals(
        originais.size(), j.queryForObject("SELECT COUNT(*) FROM reservas", Integer.class));
    assertEdicoesPersistidas(originais, vencedora);
    assertEquals(
        quantidade - 1, j.queryForObject("SELECT COUNT(*) FROM conflitos_evitados", Integer.class));
  }

  @Test
  void ct19TrocaEmOrdemOpostaConcluiAsDuasEdicoes() throws Exception {
    long primeiro = recursos.salvar(null, material("M1", "P1"), ADMIN).id();
    long segundo = recursos.salvar(null, material("M2", "P2"), ADMIN).id();
    var a = reservar(primeiro);
    var b = reservar(segundo);

    var resultados =
        disputar(() -> editarNoHorarioAlvo(a, segundo), () -> editarNoHorarioAlvo(b, primeiro));

    var aEditada = assertInstanceOf(Reserva.class, resultados.get(0));
    var bEditada = assertInstanceOf(Reserva.class, resultados.get(1));
    assertEquals(List.of(segundo), aEditada.recursoIds());
    assertEquals(List.of(primeiro), bEditada.recursoIds());
    assertEdicoesPersistidas(List.of(a, b), aEditada, bEditada);
    assertEquals(0, j.queryForObject("SELECT COUNT(*) FROM conflitos_evitados", Integer.class));
  }

  @Test
  void ct19EdicaoContraCriacaoNoMesmoHorario() throws Exception {
    long recurso = recursos.salvar(null, material("M", "P"), ADMIN).id();
    var original = reservar(recurso);

    var vencedora =
        assertUmSucessoEConflitos(
            disputar(
                () -> editarNoHorarioAlvo(original, recurso),
                () -> reservas.criar(new ComandoReserva(HORARIO_EDICAO, List.of(recurso)), SOL)));

    if (vencedora.id().equals(original.id())) {
      assertEdicoesPersistidas(List.of(original), vencedora);
      assertEquals(1, j.queryForObject("SELECT COUNT(*) FROM reservas", Integer.class));
    } else {
      assertEdicoesPersistidas(List.of(original));
      assertEquals(vencedora, repositorioReservas.buscarPorId(vencedora.id()).orElseThrow());
      assertEquals(2, j.queryForObject("SELECT COUNT(*) FROM reservas", Integer.class));
    }
    assertEquals(1, j.queryForObject("SELECT COUNT(*) FROM conflitos_evitados", Integer.class));
  }

  @Test
  void ct19RecursoComumSomenteDepoisDaEdicao() throws Exception {
    long primeiro = recursos.salvar(null, material("M1", "P1"), ADMIN).id();
    long segundo = recursos.salvar(null, material("M2", "P2"), ADMIN).id();
    long terceiro = recursos.salvar(null, material("M3", "P3"), ADMIN).id();
    long quarto = recursos.salvar(null, material("M4", "P4"), ADMIN).id();
    var a = reservar(primeiro);
    var b = reservar(terceiro);
    var c = reservar(quarto);

    var vencedora =
        assertUmSucessoEConflitos(
            disputar(
                List.of(
                    () -> editarNoHorarioAlvo(a, segundo),
                    () -> editarNoHorarioAlvo(b, segundo),
                    () -> editarNoHorarioAlvo(c, segundo, quarto))));

    assertTrue(vencedora.recursoIds().contains(segundo));
    assertEdicoesPersistidas(List.of(a, b, c), vencedora);
    assertEquals(2, j.queryForObject("SELECT COUNT(*) FROM conflitos_evitados", Integer.class));
  }

  private Reserva editarNoHorarioAlvo(Reserva reserva, Long... recursos) {
    return reservas.editar(
        reserva.id(), new ComandoReserva(HORARIO_EDICAO, List.of(recursos)), SOL);
  }

  private static Reserva assertUmSucessoEConflitos(List<Object> resultados) {
    var sucessos = resultados.stream().filter(Reserva.class::isInstance).toList();
    assertEquals(1, sucessos.size(), resultados::toString);
    for (var resultado : resultados) {
      if (!(resultado instanceof Reserva)) {
        // O handler REST converte este conflito de domínio em HTTP 409.
        assertInstanceOf(ConflitoDisponibilidadeException.class, resultado);
      }
    }
    var vencedora = (Reserva) sucessos.getFirst();
    assertEquals(HORARIO_EDICAO, vencedora.intervalo());
    return vencedora;
  }

  private void assertEdicoesPersistidas(List<Reserva> originais, Reserva... editadas) {
    var esperadas = new HashMap<Long, Reserva>();
    originais.forEach(reserva -> esperadas.put(reserva.id(), reserva));
    for (var editada : editadas) {
      assertEquals(HORARIO_EDICAO, editada.intervalo());
      esperadas.put(editada.id(), editada);
    }
    esperadas.forEach(
        (id, esperada) ->
            assertEquals(esperada, repositorioReservas.buscarPorId(id).orElseThrow()));
    assertEquals(
        Arrays.stream(editadas).map(Reserva::id).sorted().toList(),
        j.queryForList(
            "SELECT entidade_id FROM auditoria WHERE entidade='RESERVA' AND acao='EDICAO'"
                + " ORDER BY entidade_id",
            Long.class));
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
          contexto.getBean(br.senac.recursos.reserva.api.AtorAutenticadoProvider.class));
      assertInstanceOf(
          br.senac.recursos.auditoria.AuditoriaJdbc.class,
          contexto.getBean(EventosDominioPort.class));
      assertTrue(
          contexto.getBeansOfType(br.senac.recursos.recurso.api.RecursoController.class).isEmpty());
      assertTrue(
          contexto
              .getBeansOfType(br.senac.recursos.movimentacao.api.MovimentacaoController.class)
              .isEmpty());
      assertNotNull(contexto.getBean(RecursoService.class));
    }
  }
}
