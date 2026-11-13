package br.senac.recursos.reserva.infraestrutura;

import br.senac.recursos.reserva.aplicacao.*;
import br.senac.recursos.reserva.dominio.*;
import java.time.Clock;
import org.springframework.transaction.annotation.*;

@Transactional(isolation = Isolation.READ_COMMITTED)
public class ReservaTransacional extends ReservaService {
  private final ReservaAcessoMysql acesso;

  public ReservaTransacional(
      RecursosPort r,
      ReservaRepositorio p,
      OcupacoesPort o,
      ExpedientePort e,
      AuditoriaPort a,
      NotificacaoPort n,
      ConflitosEvitadosPort c,
      Clock clock,
      ReservaAcessoMysql acesso) {
    super(r, p, o, e, a, n, c, clock);
    this.acesso = acesso;
  }

  @Override
  protected void validarAutorizacaoReserva(Reserva reserva, AtorReserva ator, AcaoReserva acao) {
    switch (acao) {
      case APROVACAO, REJEICAO -> acesso.exigirResponsavelDeTodos(reserva, ator);
      case INICIO_DE_USO, CONCLUSAO, NAO_COMPARECIMENTO -> {
        if (ator.papel() == PapelAtor.RESPONSAVEL) {
          acesso.exigirResponsavelDeTodos(reserva, ator);
        }
      }
      default -> { /* Operações com autorização própria no domínio. */ }
    }
  }

  @Override
  public Reserva criar(ComandoReserva c, AtorReserva a) {
    return super.criar(c, a);
  }

  @Override
  public Reserva editar(long id, ComandoReserva c, AtorReserva a) {
    return super.editar(id, c, a);
  }

  @Override
  public Reserva aprovar(long id, AtorReserva a) {
    return super.aprovar(id, a);
  }

  @Override
  public Reserva rejeitar(long id, AtorReserva a, String motivo) {
    return super.rejeitar(id, a, motivo);
  }

  @Override
  public Reserva cancelar(long id, AtorReserva a, String motivo) {
    return super.cancelar(id, a, motivo);
  }

  @Override
  public Reserva iniciarUso(long id, AtorReserva a) {
    return super.iniciarUso(id, a);
  }

  @Override
  public Reserva concluir(long id, AtorReserva a) {
    return super.concluir(id, a);
  }

  @Override
  public Reserva registrarNaoComparecimento(long id, AtorReserva a) {
    return super.registrarNaoComparecimento(id, a);
  }

  @Override
  @Transactional(readOnly = true)
  public ResultadoDisponibilidade consultarDisponibilidade(
      java.util.Collection<Long> ids, IntervaloReserva i, Long ignorar) {
    return super.consultarDisponibilidade(ids, i, ignorar);
  }

  @Override
  @Transactional(readOnly = true)
  public ResultadoDisponibilidade consultarDisponibilidade(
      java.util.Collection<Long> ids, IntervaloReserva i) {
    return super.consultarDisponibilidade(ids, i);
  }
}
