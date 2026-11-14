package br.senac.recursos.seguranca;

import br.senac.recursos.reserva.api.AtorAutenticadoProvider;
import br.senac.recursos.reserva.dominio.AtorReserva;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/** Implementa D1: ID e perfil são obtidos exclusivamente da sessão autenticada. */
@Component
public class SpringSecurityAtorProvider implements AtorAutenticadoProvider {
    @Override
    public AtorReserva atorAtual() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UsuarioPrincipal principal)) {
            throw new InsufficientAuthenticationException("Autenticação necessária");
        }
        return new AtorReserva(principal.id(), principal.papel());
    }
}
