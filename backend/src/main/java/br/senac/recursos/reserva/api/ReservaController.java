package br.senac.recursos.reserva.api;

import br.senac.recursos.reserva.aplicacao.ReservaService;
import br.senac.recursos.reserva.dominio.Reserva;
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Camada HTTP das reservas (contrato: docs/api/reservas-contrato.md).
 * Só converte, delega ao {@link ReservaService} e devolve; nenhuma regra de negócio aqui.
 *
 * <p>Desligado por padrão: ative com {@code reservas.api.enabled=true} quando o bean
 * {@code ReservaService} e o {@link AtorAutenticadoProvider} existirem.
 */
@RestController
@RequestMapping(path = "/api/reservas", produces = MediaType.APPLICATION_JSON_VALUE)
@ConditionalOnProperty(name = "reservas.api.enabled", havingValue = "true")
public class ReservaController {

    private final ReservaService servico;
    private final AtorAutenticadoProvider atores;

    public ReservaController(ReservaService servico, AtorAutenticadoProvider atores) {
        this.servico = servico;
        this.atores = atores;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ReservaResponse> criar(@Valid @RequestBody ReservaRequest corpo) {
        Reserva criada = servico.criar(ReservaApiMapper.paraComando(corpo), atores.atorAtual());
        return ResponseEntity.status(HttpStatus.CREATED).body(ReservaApiMapper.paraResposta(criada));
    }

    /** PATCH substitui intervalo e recursos juntos (ambos obrigatórios). */
    @PatchMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ReservaResponse editar(@PathVariable long id, @Valid @RequestBody ReservaRequest corpo) {
        return ReservaApiMapper.paraResposta(
                servico.editar(id, ReservaApiMapper.paraComando(corpo), atores.atorAtual()));
    }

    /** Corpo opcional: {@code motivo} é exigido só do Administrador cancelando reserva de terceiro (Q5). */
    @PostMapping("/{id}/cancelamento")
    public ReservaResponse cancelar(@PathVariable long id,
                                    @Valid @RequestBody(required = false) CancelarReservaRequest corpo) {
        String motivo = corpo == null ? null : corpo.motivo();
        return ReservaApiMapper.paraResposta(servico.cancelar(id, atores.atorAtual(), motivo));
    }

    @PostMapping("/{id}/aprovacao")
    public ReservaResponse aprovar(@PathVariable long id) {
        return ReservaApiMapper.paraResposta(servico.aprovar(id, atores.atorAtual()));
    }

    @PostMapping(path = "/{id}/rejeicao", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ReservaResponse rejeitar(@PathVariable long id, @Valid @RequestBody RejeitarReservaRequest corpo) {
        return ReservaApiMapper.paraResposta(servico.rejeitar(id, atores.atorAtual(), corpo.motivo()));
    }

    /** PROPOSTO (Q1). */
    @PostMapping("/{id}/inicio")
    public ReservaResponse iniciarUso(@PathVariable long id) {
        return ReservaApiMapper.paraResposta(servico.iniciarUso(id, atores.atorAtual()));
    }

    /** PROPOSTO (Q1). */
    @PostMapping("/{id}/conclusao")
    public ReservaResponse concluir(@PathVariable long id) {
        return ReservaApiMapper.paraResposta(servico.concluir(id, atores.atorAtual()));
    }

    /** PROPOSTO (Q1). */
    @PostMapping("/{id}/nao-comparecimento")
    public ReservaResponse registrarNaoComparecimento(@PathVariable long id) {
        return ReservaApiMapper.paraResposta(servico.registrarNaoComparecimento(id, atores.atorAtual()));
    }
}
