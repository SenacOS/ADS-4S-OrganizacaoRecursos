package br.senac.recursos.movimentacao.api;

import br.senac.recursos.movimentacao.aplicacao.*;
import br.senac.recursos.movimentacao.dominio.*;
import br.senac.recursos.reserva.api.AtorAutenticadoProvider;
import java.util.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movimentacoes")
@ConditionalOnProperty(name = "movimentacoes.api.enabled", havingValue = "true")
public class MovimentacaoController {
  private final MovimentacaoService s;
  private final AtorAutenticadoProvider a;

  public MovimentacaoController(MovimentacaoService s, AtorAutenticadoProvider a) {
    this.s = s;
    this.a = a;
  }

  @GetMapping
  public List<Movimentacao> listar(@RequestParam(defaultValue = "false") boolean abertas) {
    return s.listar(abertas, a.atorAtual());
  }

  public record Retirada(long reservaId, long recursoId) {}

  @PostMapping("/retiradas")
  @ResponseStatus(HttpStatus.CREATED)
  public Movimentacao retirar(@RequestBody Retirada r) {
    return s.retirar(r.reservaId(), r.recursoId(), a.atorAtual());
  }

  @PostMapping("/{id}/devolucao")
  public Movimentacao devolver(@PathVariable long id) {
    return s.devolver(id, a.atorAtual());
  }
}
