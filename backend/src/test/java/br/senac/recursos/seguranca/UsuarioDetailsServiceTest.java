package br.senac.recursos.seguranca;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.senac.recursos.reserva.dominio.PapelAtor;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

class UsuarioDetailsServiceTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final UsuarioDetailsService service = new UsuarioDetailsService(jdbc);

    @Test void emailVazioEhRejeitado() {
        assertThrows(UsernameNotFoundException.class, () -> service.loadUserByUsername("  "));
    }

    @Test void usuarioInexistenteEhRejeitado() {
        when(jdbc.query(anyString(), org.mockito.ArgumentMatchers.<org.springframework.jdbc.core.RowMapper<UsuarioPrincipal>>any(),
                eq("naoexiste@example.com"))).thenReturn(List.of());
        assertThrows(UsernameNotFoundException.class,
                () -> service.loadUserByUsername("NAOEXISTE@example.com"));
    }

    @Test void preservaIdPapelEEstadoDoUsuario() {
        var usuario = new UsuarioPrincipal(17, "ana@example.com", "hash", PapelAtor.ADMINISTRADOR, false);
        when(jdbc.query(anyString(), org.mockito.ArgumentMatchers.<org.springframework.jdbc.core.RowMapper<UsuarioPrincipal>>any(),
                eq("ana@example.com"))).thenReturn(List.of(usuario));
        var resultado = (UsuarioPrincipal) service.loadUserByUsername("ANA@example.com");
        assertEquals(17L, resultado.id());
        assertEquals(PapelAtor.ADMINISTRADOR, resultado.papel());
        assertEquals(false, resultado.isEnabled());
    }
}
