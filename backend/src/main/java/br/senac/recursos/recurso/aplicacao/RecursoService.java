package br.senac.recursos.recurso.aplicacao;

import br.senac.recursos.recurso.dominio.*;
import br.senac.recursos.recurso.infraestrutura.*;
import br.senac.recursos.reserva.aplicacao.*;
import br.senac.recursos.reserva.dominio.*;
import br.senac.recursos.shared.*;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.*;

@Transactional(isolation = Isolation.READ_COMMITTED)
public class RecursoService {
  private final Banco b;
  private final CadastroMysql cadastro;
  private final RecursosPort locks;
  private final OcupacoesPort ocupacoes;
  private final ExpedienteMysql expediente;
  private final EventosDominioPort eventos;
  private final Clock clock;

  public RecursoService(
      Banco b,
      CadastroMysql c,
      RecursosPort l,
      OcupacoesPort o,
      ExpedienteMysql e,
      EventosDominioPort a,
      Clock clock) {
    this.b = b;
    cadastro = c;
    locks = l;
    ocupacoes = o;
    expediente = e;
    eventos = a;
    this.clock = clock;
  }

  @Transactional(readOnly = true)
  public Recurso obter(long id, AtorReserva ator) {
    autenticado(ator);
    var r = cadastro.obter(id);
    if (!r.dados().ativo() && ator.papel() != PapelAtor.ADMINISTRADOR) throw ErroDominio.ausente();
    return r;
  }

  public Recurso salvar(Long id, DadosRecurso d, AtorReserva ator) {
    admin(ator);
    String antes = null;
    if (id != null) {
      locks.bloquear(List.of(id));
      var antigo = cadastro.obter(id);
      antes = antigo.toString();
      if (antigo.dados().tipo() != d.tipo()) throw new IllegalArgumentException("Tipo imutável.");
      if (!d.ativo()) exigirSemCompromissos(id);
    }
    var r = cadastro.salvar(id, d);
    evento("RECURSO", r.id(), ator, id == null ? "CRIACAO" : "EDICAO", antes, r.toString());
    return r;
  }

  public void desativar(long id, AtorReserva ator) {
    admin(ator);
    locks.bloquear(List.of(id));
    exigirSemCompromissos(id);
    var antes = cadastro.obter(id);
    if (!antes.dados().ativo()) return;
    b.jdbc.update("UPDATE recursos SET ativo=false WHERE id=?", id);
    evento("RECURSO", id, ator, "DESATIVACAO", antes.toString(), cadastro.obter(id).toString());
  }

  private void exigirSemCompromissos(long id) {
    if (b.jdbc.queryForObject(
                "SELECT COUNT(*) FROM reserva_recursos rr JOIN reservas r ON r.id=rr.reserva_id"
                    + " WHERE rr.recurso_id=? AND r.status IN ('SOLICITADA','APROVADA','EM_USO')"
                    + " AND (r.fim_utc>? OR r.status='EM_USO')",
                Long.class,
                id,
                Banco.utc(clock.instant()))
            > 0
        || b.jdbc.queryForObject(
                "SELECT COUNT(*) FROM movimentacoes WHERE recurso_id=? AND devolvido_em IS NULL",
                Long.class,
                id)
            > 0) throw ErroDominio.conflito("Recurso possui reserva ativa ou retirada aberta.");
  }

  @Transactional(readOnly = true)
  public Pagina<Recurso> pesquisar(FiltroRecursos f, AtorReserva ator) {
    autenticado(ator);
    var cs = cadastro.competencias();
    var candidatos =
        cadastro.todos().stream()
            .map(r -> cadastro.preencher(r, cs))
            .filter(r -> r.dados().ativo() || ator.papel() == PapelAtor.ADMINISTRADOR)
            .filter(r -> f.tipo() == null || r.dados().tipo() == f.tipo())
            .filter(
                r ->
                    f.capacidadeMinima() == null
                        || (r.dados().capacidade() != null
                            && r.dados().capacidade() >= f.capacidadeMinima()))
            .filter(r -> contem(r.dados().localizacao(), f.localizacao()))
            .filter(
                r ->
                    f.competencia() == null
                        || r.dados().competencias().stream()
                            .anyMatch(c -> contem(c, f.competencia())))
            .filter(r -> contem(r.dados().patrimonio(), f.patrimonio()))
            .toList();
    List<Recurso> resultado = candidatos;
    if (f.inicio() != null) {
      var i = new IntervaloReserva(f.inicio().toInstant(), f.fim().toInstant());
      boolean dentro = expediente.atual().comporta(i);
      var os = ocupacoes.buscar(candidatos.stream().map(Recurso::id).toList(), i);
      resultado =
          candidatos.stream()
              .map(
                  r ->
                      new Recurso(
                          r.id(),
                          r.dados(),
                          r.dados().ativo()
                              && dentro
                              && DetectorConflitos.primeiroConflito(i, List.of(r.id()), os, null)
                                  .isEmpty()))
              .filter(r -> f.disponivel() == null || f.disponivel().equals(r.disponivel()))
              .toList();
    }
    long inicio = Math.min((long) f.pagina() * f.tamanho(), resultado.size());
    return new Pagina<>(
        resultado.subList((int) inicio, (int) Math.min(inicio + f.tamanho(), resultado.size())),
        f.pagina(),
        f.tamanho(),
        resultado.size());
  }

