package br.senac.recursos.reserva.api;

import br.senac.recursos.reserva.aplicacao.ConsultaInvalidaException;
import br.senac.recursos.reserva.aplicacao.ConsultarRelatorioUtilizacao;
import br.senac.recursos.reserva.dominio.StatusReserva;
import java.time.OffsetDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Relatório de utilização (RF12). O ator vem exclusivamente da sessão autenticada; a política de
 * acesso (provisória: somente ADMINISTRADOR) é aplicada pelo caso de uso, que responde 403 aos
 * demais papéis.
 *
 * <p>A rota literal tem precedência sobre {@code GET /api/reservas/{id}} no Spring MVC.
 */
@RestController
@RequestMapping(path = "/api/reservas/relatorio-utilizacao", produces = MediaType.APPLICATION_JSON_VALUE)
@ConditionalOnProperty(name = "reservas.api.enabled", havingValue = "true")
public class RelatorioUtilizacaoController {

    private final ConsultarRelatorioUtilizacao relatorio;
    private final AtorAutenticadoProvider atores;

    public RelatorioUtilizacaoController(ConsultarRelatorioUtilizacao relatorio,
                                         AtorAutenticadoProvider atores) {
        this.relatorio = relatorio;
        this.atores = atores;
    }

    /**
     * @param inicio início do período (obrigatório, ISO-8601 com offset)
     * @param fim fim do período (obrigatório, ISO-8601 com offset; intervalo semiaberto)
     * @param estados lista opcional separada por vírgula; sem ela vale o padrão do cálculo
     * @param recursoId filtro opcional por recurso
     */
    @GetMapping
    public RelatorioUtilizacaoResponse consultar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fim,
            @RequestParam(required = false) List<String> estados,
            @RequestParam(required = false) Long recursoId) {
        var filtro = ConsultarRelatorioUtilizacao.Filtro.de(
                inicio == null ? null : inicio.toInstant(),
                fim == null ? null : fim.toInstant(),
                converter(estados),
                recursoId);
        return RelatorioUtilizacaoResponse.de(relatorio.executar(filtro, atores.atorAtual()));
    }

    /** Nomes exatos do enum; valor desconhecido é 400. Ausente/vazio mantém o padrão do cálculo. */
    private static Set<StatusReserva> converter(List<String> brutos) {
        if (brutos == null || brutos.isEmpty()) {
            return null;
        }
        var resultado = EnumSet.noneOf(StatusReserva.class);
        for (String bruto : brutos) {
            try {
                resultado.add(StatusReserva.valueOf(bruto.trim()));
            } catch (IllegalArgumentException e) {
                throw new ConsultaInvalidaException("Estado de reserva inválido.");
            }
        }
        return resultado;
    }
}
