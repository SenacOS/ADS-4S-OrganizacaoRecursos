package br.senac.recursos.notificacao;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import br.senac.recursos.reserva.aplicacao.EventoNotificacao;
import br.senac.recursos.reserva.aplicacao.NotificacaoPort;
import br.senac.recursos.reserva.aplicacao.TipoEventoNotificacao;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(properties = "notificacoes.worker.enabled=false")
@Testcontainers
class NotificacaoMysqlIT {
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void banco(DynamicPropertyRegistry props) {
        props.add("spring.datasource.url", mysql::getJdbcUrl);
        props.add("spring.datasource.username", mysql::getUsername);
        props.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired NotificacaoPort outbox;
    @Autowired ProcessadorNotificacoes processador;
    @Autowired PlatformTransactionManager transacoes;
    @MockitoBean GatewayNotificacao gateway;

    @BeforeEach
    void preparar() {
        reset(gateway);
        jdbc.update("DELETE FROM notificacoes");
        jdbc.update("DELETE FROM reservas");
        jdbc.update("DELETE FROM usuarios");
        jdbc.update("INSERT INTO usuarios(id, nome, email, senha_hash) VALUES"
                + " (11, 'Teste RF11', 'rf11@teste.local', 'hash')");
        jdbc.update("""
                INSERT INTO reservas
                    (id, solicitante_id, inicio_utc, fim_utc, restrita, status)
                VALUES (77, 11, '2026-11-10 15:00:00', '2026-11-10 16:00:00',
                        false, 'APROVADA')
                """);
    }

    private TransactionTemplate tx() {
        return new TransactionTemplate(transacoes);
    }

    private EventoNotificacao evento(TipoEventoNotificacao tipo) {
        return new EventoNotificacao(77, tipo, UUID.randomUUID().toString(),
                Instant.now().minusSeconds(5));
    }

    private String status() {
        return jdbc.queryForObject(
                "SELECT status_envio FROM notificacoes ORDER BY id DESC LIMIT 1",
                String.class);
    }

    @Test
    void aprovacaoPersisteEEnviaApenasAposCommit() {
        tx().executeWithoutResult(s ->
                outbox.registrarPendente(evento(TipoEventoNotificacao.RESERVA_APROVADA)));

        assertEquals("PENDENTE", status());
        assertEquals(1, processador.processarLote(10));
        assertEquals("ENVIADA", status());
        assertEquals(1, jdbc.queryForObject(
                "SELECT tentativas FROM notificacoes", Integer.class));
        verify(gateway).enviar(any());
        assertEquals(0, processador.processarLote(10));
    }

    @Test
    void rollbackNaoDeixaNotificacaoOrfa() {
        tx().executeWithoutResult(s -> {
            outbox.registrarPendente(evento(TipoEventoNotificacao.RESERVA_CRIADA));
            s.setRollbackOnly();
        });
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM notificacoes", Integer.class));
        verifyNoInteractions(gateway);
    }

    @Test
    void eventoNaoEhEntregueAntesDoCommit() {
        tx().executeWithoutResult(s -> {
            outbox.registrarPendente(evento(TipoEventoNotificacao.RESERVA_CRIADA));
            assertEquals(0, processador.processarLote(1));
            verifyNoInteractions(gateway);
        });
        assertEquals(1, processador.processarLote(1));
        assertEquals("ENVIADA", status());
    }

    @Test
    void erroDeGatewayAgendaNovaTentativaSemPerderReserva() {
        doThrow(new IllegalStateException("HTTP 500")).doNothing()
                .when(gateway).enviar(any());
        tx().executeWithoutResult(s ->
                outbox.registrarPendente(evento(TipoEventoNotificacao.RESERVA_REJEITADA)));

        assertEquals(1, processador.processarLote(1));
        assertEquals("ERRO", status());
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM reservas", Integer.class));
        assertEquals(0, processador.processarLote(1));

        jdbc.update("UPDATE notificacoes SET proxima_tentativa_em='2000-01-01 00:00:00'");
        assertEquals(1, processador.processarLote(1));
        assertEquals("ENVIADA", status());
        assertEquals(2, jdbc.queryForObject(
                "SELECT tentativas FROM notificacoes", Integer.class));
        verify(gateway, times(2)).enviar(any());
    }

    @Test
    void falhaPermanenteFicaRastreadaAposTresTentativas() {
        doThrow(new IllegalStateException("Gateway indisponivel")).when(gateway).enviar(any());
        tx().executeWithoutResult(s ->
                outbox.registrarPendente(evento(TipoEventoNotificacao.RESERVA_CANCELADA)));

        for (int tentativa = 0; tentativa < 3; tentativa++) {
            assertEquals(1, processador.processarLote(1));
            jdbc.update("UPDATE notificacoes SET proxima_tentativa_em='2000-01-01 00:00:00'");
        }
        assertEquals("FALHA", status());
        assertEquals(3, jdbc.queryForObject(
                "SELECT tentativas FROM notificacoes", Integer.class));
        assertEquals(0, processador.processarLote(1));
        assertEquals("FALHA_DE_ENTREGA",
                jdbc.queryForObject("SELECT ultimo_erro FROM notificacoes", String.class));
    }

    @Test
    void devolucaoDeMaterialEhUmEventoValido() {
        tx().executeWithoutResult(s ->
                outbox.registrarPendente(evento(TipoEventoNotificacao.MATERIAL_DEVOLVIDO)));
        assertEquals("MATERIAL_DEVOLVIDO",
                jdbc.queryForObject("SELECT evento FROM notificacoes", String.class));
    }

    @Test
    void registroExigeTransacaoDoDominio() {
        assertThrows(IllegalTransactionStateException.class,
                () -> outbox.registrarPendente(evento(TipoEventoNotificacao.RESERVA_CRIADA)));
    }

    @Test
    void limitesDoLoteSaoValidados() {
        assertThrows(IllegalArgumentException.class, () -> processador.processarLote(0));
        assertThrows(IllegalArgumentException.class, () -> processador.processarLote(101));
    }
}
