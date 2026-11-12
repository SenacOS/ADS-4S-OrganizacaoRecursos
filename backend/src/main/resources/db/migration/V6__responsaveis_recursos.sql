-- Vínculo explícito de responsabilidade. Sem concessões automáticas: na ausência de vínculo, negar.
-- Permite mais de um responsável por recurso; a política Q9 exige todos os recursos
-- da reserva para leitura completa e decisões, até ratificação da regra multi-recurso.
CREATE TABLE responsaveis_recursos (
    recurso_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    PRIMARY KEY (recurso_id, usuario_id),
    CONSTRAINT fk_responsaveis_recursos_recurso FOREIGN KEY (recurso_id) REFERENCES recursos(id),
    CONSTRAINT fk_responsaveis_recursos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_responsaveis_recursos_usuario (usuario_id, recurso_id)
) ENGINE=InnoDB;
