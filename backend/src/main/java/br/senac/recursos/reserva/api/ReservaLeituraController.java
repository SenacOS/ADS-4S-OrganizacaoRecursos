package br.senac.recursos.reserva.api;

import br.senac.recursos.reserva.aplicacao.ConsultarFilaAprovacao;
import br.senac.recursos.reserva.aplicacao.FiltroFilaAprovacao;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.reserva.infraestrutura.ReservaConsultaMysql;
import br.senac.recursos.shared.Pagina;
import java.time.OffsetDateTime;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** GETs Q9: ator exclusivamente da sessão; filtros nunca ampliam permissões. */
@RestController
@RequestMapping(path = "/api/reservas", produces = MediaType.APPLICATION_JSON_VALUE)
@ConditionalOnProperty(name = "reservas.api.enabled", havingValue = "true")
public class ReservaLeituraController {
    private final ReservaConsultaMysql consultas;
    private final ConsultarFilaAprovacao fila;
    private final AtorAutenticadoProvider atores;

    public ReservaLeituraController(ReservaConsultaMysql consultas, ConsultarFilaAprovacao fila,
                                    AtorAutenticadoProvider atores) {
        this.consultas = consultas;
        this.fila = fila;
        this.atores = atores;
    }

    @GetMapping
    public Pagina<ReservaLeituraResponse> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fim,
            @RequestParam(required = false) Long recursoId,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho) {
        var ator = atores.atorAtual();
        if (ator.papel() == PapelAtor.RESPONSAVEL && StatusReserva.SOLICITADA.name().equals(status)) {
            var filtro = FiltroFilaAprovacao.de(inicio == null ? null : inicio.toInstant(),
                    fim == null ? null : fim.toInstant(), recursoId, pagina, tamanho);
            var resultado = fila.executar(filtro, ator);
            return new Pagina<>(
                    resultado.itens().stream().map(ReservaApiMapper::paraRespostaLeitura).toList(),
                    resultado.pagina(), resultado.tamanho(), resultado.total());
        }
        return consultas.listar(ator, status, inicio, fim, recursoId, pagina, tamanho);
    }

    @GetMapping("/{id}")
    public ReservaLeituraResponse detalhe(@PathVariable long id) {
        return consultas.detalhe(id, atores.atorAtual());
    }
}
