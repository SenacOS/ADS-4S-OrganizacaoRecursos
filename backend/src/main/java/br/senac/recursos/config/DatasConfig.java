package br.senac.recursos.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.module.SimpleModule;
import java.io.IOException;
import java.time.*;
import org.springframework.context.annotation.*;

@Configuration
public class DatasConfig {
  @Bean
  public com.fasterxml.jackson.databind.Module instantes() {
    var m = new SimpleModule();
    m.addSerializer(
        Instant.class,
        new JsonSerializer<Instant>() {
          public void serialize(Instant i, JsonGenerator g, SerializerProvider p)
              throws IOException {
            g.writeString(i.atZone(ZoneId.of("America/Sao_Paulo")).toOffsetDateTime().toString());
          }
        });
    return m;
  }
}
