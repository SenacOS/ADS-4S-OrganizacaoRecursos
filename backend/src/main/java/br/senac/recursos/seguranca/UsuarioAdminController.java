package br.senac.recursos.seguranca;

import br.senac.recursos.reserva.dominio.PapelAtor;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.sql.Statement;
import java.util.Locale;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Cadastro administrativo; filtro de segurança limita POST a ADMINISTRADOR. */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioAdminController {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder senhas;

    public UsuarioAdminController(JdbcTemplate jdbc, PasswordEncoder senhas) {
        this.jdbc = jdbc;
        this.senhas = senhas;
    }

    public record CriarUsuario(
            @NotBlank String nome,
            @Email @NotBlank String email,
            @Size(min = 8, max = 128) @NotBlank String senha,
            @NotNull PapelAtor perfil) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Long> cadastrar(@Valid @RequestBody CriarUsuario corpo) {
        var chave = new GeneratedKeyHolder();
        try {
            jdbc.update(connection -> {
                var stmt = connection.prepareStatement("""
                    INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
                    VALUES (?, ?, ?, ?, TRUE)
                    """, Statement.RETURN_GENERATED_KEYS);
                stmt.setString(1, corpo.nome().strip());
                stmt.setString(2, corpo.email().strip().toLowerCase(Locale.ROOT));
                stmt.setString(3, senhas.encode(corpo.senha()));
                stmt.setString(4, corpo.perfil().name());
                return stmt;
            }, chave);
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        Number id = chave.getKey();
        if (id == null) throw new IllegalStateException("Banco não retornou o ID do usuário");
        return Map.of("id", id.longValue());
    }
}
