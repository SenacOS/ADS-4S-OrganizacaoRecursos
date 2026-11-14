package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.shared.Pagina;
import java.util.Comparator;
import java.util.List;

/**
 * Implementação de REFERÊNCIA da porta, só para testes: serve de especificação executável.
 * O adaptador real (SQL) deve ter o mesmo comportamento, filtrando e paginando no banco.
 */
public class FilaEmMemoria implements ReservaFilaPort {

    private final List<ItemFilaAprovacao> dados;

    public FilaEmMemoria(List<ItemFilaAprovacao> dados) {
        this.dados = List.copyOf(dados);
    }

    @Override
    public Pagina<ItemFilaAprovacao> buscarFila(FiltroFilaAprovacao f) {
        List<ItemFilaAprovacao> filtrados = dados.stream()
                .filter(i -> i.reserva().restrita() && i.reserva().status() == StatusReserva.SOLICITADA)
                .filter(i -> f.periodo() == null || f.periodo().sobrepoe(i.reserva().intervalo()))
                .filter(i -> f.recursoId() == null || i.reserva().recursoIds().contains(f.recursoId()))
                .sorted(Comparator.comparing((ItemFilaAprovacao i) -> i.reserva().intervalo().inicio())
                        .thenComparing(i -> i.reserva().id()))
                .toList();
        int de = (int) Math.min((long) f.pagina() * f.tamanho(), filtrados.size());
        int ate = (int) Math.min((long) de + f.tamanho(), filtrados.size());
        return new Pagina<>(filtrados.subList(de, ate), f.pagina(), f.tamanho(), filtrados.size());
    }
}