  private boolean contem(String valor, String filtro) {
    return filtro == null
        || (valor != null
            && valor.toLowerCase(Locale.ROOT).contains(filtro.strip().toLowerCase(Locale.ROOT)));
  }

  @Transactional(readOnly = true)
  public Expediente consultarExpediente(AtorReserva a) {
    autenticado(a);
    return expediente.atual();
  }

  public Expediente substituirExpediente(List<JanelaFuncionamento> janelas, AtorReserva ator) {
    admin(ator);
    Objects.requireNonNull(janelas);
    expediente.exclusivo();
    var novo = new Expediente(ZoneId.of("America/Sao_Paulo"), janelas);
    for (var j : janelas)
      for (var k : janelas)
        if (j != k
            && j.dia() == k.dia()
            && j.inicio().isBefore(k.fim())
            && j.fim().isAfter(k.inicio()))
          throw new IllegalArgumentException("Janelas sobrepostas.");
    var periodos =
        b.jdbc.query(
            "SELECT inicio_utc,fim_utc FROM reservas WHERE status IN"
                + " ('SOLICITADA','APROVADA','EM_USO') AND fim_utc>?",
            (r, n) ->
                new IntervaloReserva(Banco.instante(r, "inicio_utc"), Banco.instante(r, "fim_utc")),
            Banco.utc(clock.instant()));
    if (periodos.stream().anyMatch(i -> !novo.comporta(i)))
      throw ErroDominio.conflito("Novo expediente invalida reservas ativas.");
    String antes = expediente.atual().toString();
    b.jdbc.update("DELETE FROM horarios_funcionamento");
    for (var j : janelas)
      b.jdbc.update(
          "INSERT INTO horarios_funcionamento(dia_semana,hora_inicio,hora_fim) VALUES(?,?,?)",
          j.dia().getValue(),
          j.inicio(),
          j.fim());
    evento("EXPEDIENTE", 1, ator, "EDICAO", antes, novo.toString());
    return novo;
  }

  public Map<String, Object> bloquear(
      long recursoId, IntervaloReserva i, String motivo, AtorReserva ator) {
    admin(ator);
    motivo = DadosRecurso.texto(motivo, 500);
    locks.bloquear(List.of(recursoId));
    if (DetectorConflitos.primeiroConflito(
            i, List.of(recursoId), ocupacoes.buscar(List.of(recursoId), i), null)
        .isPresent()) throw ErroDominio.conflito("Manutenção colide com ocupação existente.");
    long id =
        b.inserir(
            "INSERT INTO bloqueios_recursos(recurso_id,inicio_utc,fim_utc,motivo,autor_id)"
                + " VALUES(?,?,?,?,?)",
            recursoId,
            Banco.utc(i.inicio()),
            Banco.utc(i.fim()),
            motivo,
            ator.usuarioId());
    evento("BLOQUEIO", id, ator, "CRIACAO", null, motivo);
    return bloqueio(id);
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> bloqueios(long recursoId, AtorReserva ator) {
    obter(recursoId, ator);
    return b
        .jdbc
        .queryForList(
            "SELECT id,recurso_id,inicio_utc,fim_utc,motivo,status FROM bloqueios_recursos WHERE"
                + " recurso_id=? ORDER BY inicio_utc,id",
            recursoId)
        .stream()
        .map(this::datas)
        .toList();
  }

  private Map<String, Object> bloqueio(long id) {
    var rs = b.jdbc.queryForList("SELECT * FROM bloqueios_recursos WHERE id=?", id);
    if (rs.isEmpty()) throw ErroDominio.ausente();
    return datas(rs.getFirst());
  }

  public Map<String, Object> cancelarBloqueio(long id, AtorReserva ator) {
    admin(ator);
    var previa = bloqueio(id);
    locks.bloquear(List.of(((Number) previa.get("recurso_id")).longValue()));
    var atual = bloqueio(id);
    if (atual.get("status").equals("CANCELADO")) return atual;
    b.jdbc.update(
        "UPDATE bloqueios_recursos SET status='CANCELADO',cancelado_por=?,cancelado_em=? WHERE"
            + " id=?",
        ator.usuarioId(),
        Banco.utc(clock.instant()),
        id);
    evento("BLOQUEIO", id, ator, "CANCELAMENTO", atual.toString(), "CANCELADO");
    return bloqueio(id);
  }

  private Map<String, Object> datas(Map<String, Object> origem) {
    var m = new LinkedHashMap<String, Object>(origem);
    m.replaceAll(
        (k, v) ->
            v instanceof java.sql.Timestamp t
                ? t.toLocalDateTime()
                    .toInstant(ZoneOffset.UTC)
                    .atZone(ZoneId.of("America/Sao_Paulo"))
                    .toOffsetDateTime()
                : v instanceof LocalDateTime t
                    ? t.toInstant(ZoneOffset.UTC)
                        .atZone(ZoneId.of("America/Sao_Paulo"))
                        .toOffsetDateTime()
                    : v);
    return m;
  }

  private void evento(String e, long id, AtorReserva a, String acao, String antes, String depois) {
    eventos.registrar(
        new EventosDominioPort.Evento(e, id, a.usuarioId(), acao, antes, depois, clock.instant()));
  }

  private void admin(AtorReserva a) {
    Permissoes.exigir(a, PapelAtor.ADMINISTRADOR);
  }

  private void autenticado(AtorReserva a) {
    Permissoes.exigir(a, PapelAtor.values());
  }
}
