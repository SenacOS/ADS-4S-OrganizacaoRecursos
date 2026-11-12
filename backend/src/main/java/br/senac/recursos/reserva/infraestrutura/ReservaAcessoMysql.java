package br.senac.recursos.reserva.infraestrutura;

import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.ReservaNaoEncontradaException;
import java.util.Map;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Autorização de operações por recurso, sempre a partir do ID da sessão.
 * Falha fechada quando não há vínculo; não confia em IDs enviados pelo navegador.
 */
@Repository
public class ReservaAcessoMysql {
    private final NamedParameterJdbcTemplate jdbc;

    public ReservaAcessoMysql(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void exigirResponsavelDeTodos(long reservaId, AtorReserva ator) {
        if (ator.papel() != PapelAtor.RESPONSAVEL) {
            throw new OperacaoNaoPermitidaException("Operação exclusiva de Responsável.");
        }
        Map<String, Object> parametros = Map.of("reservaId", reservaId, "usuarioId", ator.usuarioId());

        Long quantidade = jdbc.queryForObject(
                "SELECT COUNT(*) FROM reserva_recursos WHERE reserva_id = :reservaId",
                parametros, Long.class);
        if (quantidade == null || quantidade == 0) {
            throw new ReservaNaoEncontradaException(reservaId);
        }

        Long foraDoEscopo = jdbc.queryForObject("""
                SELECT COUNT(*)
                FROM reserva_recursos rr
                WHERE rr.reserva_id = :reservaId
                  AND NOT EXISTS (
                      SELECT 1 FROM responsaveis_recursos vinculo
                      JOIN usuarios u ON u.id = vinculo.usuario_id
                      WHERE vinculo.recurso_id = rr.recurso_id
                        AND vinculo.usuario_id = :usuarioId
                        AND u.perfil = 'RESPONSAVEL' AND u.ativo = TRUE
                  )
                """, parametros, Long.class);
        if (foraDoEscopo == null || foraDoEscopo > 0) {
            throw new OperacaoNaoPermitidaException("Responsável sem autorização para todos os recursos da reserva.");
        }
    }
}
