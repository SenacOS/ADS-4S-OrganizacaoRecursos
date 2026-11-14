package br.senac.recursos.recurso.infraestrutura;

import java.sql.*;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.*;
import org.springframework.jdbc.support.*;
import org.springframework.stereotype.Component;

@Component
public class Banco {
  public final JdbcTemplate jdbc;

  public Banco(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public long inserir(String sql, Object... args) {
    KeyHolder key = new GeneratedKeyHolder();
    jdbc.update(
        c -> {
          var p = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
          for (int i = 0; i < args.length; i++) p.setObject(i + 1, args[i]);
          return p;
        },
        key);
    return Objects.requireNonNull(key.getKey()).longValue();
  }

  public static LocalDateTime utc(Instant i) {
    return LocalDateTime.ofInstant(i, ZoneOffset.UTC);
  }

  public static Instant instante(ResultSet r, String campo) throws SQLException {
    return r.getObject(campo, LocalDateTime.class).toInstant(ZoneOffset.UTC);
  }
}
