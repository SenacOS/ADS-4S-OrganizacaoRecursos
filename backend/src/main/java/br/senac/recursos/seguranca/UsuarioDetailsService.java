package br.senac.recursos.seguranca;

import br.senac.recursos.reserva.dominio.PapelAtor;
import java.util.Locale;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Depende da tabela usuarios criada pela migração V1 do PR #6 e alterada por V2. */
@Service
public class UsuarioDetailsService implements UserDetailsService {
    private final JdbcTemplate jdbc;

    public UsuarioDetailsService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        if (email == null || email.isBlank()) throw new UsernameNotFoundException("Credenciais inválidas");
        var usuarios = jdbc.query("""
                SELECT id, email, senha_hash, perfil, ativo
                  FROM usuarios WHERE email = ?
                """, (rs, row) -> new UsuarioPrincipal(
                        rs.getLong("id"),
                        rs.getString("email"),
                        rs.getString("senha_hash"),
                        PapelAtor.valueOf(rs.getString("perfil")),
                        rs.getBoolean("ativo")),
                email.strip().toLowerCase(Locale.ROOT));
        if (usuarios.isEmpty()) throw new UsernameNotFoundException("Credenciais inválidas");
        return usuarios.getFirst();
    }
}
