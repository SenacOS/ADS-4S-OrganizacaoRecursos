package br.senac.recursos.seguranca;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.senac.recursos.reserva.dominio.PapelAtor;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

class UsuarioAdminControllerTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final UsuarioAdminController controller = new UsuarioAdminController(jdbc, new BCryptPasswordEncoder());
    private final UsuarioAdminController.CriarUsuario usuario =
            new UsuarioAdminController.CriarUsuario("Ana", "ana@example.com", "senha-MuitoForte123", PapelAtor.SOLICITANTE);

    @Test void cadastroRetornaIdGerado() {
        when(jdbc.update(any(PreparedStatementCreator.class), any(KeyHolder.class)))
                .thenAnswer(inv -> {
                    KeyHolder holder = inv.getArgument(1);
                    holder.getKeyList().add(Map.of("GENERATED_KEY", 42L));
                    return 1;
                });
        assertEquals(42L, controller.cadastrar(usuario).get("id"));
    }

    @Test void emailDuplicadoRetornaConflito() {
        when(jdbc.update(any(PreparedStatementCreator.class), any(KeyHolder.class)))
                .thenThrow(new DuplicateKeyException("unique"));
        var ex = assertThrows(ResponseStatusException.class, () -> controller.cadastrar(usuario));
        assertEquals(409, ex.getStatusCode().value());
    }

    @Test void ausenciaDeIdNaoEhIgnorada() {
        when(jdbc.update(any(PreparedStatementCreator.class), any(KeyHolder.class))).thenReturn(1);
        assertThrows(IllegalStateException.class, () -> controller.cadastrar(usuario));
    }
}
