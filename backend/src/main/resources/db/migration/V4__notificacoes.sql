-- RF11: outbox transacional (Flyway V4 apos auditoria V3).
CREATE TABLE notificacoes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reserva_id BIGINT NOT NULL,
    evento VARCHAR(40) NOT NULL,
    status_envio VARCHAR(16) NOT NULL DEFAULT 'PENDENTE',
    tentativas INT NOT NULL DEFAULT 0,
    correlacao_id VARCHAR(64) NOT NULL,
    criado_em DATETIME(6) NOT NULL,
    atualizado_em DATETIME(6) NOT NULL,
    proxima_tentativa_em DATETIME(6) NOT NULL,
    enviado_em DATETIME(6),
    ultimo_erro VARCHAR(100),
    CONSTRAINT fk_notificacoes_reserva FOREIGN KEY (reserva_id) REFERENCES reservas(id),
    CONSTRAINT chk_notificacoes_status CHECK (
        status_envio IN ('PENDENTE', 'ENVIANDO', 'ENVIADA', 'ERRO', 'FALHA')
    ),
    CONSTRAINT chk_notificacoes_tentativas CHECK (tentativas >= 0),
    INDEX idx_notificacoes_pendentes (status_envio, proxima_tentativa_em, id),
    INDEX idx_notificacoes_reserva (reserva_id, id)
) ENGINE=InnoDB;
