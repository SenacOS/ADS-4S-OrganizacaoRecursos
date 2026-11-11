package br.senac.recursos.seguranca;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;

/** ADR-004: sessão HTTP, BCrypt, CSRF e autorização de defesa em profundidade. */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final Pattern CORRELACAO = Pattern.compile("[A-Za-z0-9._-]{1,64}");

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectMapper json) throws Exception {
        http
            .csrf(csrf -> csrf.csrfTokenRepository(new HttpSessionCsrfTokenRepository()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST,
                        "/api/reservas/*/aprovacao", "/api/reservas/*/rejeicao")
                    .hasRole("RESPONSAVEL")
                .requestMatchers(HttpMethod.POST, "/api/usuarios", "/api/usuarios/**")
                    .hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.POST, "/api/recursos/**", "/api/bloqueios/**")
                    .hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT, "/api/recursos/**", "/api/bloqueios/**")
                    .hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PATCH, "/api/recursos/**", "/api/bloqueios/**")
                    .hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/recursos/**", "/api/bloqueios/**")
                    .hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/auditoria/**")
                    .hasRole("ADMINISTRADOR")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll())
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .usernameParameter("email").passwordParameter("senha")
                .successHandler((request, response, authentication) -> response.setStatus(204))
                .failureHandler((request, response, ex) ->
                    escreverErro(response, request, json, 401, "CREDENCIAIS_INVALIDAS", "Credenciais inválidas"))
                .permitAll())
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
            .sessionManagement(session -> session.sessionFixation().migrateSession())
            .exceptionHandling(errors -> errors
                .authenticationEntryPoint((request, response, ex) ->
                    escreverErro(response, request, json, 401, "NAO_AUTENTICADO", "Autenticação necessária"))
                .accessDeniedHandler((request, response, ex) ->
                    escreverErro(response, request, json, 403, "OPERACAO_NAO_PERMITIDA", "Acesso negado")))
            .httpBasic(AbstractHttpConfigurer::disable);
        return http.build();
    }

    private static void escreverErro(HttpServletResponse response, HttpServletRequest request,
                                     ObjectMapper json, int status, String codigo, String mensagem)
            throws IOException {
        String recebido = request.getHeader("X-Correlation-Id");
        String id = recebido != null && CORRELACAO.matcher(recebido).matches()
                ? recebido : UUID.randomUUID().toString();
        response.setStatus(status);
        response.setCharacterEncoding("UTF-8");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        json.writeValue(response.getWriter(), new ErroSeguranca(codigo, mensagem, id));
    }

    public record ErroSeguranca(String codigo, String mensagem, String correlationId) {}
}
