package br.senac.recursos.reserva.aplicacao;

import java.util.List;

/**
 * PORTA (implementar: Fausto). Adquire o lock pessimista nas linhas de {@code recursos}.
 *
 * <p>Contrato: executar {@code SELECT ... FOR UPDATE} em cada ID, na ordem recebida (já crescente),
 * dentro da transação corrente (READ COMMITTED). Lançar
 * {@link br.senac.recursos.reserva.dominio.RecursoNaoEncontradoException} se algum ID não existir.
 * Devolver as informações na mesma ordem. O lock só é liberado no commit/rollback.
 */
public interface RecursosPort {

    List<RecursoInfo> bloquear(List<Long> idsOrdenados);
}
