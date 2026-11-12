package br.senac.recursos.reserva.infraestrutura;

import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import java.util.Map;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Acesso por vínculo efetivo, validado após bloquear/reler a reserva na mesma
 * transação da alteração. Nenhum vínculo significa nenhum privilégio.
 */
@Repository
public class ReservaAcessoMysql {
    private final NamedParameterJdbcTemplate jdbc;

    public ReservaAcessoMysql(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void exigirResponsavelDeTodos(Reserva reserva, AtorReserva ator) {
        if (ator.papel() != PapelAtor.RESPONSAVEL) {
            throw new OperacaoNaoPermitidaException("Operação exclusiva de Responsável.");
        }
        Long autorizados = jdbc.queryForObject("""
                SELECT COUNT(*)
                FROM responsaveis_recursos vinculo
                JOIN usuarios u ON u.id = vinculo.usuario_id
                WHERE vinculo.usuario_id = :usuarioId
                  AND vinculo.recurso_id IN (:recursos)
                  AND u.perfil = 'RESPONSAVEL' AND u.ativo = TRUE
                """, Map.of("usuarioId", ator.usuarioId(), "recursos", reserva.recursoIds()), Long.class);
        if (autorizados == null || autorizados.longValue() != reserva.recursoIds().size()) {
            throw new OperacaoNaoPermitidaException(
                    "Responsável sem autorização para todos os recursos da reserva.");
        }
    }
}
