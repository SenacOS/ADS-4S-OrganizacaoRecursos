-- Exige V1__item18.sql do PR #6, que cria a tabela usuarios.
ALTER TABLE usuarios
    ADD COLUMN perfil VARCHAR(20) NOT NULL DEFAULT 'SOLICITANTE';

ALTER TABLE usuarios
    ADD CONSTRAINT chk_usuarios_perfil
    CHECK (perfil IN ('SOLICITANTE', 'RESPONSAVEL', 'ADMINISTRADOR'));
