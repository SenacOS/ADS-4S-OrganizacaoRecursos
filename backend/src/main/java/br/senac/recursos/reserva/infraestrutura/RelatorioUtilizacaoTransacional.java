package br.senac.recursos.reserva.infraestrutura;

import br.senac.recursos.reserva.aplicacao.ConsultarRelatorioUtilizacao;
import br.senac.recursos.reserva.aplicacao.ReservaRelatorioPort;
import br.senac.recursos.reserva.dominio.AtorReserva;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fronteira transacional do relatório RF12: uma única transação somente leitura em REPEATABLE_READ,
 * para que as duas consultas da porta enxerguem o mesmo snapshot. Os métodos do adaptador MySQL
 * participam desta transação.
 */
public class RelatorioUtilizacaoTransacional extends ConsultarRelatorioUtilizacao {

    public RelatorioUtilizacaoTransacional(ReservaRelatorioPort porta) {
        super(porta);
    }

    @Override
    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public Resultado executar(Filtro filtro, AtorReserva ator) {
        return super.executar(filtro, ator);
    }
}
