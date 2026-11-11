package br.senac.recursos.notificacao;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * URL nao configurada: simulacao local (sem rede/e-mail).
 * URL HTTP(S): POST JSON com metadados e chave de idempotencia.
 */
@Component
public class GatewayNotificacaoPadrao implements GatewayNotificacao {
    private static final Logger LOG = LoggerFactory.getLogger(GatewayNotificacaoPadrao.class);
    private final URI endpoint;
    private final ObjectMapper mapper;
    private final HttpClient client;

    @Autowired
    public GatewayNotificacaoPadrao(Environment ambiente, ObjectMapper mapper) {
        this(ambiente.getProperty("notificacoes.gateway.url", ""), mapper);
    }

    public GatewayNotificacaoPadrao(String url, ObjectMapper mapper) {
        this.mapper = mapper;
        this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
        if (url == null || url.isBlank()) {
            this.endpoint = null;
        } else {
            this.endpoint = URI.create(url.strip());
            if (!"http".equalsIgnoreCase(endpoint.getScheme())
                    && !"https".equalsIgnoreCase(endpoint.getScheme())) {
                throw new IllegalArgumentException("Gateway requer URL HTTP(S).");
            }
        }
    }

    @Override
    public void enviar(Mensagem mensagem) {
        if (endpoint == null) {
            LOG.info("Notificacao simulada id={} evento={} reserva={}",
                    mensagem.id(), mensagem.evento(), mensagem.reservaId());
            return;
        }

        try {
            String corpo = mapper.writeValueAsString(Map.of(
                    "id", mensagem.id(),
                    "reservaId", mensagem.reservaId(),
                    "evento", mensagem.evento(),
                    "correlacaoId", mensagem.correlacaoId(),
                    "criadoEm", mensagem.criadoEm().toString()));
            HttpRequest pedido = HttpRequest.newBuilder(endpoint)
                    .timeout(Duration.ofSeconds(5))
                    .header("Content-Type", "application/json")
                    .header("X-Idempotency-Key", Long.toString(mensagem.id()))
                    .POST(HttpRequest.BodyPublishers.ofString(corpo))
                    .build();
            HttpResponse<Void> resposta = client.send(
                    pedido, HttpResponse.BodyHandlers.discarding());
            if (resposta.statusCode() < 200 || resposta.statusCode() >= 300) {
                throw new IllegalStateException("Gateway de notificacao: HTTP "
                        + resposta.statusCode());
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Gateway de notificacao interrompido", ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Gateway de notificacao indisponivel", ex);
        }
    }
}
