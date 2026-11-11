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
    private static final java.util.regex.Pattern CORRELACAO =
            java.util.regex.Pattern.compile("[A-Za-z0-9._-]{1,64}");

    private final JdbcTemplate jdbc;
    private final PasswordEncoder senhas;
    private final br.senac.recursos.reserva.aplicacao.AuditoriaPort auditoria;
    private final java.time.Clock clock;

    public UsuarioAdminController(JdbcTemplate jdbc, PasswordEncoder senhas,
                                  br.senac.recursos.reserva.aplicacao.AuditoriaPort auditoria,
                                  java.time.Clock clock) {
        this.jdbc = jdbc;
        this.senhas = senhas;
        this.auditoria = auditoria;
        this.clock = clock;
    }

    public record CriarUsuario(
            @NotBlank String nome,
            @Email @NotBlank String email,
            @Size(min = 8, max = 128) @NotBlank String senha,
            @NotNull PapelAtor perfil) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.transaction.annotation.Transactional
    public Map<String, Long> cadastrar(
            @Valid @RequestBody CriarUsuario corpo,
            @org.springframework.security.core.annotation.AuthenticationPrincipal UsuarioPrincipal ator,
            @org.springframework.web.bind.annotation.RequestHeader(
                name = "X-Correlation-Id", required = false) String correlacaoRecebida) {
        if (ator == null || ator.papel() != PapelAtor.ADMINISTRADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas administrador pode cadastrar usuários");
        }
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
        String correlacao = correlacaoRecebida != null
                && CORRELACAO.matcher(correlacaoRecebida).matches()
                ? correlacaoRecebida : java.util.UUID.randomUUID().toString();
        // Nunca inclui e-mail, nome nem hash nos snapshots da auditoria.
        auditoria.registrar(new br.senac.recursos.reserva.aplicacao.RegistroAuditoria(
                "USUARIO", id.longValue(), ator.id(),
                br.senac.recursos.reserva.dominio.AcaoReserva.CRIACAO,
                null, "perfil=" + corpo.perfil().name() + "; ativo=true",
                correlacao, clock.instant()));
        return Map.of("id", id.longValue());
    }
}
