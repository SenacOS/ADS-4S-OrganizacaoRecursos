# RF10 — Separacao de contas e imutabilidade SQL da auditoria

## Decisao
Na aplicacao, a trilha de auditoria e append-only: ela expoe SELECT/INSERT.
Em producao isso so e garantido contra a conta de runtime com grants limitados.
Uma conta distinta e privilegiada deve executar as migracoes Flyway.

## Modelo para DBA

Consultar `sql/grants-runtime.sql.example`. **Nao foi aplicado a nenhum
ambiente real**: sem acesso de administrador ao MySQL da equipe, o arquivo
e uma proposta que deve ser validada e aplicada pelo responsavel pelo banco.

1. Rodar V1–V4 com conta migradora, nunca com runtime.
2. Criar a conta runtime em gerenciador de segredos (senha longa e unica).
3. Conceder DML nas demais tabelas e somente SELECT/INSERT em auditoria.
4. Usar `DB_USER`/`DB_PASSWORD` para a conta runtime do Spring Boot.
5. Usar `SPRING_FLYWAY_URL`, `SPRING_FLYWAY_USER` e
   `SPRING_FLYWAY_PASSWORD` para a conta migradora.
6. Registrar `SHOW GRANTS` e negativas de UPDATE/DELETE de auditoria
   sem divulgar identificadores de usuarios ou senhas.

**Atenção:** um GRANT no schema para UPDATE/DELETE prevalece sobre
a ausencia de permissoes na tabela. Nao ha GRANT de banco inteiro
no exemplo, que enumera as tabelas necessarias.

## Evidencia automatizada

`AuditoriaPrivilegiosMysqlIT` usa Testcontainers com um MySQL descartavel.
Ele cria conta limitada, prova INSERT/SELECT em auditoria e que as tentativas
UPDATE, DELETE e SELECT em usuarios falham. Nenhuma credencial real e usada.

Esse teste demonstra a regra tecnica, mas nao que os privilegios tenham
sido aplicados ao banco compartilhado ou de producao.
