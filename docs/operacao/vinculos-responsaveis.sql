-- MySQL 8.4. Executar em cliente dedicado, conectado à base previamente conferida.
-- Definir antes: @usuario_id, @recurso_id, @acao ('CONCEDER'/'REVOGAR'), @referencia.
-- Uma execução = um par. Registrar a saída. Não usar --force; erro exige ROLLBACK.
START TRANSACTION;
SET @parametros_validos = COALESCE(
  CAST(@usuario_id AS CHAR) REGEXP '^[1-9][0-9]{0,18}$'
  AND CAST(@recurso_id AS CHAR) REGEXP '^[1-9][0-9]{0,18}$'
  AND CAST(@usuario_id AS DECIMAL(20,0)) <= 9223372036854775807
  AND CAST(@recurso_id AS DECIMAL(20,0)) <= 9223372036854775807
  AND BINARY @acao IN ('CONCEDER', 'REVOGAR')
  AND CHAR_LENGTH(TRIM(@referencia)) BETWEEN 1 AND 120, FALSE);
SET @usuario_conferido = NULL, @perfil_conferido = NULL, @usuario_ativo = NULL;
SET @recurso_conferido = NULL, @recurso_ativo = NULL;
-- Ordem estável: recurso, depois usuário. Nenhuma decisão humana durante a transação.
SELECT id, ativo INTO @recurso_conferido, @recurso_ativo
  FROM recursos WHERE @parametros_validos AND id = @recurso_id FOR UPDATE;
SELECT id, perfil, ativo INTO @usuario_conferido, @perfil_conferido, @usuario_ativo
  FROM usuarios WHERE @parametros_validos AND id = @usuario_id FOR UPDATE;
SET @antes = (SELECT COUNT(*) FROM responsaveis_recursos
  WHERE @parametros_validos AND usuario_id = @usuario_id AND recurso_id = @recurso_id);

INSERT INTO responsaveis_recursos (recurso_id, usuario_id)
SELECT @recurso_conferido, @usuario_conferido
  WHERE @parametros_validos AND BINARY @acao = 'CONCEDER'
    AND @perfil_conferido = 'RESPONSAVEL' AND @usuario_ativo = TRUE AND @recurso_ativo = TRUE
ON DUPLICATE KEY UPDATE recurso_id = responsaveis_recursos.recurso_id;

-- Revogar não exige papel/atividade atuais: pode remover um privilégio obsoleto.
DELETE FROM responsaveis_recursos
  WHERE @parametros_validos AND BINARY @acao = 'REVOGAR'
    AND usuario_id = @usuario_id AND recurso_id = @recurso_id;
SET @depois = (SELECT COUNT(*) FROM responsaveis_recursos
  WHERE @parametros_validos AND usuario_id = @usuario_id AND recurso_id = @recurso_id);

SET @resultado_operacao = CASE
  WHEN NOT @parametros_validos THEN 'RECUSADO_PARAMETROS'
  WHEN BINARY @acao = 'CONCEDER' AND (@usuario_conferido IS NULL OR @recurso_conferido IS NULL)
    THEN 'RECUSADO_ALVO'
  WHEN BINARY @acao = 'CONCEDER' AND (@perfil_conferido <> 'RESPONSAVEL' OR NOT @usuario_ativo)
    THEN 'RECUSADO_USUARIO'
  WHEN BINARY @acao = 'CONCEDER' AND NOT @recurso_ativo THEN 'RECUSADO_RECURSO'
  WHEN BINARY @acao = 'CONCEDER' AND @depois = 1 THEN 'CONCEDIDO'
  WHEN BINARY @acao = 'REVOGAR' AND @depois = 0 THEN 'REVOGADO'
  ELSE 'RECUSADO_ESTADO' END;
SELECT @resultado_operacao AS resultado,
  DATABASE() AS base_conferida, CURRENT_USER() AS operador_sql, UTC_TIMESTAMP(6) AS momento_utc,
  @acao AS acao, @usuario_id AS usuario_id, @recurso_id AS recurso_id,
  @referencia AS referencia, @antes AS antes, @depois AS depois;
-- Somente comandos constantes; uma recusa sempre encerra por ROLLBACK.
SET @finalizar_operacao = IF(@resultado_operacao IN ('CONCEDIDO', 'REVOGADO'), 'COMMIT', 'ROLLBACK');
PREPARE finalizar_vinculo FROM @finalizar_operacao;
EXECUTE finalizar_vinculo;
DEALLOCATE PREPARE finalizar_vinculo;
