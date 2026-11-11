package br.senac.recursos.seguranca;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class BootstrapAdminLocalTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final BootstrapAdminLocal bootstrap = new BootstrapAdminLocal();
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Test void semCredenciaisNaoFazNada() throws Exception {
        bootstrap.criarAdminLocal(jdbc, encoder, "", "").run(null);
        verify(jdbc, never()).queryForObject(anyString(), eq(Integer.class), any(Object.class));
    }

    @Test void senhaFracaEhRejeitada() {
        assertThrows(IllegalArgumentException.class,
                () -> bootstrap.criarAdminLocal(jdbc, encoder, "adm@example.com", "fraca").run(null));
    }

    @Test void contaExistenteNaoEhSobrescrita() throws Exception {
        when(jdbc.queryForObject(anyString(), eq(Integer.class), eq("adm@example.com"))).thenReturn(1);
        bootstrap.criarAdminLocal(jdbc, encoder, "ADM@example.com", "senha-Inicial-Forte123").run(null);
        verify(jdbc, never()).update(anyString(), any(Object[].class));
    }

    @Test void criaContaLocalSeNaoExistir() throws Exception {
        when(jdbc.queryForObject(anyString(), eq(Integer.class), eq("adm@example.com"))).thenReturn(0);
        bootstrap.criarAdminLocal(jdbc, encoder, "ADM@example.com", "senha-Inicial-Forte123").run(null);
        verify(jdbc).update(anyString(), eq("Administrador local"), eq("adm@example.com"), anyString());
    }
}
