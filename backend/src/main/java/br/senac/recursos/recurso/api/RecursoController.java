package br.senac.recursos.recurso.api;

import br.senac.recursos.recurso.aplicacao.*;
import br.senac.recursos.recurso.dominio.*;
import br.senac.recursos.reserva.api.AtorAutenticadoProvider;
import br.senac.recursos.reserva.dominio.*;
import br.senac.recursos.shared.*;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@ConditionalOnProperty(name = "recursos.api.enabled", havingValue = "true")
public class RecursoController {
  private final RecursoService s;
  private final AtorAutenticadoProvider a;

  public RecursoController(RecursoService s, AtorAutenticadoProvider a) {
    this.s = s;
    this.a = a;
  }

  @GetMapping("/api/recursos")
  public Pagina<Recurso> pesquisar(@ModelAttribute FiltroRecursos f) {
    return s.pesquisar(f, a.atorAtual());
  }

  @GetMapping("/api/recursos/{id}")
  public Recurso obter(@PathVariable long id) {
    return s.obter(id, a.atorAtual());
  }

  @PostMapping("/api/recursos")
  @ResponseStatus(HttpStatus.CREATED)
  public Recurso criar(@RequestBody DadosRecurso d) {
    return s.salvar(null, d, a.atorAtual());
  }

  @PutMapping("/api/recursos/{id}")
  public Recurso editar(@PathVariable long id, @RequestBody DadosRecurso d) {
    return s.salvar(id, d, a.atorAtual());
  }

  @DeleteMapping("/api/recursos/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void desativar(@PathVariable long id) {
    s.desativar(id, a.atorAtual());
  }

  @GetMapping("/api/horarios-funcionamento")
  public Expediente expediente() {
    return s.consultarExpediente(a.atorAtual());
  }

  public record Janelas(List<JanelaFuncionamento> janelas) {}

  @PutMapping("/api/horarios-funcionamento")
  public Expediente substituir(@RequestBody Janelas j) {
    if (j.janelas() == null) throw new IllegalArgumentException("Janelas obrigatórias.");
    return s.substituirExpediente(j.janelas(), a.atorAtual());
  }

  public record NovoBloqueio(OffsetDateTime inicio, OffsetDateTime fim, String motivo) {}

  @PostMapping("/api/recursos/{id}/bloqueios")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> bloquear(@PathVariable long id, @RequestBody NovoBloqueio c) {
    if (c.inicio() == null || c.fim() == null)
      throw new IllegalArgumentException("Intervalo obrigatório.");
    return s.bloquear(
        id,
        new IntervaloReserva(c.inicio().toInstant(), c.fim().toInstant()),
        c.motivo(),
        a.atorAtual());
  }

  @GetMapping("/api/recursos/{id}/bloqueios")
  public List<Map<String, Object>> bloqueios(@PathVariable long id) {
    return s.bloqueios(id, a.atorAtual());
  }

  @PostMapping("/api/bloqueios/{id}/cancelamento")
  public Map<String, Object> cancelar(@PathVariable long id) {
    return s.cancelarBloqueio(id, a.atorAtual());
  }
}
