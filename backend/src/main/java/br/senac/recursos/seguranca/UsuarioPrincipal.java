package br.senac.recursos.seguranca;

import br.senac.recursos.reserva.dominio.PapelAtor;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/** Identidade confiável carregada do banco, nunca do corpo de uma requisição. */
public final class UsuarioPrincipal implements UserDetails {
    private static final long serialVersionUID = 1L;
    private final long id;
    private final String email;
    private final String senhaHash;
    private final PapelAtor papel;
    private final boolean ativo;

    public UsuarioPrincipal(long id, String email, String senhaHash, PapelAtor papel, boolean ativo) {
        if (id <= 0) throw new IllegalArgumentException("ID de usuário inválido");
        this.id = id;
        this.email = Objects.requireNonNull(email);
        this.senhaHash = Objects.requireNonNull(senhaHash);
        this.papel = Objects.requireNonNull(papel);
        this.ativo = ativo;
    }

    public long id() { return id; }
    public PapelAtor papel() { return papel; }
    @Override public String getUsername() { return email; }
    @Override public String getPassword() { return senhaHash; }
    @Override public boolean isEnabled() { return ativo; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + papel.name()));
    }
    @Override public String toString() { return "UsuarioPrincipal{id=" + id + ", papel=" + papel + "}"; }
}
