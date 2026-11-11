package br.senac.recursos.seguranca;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** O POST /api/auth/login e /api/auth/logout é atendido pelos filtros do Spring Security. */
@RestController
@RequestMapping("/api/auth")
public class SessaoController {
    public record UsuarioAtual(long usuarioId, String email, String papel) {}

    @GetMapping("/csrf")
    public Map<String, String> csrf(HttpServletRequest request) {
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (token == null) throw new IllegalStateException("Filtro CSRF indisponível");
        return Map.of("token", token.getToken(), "header", token.getHeaderName());
    }

    @GetMapping("/me")
    public UsuarioAtual me(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return new UsuarioAtual(principal.id(), principal.getUsername(), principal.papel().name());
    }
}
