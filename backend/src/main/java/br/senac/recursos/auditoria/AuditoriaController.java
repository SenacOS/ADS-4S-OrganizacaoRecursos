package br.senac.recursos.auditoria;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exibe trilha historica somente ao Administrador; regra HTTP fica em SecurityConfig.
 * Nao existem endpoints de criacao, edicao ou exclusao de auditoria.
 */
@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {
    private final AuditoriaConsulta consulta;

    public AuditoriaController(AuditoriaConsulta consulta) {
        this.consulta = consulta;
    }

    @GetMapping("/{entidade}/{entidadeId}")
    public List<AuditoriaConsulta.Entrada> consultar(
            @PathVariable String entidade, @PathVariable long entidadeId) {
        return consulta.consultar(entidade, entidadeId);
    }
}
