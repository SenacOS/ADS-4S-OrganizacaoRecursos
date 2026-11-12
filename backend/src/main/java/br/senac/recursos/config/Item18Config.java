package br.senac.recursos.config;

import br.senac.recursos.movimentacao.aplicacao.*;
import br.senac.recursos.movimentacao.infraestrutura.*;
import br.senac.recursos.recurso.aplicacao.*;
import br.senac.recursos.recurso.infraestrutura.*;
import br.senac.recursos.reserva.aplicacao.*;
import br.senac.recursos.reserva.infraestrutura.*;
import br.senac.recursos.shared.*;
import java.time.Clock;
import org.springframework.boot.autoconfigure.condition.*;
import org.springframework.context.annotation.*;

@Configuration
public class Item18Config {
  @Bean
  @ConditionalOnMissingBean
  public Clock clock() {
    return Clock.systemUTC();
  }

  @Bean
  @Lazy
  public RecursoService recursoService(
      Banco b,
      CadastroMysql c,
      RecursosPort l,
      OcupacoesPort o,
      ExpedienteMysql e,
      EventosDominioPort a,
      Clock clock) {
    return new RecursoService(b, c, l, o, e, a, clock);
  }

  @Bean
  @Lazy
  public MovimentacaoService movimentacaoService(
      Banco b,
      MovimentacaoMysql m,
      CadastroMysql c,
      RecursosPort l,
      ReservaRepositorio r,
      OcupacoesPort o,
      EventosDominioPort e,
      NotificacaoPort n,
      Clock clock) {
    return new MovimentacaoService(b, m, c, l, r, o, e, n, clock);
  }

  @Bean
  @Lazy
  public ReservaService reservaService(
      RecursosPort r,
      ReservaRepositorio p,
      OcupacoesPort o,
      ExpedientePort e,
      AuditoriaPort a,
      NotificacaoPort n,
      ConflitosEvitadosPort c,
      Clock clock,
      ReservaAcessoMysql acesso) {
    return new ReservaTransacional(r, p, o, e, a, n, c, clock, acesso);
  }
}
