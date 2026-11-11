-- RF10: trilha de auditoria append-only; V2 e reservada para perfis de usuario.
-- Sem FK do ator/entidade para preservar historico mesmo apos desativacoes.
CREATE TABLE auditoria (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entidade VARCHAR(40) NOT NULL,
    entidade_id BIGINT NOT NULL,
    ator_id BIGINT NOT NULL,
    acao VARCHAR(40) NOT NULL,
    antes TEXT,
    depois TEXT,
    correlacao_id VARCHAR(64) NOT NULL,
    momento DATETIME(6) NOT NULL,
    INDEX idx_auditoria_entidade (entidade, entidade_id, id),
    INDEX idx_auditoria_correlacao (correlacao_id)
) ENGINE=InnoDB;

-- Defesa em profundidade: nem comandos SQL comuns podem reescrever ou apagar eventos.
CREATE TRIGGER auditoria_bloquear_update BEFORE UPDATE ON auditoria
FOR EACH ROW SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'Auditoria imutavel: UPDATE proibido';

CREATE TRIGGER auditoria_bloquear_delete BEFORE DELETE ON auditoria
FOR EACH ROW SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'Auditoria imutavel: DELETE proibido';
