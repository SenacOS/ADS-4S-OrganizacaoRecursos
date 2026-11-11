package br.senac.recursos.seguranca;

import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Apenas no perfil local: cria primeiro admin com credenciais de variáveis de ambiente. */
@Configuration
@Profile("local")
public class BootstrapAdminLocal {
    @Bean
    ApplicationRunner criarAdminLocal(JdbcTemplate jdbc, PasswordEncoder encoder,
            @Value("${demo.admin.email:}") String email,
            @Value("${demo.admin.senha:}") String senha) {
        return args -> {
            if (email.isBlank() || senha.isBlank()) return;
            if (senha.length() < 12) throw new IllegalArgumentException("Senha inicial deve ter >= 12 caracteres");
            String normalizado = email.strip().toLowerCase(Locale.ROOT);
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM usuarios WHERE email = ?", Integer.class, normalizado);
            if (count != null && count == 0) {
                jdbc.update("""
                    INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
                    VALUES (?, ?, ?, 'ADMINISTRADOR', TRUE)
                    """, "Administrador local", normalizado, encoder.encode(senha));
            }
        };
    }
}
