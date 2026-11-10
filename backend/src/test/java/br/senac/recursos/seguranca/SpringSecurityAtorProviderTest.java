package br.senac.recursos.seguranca;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import br.senac.recursos.reserva.dominio.PapelAtor;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class SpringSecurityAtorProviderTest {
    private final SpringSecurityAtorProvider provider = new SpringSecurityAtorProvider();

    @AfterEach void limpar() { SecurityContextHolder.clearContext(); }

    @Test void semSessaoNaoRetornaAtor() {
        assertThrows(InsufficientAuthenticationException.class, provider::atorAtual);
    }

    @Test void identidadeVemDoPrincipalAutenticado() {
        var principal = new UsuarioPrincipal(41L, "ana@example.com", "hash", PapelAtor.RESPONSAVEL, true);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
        var ator = provider.atorAtual();
        assertEquals(41L, ator.usuarioId());
        assertEquals(PapelAtor.RESPONSAVEL, ator.papel());
    }

    @Test void principalDiferenteDoUsuarioRealEhRejeitado() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("ana", null,
                        java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_RESPONSAVEL"))));
        assertThrows(InsufficientAuthenticationException.class, provider::atorAtual);
    }
}
