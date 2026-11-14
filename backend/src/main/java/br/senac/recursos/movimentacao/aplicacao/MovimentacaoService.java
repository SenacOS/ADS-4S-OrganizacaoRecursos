package br.senac.recursos.movimentacao.aplicacao;

import br.senac.recursos.movimentacao.dominio.*;
import br.senac.recursos.movimentacao.infraestrutura.*;
import br.senac.recursos.recurso.dominio.*;
import br.senac.recursos.recurso.infraestrutura.*;
import br.senac.recursos.reserva.aplicacao.*;
import br.senac.recursos.reserva.dominio.*;
import br.senac.recursos.shared.*;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.*;

@Transactional(isolation = Isolation.READ_COMMITTED)
public class MovimentacaoService {
  private final Banco b;
  private final MovimentacaoMysql mov;
  private final CadastroMysql cadastro;
  private final RecursosPort locks;
  private final ReservaRepositorio reservas;
  private final OcupacoesPort ocupacoes;
  private final EventosDominioPort eventos;
  private final NotificacaoPort notificacoes;
  private final Clock clock;

  public MovimentacaoService(
      Banco b,
      MovimentacaoMysql m,
      CadastroMysql c,
      RecursosPort l,
      ReservaRepositorio r,
      OcupacoesPort o,
      EventosDominioPort e,
      NotificacaoPort notificacoes,
      Clock clock) {
    this.b = b;
    mov = m;
    cadastro = c;
    locks = l;
    reservas = r;
    ocupacoes = o;
    eventos = e;
    this.notificacoes = notificacoes;
    this.clock = clock;
  }

  @Transactional(readOnly = true)
  public List<Movimentacao> listar(boolean abertas, AtorReserva a) {
    Permissoes.exigir(a, PapelAtor.RESPONSAVEL, PapelAtor.ADMINISTRADOR);
    return mov.listar(abertas);
  }

  public Movimentacao retirar(long reservaId, long recursoId, AtorReserva a) {
    Permissoes.exigir(a, PapelAtor.RESPONSAVEL);
    if (reservaId <= 0 || recursoId <= 0) throw new IllegalArgumentException("IDs inválidos.");
    locks.bloquear(List.of(recursoId));
    var d = cadastro.obter(recursoId).dados();
    var r = reservas.buscarPorId(reservaId).orElseThrow(ErroDominio::ausente);
    Instant agora = clock.instant();
    if (d.tipo() != TipoRecurso.MATERIAL
        || !d.ativo()
        || !r.recursoIds().contains(recursoId)
        || (r.status() != StatusReserva.APROVADA && r.status() != StatusReserva.EM_USO)
        || agora.isBefore(r.intervalo().inicio())
        || !agora.isBefore(r.intervalo().fim()))
      throw ErroDominio.conflito("Material, reserva ou horário não permite retirada.");
    if (DetectorConflitos.primeiroConflito(
            r.intervalo(),
            List.of(recursoId),
            ocupacoes.buscar(List.of(recursoId), r.intervalo()),
            reservaId)
        .isPresent()) throw ErroDominio.conflito("Material em manutenção ou com retirada aberta.");
    long id =
        b.inserir(
            "INSERT INTO"
                + " movimentacoes(recurso_id,reserva_id,responsavel_id,retirado_em,fim_previsto)"
                + " VALUES(?,?,?,?,?)",
            recursoId,
            reservaId,
            a.usuarioId(),
            Banco.utc(agora),
            Banco.utc(r.intervalo().fim()));
    var m = mov.obter(id);
    evento(m, a, "RETIRADA", null);
    return m;
  }

  public Movimentacao devolver(long id, AtorReserva a) {
    Permissoes.exigir(a, PapelAtor.RESPONSAVEL);
    var previa = mov.obter(id);
    locks.bloquear(List.of(previa.recursoId()));
    var m = mov.obter(id);
    if (m.devolvidoEm() != null) return m;
    Instant agora = clock.instant();
    if (agora.isBefore(m.retiradoEm())) throw ErroDominio.conflito("Relógio anterior à retirada.");
    b.jdbc.update(
        "UPDATE movimentacoes SET devolvido_em=?,devolvido_por=?,atraso_segundos=? WHERE id=?",
        Banco.utc(agora),
        a.usuarioId(),
        Math.max(0, Duration.between(m.fimPrevisto(), agora).getSeconds()),
        id);
    var atual = mov.obter(id);
    evento(atual, a, "DEVOLUCAO", m.toString());
    notificacoes.registrarPendente(new EventoNotificacao(
        atual.reservaId(), TipoEventoNotificacao.MATERIAL_DEVOLVIDO,
        UUID.randomUUID().toString(), agora));
    return atual;
  }

  private void evento(Movimentacao m, AtorReserva a, String acao, String antes) {
    eventos.registrar(
        new EventosDominioPort.Evento(
            "MOVIMENTACAO", m.id(), a.usuarioId(), acao, antes, m.toString(), clock.instant()));
  }
}
