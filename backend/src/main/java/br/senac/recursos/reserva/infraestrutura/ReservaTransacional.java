package br.senac.recursos.reserva.infraestrutura;

import br.senac.recursos.reserva.aplicacao.*;
import br.senac.recursos.reserva.dominio.*;
import java.time.Clock;
import org.springframework.transaction.annotation.*;

@Transactional(isolation = Isolation.READ_COMMITTED)
public class ReservaTransacional extends ReservaService {
  public ReservaTransacional(
      RecursosPort r,
      ReservaRepositorio p,
      OcupacoesPort o,
      ExpedientePort e,
      AuditoriaPort a,
      NotificacaoPort n,
      ConflitosEvitadosPort c,
      Clock clock) {
    super(r, p, o, e, a, n, c, clock);
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
  public Reserva cancelar(long id, AtorReserva a) {
    return super.cancelar(id, a);
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
