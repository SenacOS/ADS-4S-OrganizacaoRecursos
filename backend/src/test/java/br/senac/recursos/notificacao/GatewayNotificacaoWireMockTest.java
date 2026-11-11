package br.senac.recursos.notificacao;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.WireMockServer;
import java.time.Instant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class GatewayNotificacaoWireMockTest {
    private WireMockServer servidor;
    private GatewayNotificacaoPadrao gateway;
    private GatewayNotificacao.Mensagem mensagem;

    @BeforeEach
    void iniciar() {
        servidor = new WireMockServer(com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig().dynamicPort());
        servidor.start();
        gateway = new GatewayNotificacaoPadrao(
                "http://localhost:" + servidor.port() + "/notificacoes", new ObjectMapper());
        mensagem = new GatewayNotificacao.Mensagem(
                42, 77, "RESERVA_APROVADA", "correlacao-123",
                Instant.parse("2026-11-10T15:30:00Z"));
    }

    @AfterEach
    void parar() {
        servidor.stop();
    }

    @Test
    void respostaHttp202RegistraEnvioComChaveIdempotente() {
        servidor.stubFor(post(urlEqualTo("/notificacoes"))
                .willReturn(aResponse().withStatus(202)));
        assertDoesNotThrow(() -> gateway.enviar(mensagem));
        servidor.verify(1, postRequestedFor(urlEqualTo("/notificacoes"))
                .withHeader("X-Idempotency-Key", equalTo("42"))
                .withRequestBody(containing("RESERVA_APROVADA")));
    }

    @Test
    void erroHttp500EhRepassadoAoProcessadorParaRetry() {
        servidor.stubFor(post(urlEqualTo("/notificacoes"))
                .willReturn(aResponse().withStatus(500).withBody("erro interno")));
        IllegalStateException erro = assertThrows(IllegalStateException.class,
                () -> gateway.enviar(mensagem));
        assertEquals("Gateway de notificacao: HTTP 500", erro.getMessage());
        assertFalse(erro.getMessage().contains("erro interno"));
    }

    @Test
    void timeoutNoGatewayEhFalhaDeEntregaSemExporRespostaInterna() {
        servidor.stubFor(post(urlEqualTo("/notificacoes"))
                .willReturn(aResponse().withStatus(202).withFixedDelay(6000)));
        IllegalStateException falha = assertThrows(IllegalStateException.class,
                () -> gateway.enviar(mensagem));
        assertEquals("Gateway de notificacao indisponivel", falha.getMessage());
        assertInstanceOf(java.io.IOException.class, falha.getCause());
        servidor.verify(1, postRequestedFor(urlEqualTo("/notificacoes"))
                .withHeader("X-Idempotency-Key", equalTo("42")));
    }

    @Test
    void modoSimuladoNaoUsaRede() {
        var local = new GatewayNotificacaoPadrao("", new ObjectMapper());
        assertDoesNotThrow(() -> local.enviar(mensagem));
    }

    @Test
    void protocoloNaoHttpEhRejeitado() {
        assertThrows(IllegalArgumentException.class,
                () -> new GatewayNotificacaoPadrao("file:///etc/passwd", new ObjectMapper()));
    }
}
