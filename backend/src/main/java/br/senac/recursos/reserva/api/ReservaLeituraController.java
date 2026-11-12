package br.senac.recursos.reserva.api;

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
    private final AtorAutenticadoProvider atores;

    public ReservaLeituraController(ReservaConsultaMysql consultas, AtorAutenticadoProvider atores) {
        this.consultas = consultas;
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
        return consultas.listar(atores.atorAtual(), status, inicio, fim, recursoId, pagina, tamanho);
    }

    @GetMapping("/{id}")
    public ReservaLeituraResponse detalhe(@PathVariable long id) {
        return consultas.detalhe(id, atores.atorAtual());
    }
}
