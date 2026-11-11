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

-- A aplicacao expoe apenas INSERT e SELECT para esta tabela.
-- Em producao, utilizar conta de runtime com somente SELECT/INSERT nesta tabela;
-- a conta de migracao deve ser separada e privilegiada para executar Flyway.
-- Nao criar triggers aqui: MySQL com binary logging pode exigir SUPER (erro 1419).
