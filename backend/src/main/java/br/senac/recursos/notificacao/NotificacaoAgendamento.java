package br.senac.recursos.notificacao;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/** Ativado apenas com NOTIFICACOES_WORKER_ENABLED=true. */
@Configuration
@EnableScheduling
@ConditionalOnProperty(prefix = "notificacoes.worker", name = "enabled", havingValue = "true")
public class NotificacaoAgendamento {
    private final ProcessadorNotificacoes processador;

    public NotificacaoAgendamento(ProcessadorNotificacoes processador) {
        this.processador = processador;
    }

    @Scheduled(fixedDelay = 30000)
    public void executar() {
        processador.processarLote(20);
    }
}
