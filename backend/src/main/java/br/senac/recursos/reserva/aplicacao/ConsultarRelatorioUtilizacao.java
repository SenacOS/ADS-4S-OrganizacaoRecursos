package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.reserva.dominio.UtilizacaoReservas;
import java.time.Instant;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Relatório de utilização (RF12). Orquestra a porta de leitura e o cálculo puro
 * {@link UtilizacaoReservas}; não calcula horas por conta própria.
 *
 * <p>Esta classe NÃO abre transação (mesmo padrão de {@code ReservaService}): o bean registrado em
 * {@code Item18Config} é {@code RelatorioUtilizacaoTransacional}, que envolve {@link #executar} numa
 * única transação somente leitura, para que reservas e conflitos evitados venham do mesmo snapshot.
 *
 * <p>Política de acesso PROVISÓRIA: somente ADMINISTRADOR (não formalizada no ADR-007).
 * O ator vem sempre da sessão autenticada.
 */
public class ConsultarRelatorioUtilizacao {

    private final ReservaRelatorioPort porta;

    public ConsultarRelatorioUtilizacao(ReservaRelatorioPort porta) {
        this.porta = porta;
    }

    public record Filtro(IntervaloReserva periodo, Set<StatusReserva> estados, Long recursoId) {
        public Filtro {
            if (periodo == null) {
                throw new ConsultaInvalidaException("Informe o período.");
            }
            if (recursoId != null && recursoId <= 0) {
                throw new ConsultaInvalidaException("recursoId deve ser positivo.");
            }
            estados = Collections.unmodifiableSet(EnumSet.copyOf(
                    estados == null || estados.isEmpty() ? UtilizacaoReservas.ESTADOS_PADRAO : estados));
        }

        public static Filtro de(Instant inicio, Instant fim, Set<StatusReserva> estados, Long recursoId) {
            if (inicio == null || fim == null) {
                throw new ConsultaInvalidaException("Informe início e fim do período.");
            }
            return new Filtro(new IntervaloReserva(inicio, fim), estados, recursoId);
        }
    }

    public record Resultado(Filtro filtro, UtilizacaoReservas.Resultado utilizacao,
                            List<ConflitoEvitadoResumo> conflitosEvitados) {
    }

    public Resultado executar(Filtro filtro, AtorReserva ator) {
        if (ator.papel() != PapelAtor.ADMINISTRADOR) {
            throw new OperacaoNaoPermitidaException("Apenas o administrador consulta o relatório de utilização.");
        }
        List<Reserva> reservas = porta.buscarReservas(filtro.periodo(), filtro.estados(), filtro.recursoId());
        var utilizacao = UtilizacaoReservas.calcular(reservas, filtro.periodo(), filtro.estados());
        var conflitos = porta.buscarConflitosEvitados(filtro.periodo(), filtro.recursoId());
        return new Resultado(filtro, utilizacao, conflitos);
    }
}
