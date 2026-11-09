package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.Ocupacao;
import java.util.Collection;
import java.util.List;

/**
 * PORTA (implementar: Fausto). Lista ocupações dos recursos que possam colidir com o intervalo:
 * reservas em SOLICITADA/APROVADA/EM_USO, bloqueios de manutenção e retiradas abertas
 * (intervalo até {@code Instant.MAX}). Pode devolver um superconjunto; o
 * {@link br.senac.recursos.reserva.dominio.DetectorConflitos} aplica a regra final.
 * Chamada somente depois de adquiridos os locks.
 */
public interface OcupacoesPort {

    List<Ocupacao> buscar(Collection<Long> recursoIds, IntervaloReserva intervalo);
}
