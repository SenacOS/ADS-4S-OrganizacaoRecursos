# Operação administrativa dos vínculos do Responsável

Decisão adotada por Marcos sob delegação da equipe em13/11/2026: [ADR-007](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md). Procedimento para o modelo existente da V6, sem endpoint ou tela novos.

## Quem autoriza e quem executa

O Administrador da aplicação autoriza o par usuário/recurso e a ação, identificados numa solicitação/decisão. Marcos coordena a autorização da demonstração delegada. Um operador de banco autorizado executa o SQL por CLI na base conferida; o perfil da sessão web não fornece credenciais SQL. Não ampliar a conta de runtime da aplicação para conceder vínculos.

Registrar a referência da autorização, base/instância, operador SQL, ação, IDs e resultado antes/depois. A saída inclui `CURRENT_USER()` e UTC. Guardar esse registro junto à solicitação, sem credenciais. A operação SQL não atravessa o `AuditoriaPort` da aplicação; a saída operacional não é uma auditoria de domínio fabricada.

## Conta operadora

O administrador do banco provisiona a conta fora do repositório, limitada à base pretendida. O procedimento usa:

- `SELECT(id,perfil,ativo)` em `usuarios`, `SELECT(id,codigo,ativo)` em `recursos` e `SELECT` em `responsaveis_recursos`; sem leitura de e-mail ou hash de senha;
- `INSERT` e `DELETE` em `responsaveis_recursos`;
- `UPDATE(recurso_id)` em `responsaveis_recursos`, para o no-op da concessão idempotente;
- `UPDATE(id)` em `usuarios` e `recursos`, exigido pelo locking `SELECT ... FOR UPDATE` na instalação MySQL8.4 validada. Não conceder atualização de `perfil`, `ativo`, e-mail ou senha por esse motivo. O procedimento não altera IDs.

Sem privilégios globais, `SUPER`, DDL ou escrita em reservas/notificações. Os privilégios continuam sendo de uma conta administrativa restrita e confiável; não são uma API que aceite parâmetros de usuários sem autorização. A conta de migração/runtime usada pela base descartável da prova é separada da conta operadora e não comprova segregação de grants de produção da RF10.

## Conferir e executar um par

Usar cliente MySQL8.4 de instalação conhecida, por caminho absoluto, com credenciais em arquivo privado de opções. O arquivo do cliente deve apontar explicitamente ao servidor/base esperados e ficar fora do Git. Conferir a identidade da instância e a base antes de operar. Exemplo de chamada, substituindo os caminhos/base pela instalação autorizada:

```powershell
& 'C:/instalacao-autorizada/mysql/bin/mysql.exe' '--defaults-file=C:/privado/operador.ini' '--database=base_conferida'
```

No cliente dedicado, conferir:

```sql
SELECT DATABASE(), @@hostname, @@port, @@server_uuid, CURRENT_USER();
SELECT id, perfil, ativo FROM usuarios WHERE id = 31;
SELECT id, codigo, ativo FROM recursos WHERE id = 11;
SELECT recurso_id, usuario_id FROM responsaveis_recursos
 WHERE usuario_id = 31 AND recurso_id = 11;
```

IDs31/11 são ilustrativos, não dados a assumir no ambiente real. Com a decisão já autorizada, definir **uma ação e um par**. Os IDs devem ser inteiros positivos; referência não vazia, até120caracteres. Não manter uma transação aberta esperando confirmação humana.

```sql
SET @usuario_id = 31;
SET @recurso_id = 11;
SET @acao = 'CONCEDER';
SET @referencia = 'SOLICITACAO-APROVADA-001';
SOURCE docs/operacao/vinculos-responsaveis.sql;
```

O caminho de `SOURCE` é relativo ao diretório em que o cliente foi aberto; pode usar o caminho absoluto conferido do [SQL reutilizável](vinculos-responsaveis.sql). Não interpolar texto de uma requisição HTTP ou executar arquivos SQL recebidos de usuários.

O SQL trava recurso e usuário nessa ordem, valida os parâmetros/alvos e opera somente o par. Concessão exige RESPONSAVEL ativo e recurso ativo. A chave primária evita duplicação; repetir mantém um vínculo. Saída `CONCEDIDO` com `depois=1` e conclusão do cliente sem erro confirma sucesso; guardar a saída e conferir o par por SELECT.

Para retirar:

```sql
SET @usuario_id = 31;
SET @recurso_id = 11;
SET @acao = 'REVOGAR';
SET @referencia = 'REVOGACAO-APROVADA-002';
SOURCE docs/operacao/vinculos-responsaveis.sql;
```

`REVOGADO`, `depois=0` e cliente sem erro confirmam ausência do par. Repetir é idempotente. Revogação também remove vínculo obsoleto de usuário inativo, perfil alterado ou recurso desativado. Nenhum desses casos permite nova concessão incompatível.

`RECUSADO_PARAMETROS`, `RECUSADO_ALVO`, `RECUSADO_USUARIO`, `RECUSADO_RECURSO` ou `RECUSADO_ESTADO` encerram por ROLLBACK e não concedem privilégio. O comando final preparado escolhe somente as constantes COMMIT/ROLLBACK, sem SQL dinâmico vindo dos parâmetros. Em erro SQL/conexão, não usar `--force`, não interpretar saída parcial como sucesso e executar ROLLBACK/encerrar o cliente. Consultar o par antes de decidir nova execução.

## Preparação da demonstração e Q9

Criar usuários/recursos próprios e listar seus IDs pela API/banco do ambiente identificado. Conceder explicitamente cada recurso ao Responsável autorizado. Uma reserva com dois recursos continua inacessível se faltar qualquer par. Revogar um par remove leitura completa e decisão na próxima operação; não altera a reserva nem amplia permissões de outro perfil.

A reprodução isolada completa está em [demonstração delegada](demonstracao-fechamento.md). Ela testa este SQL com uma conta operadora própria, inclusive negativas e incapacidade de alterar perfil, contra a mesma aplicação real. Fixtures de teste não provisionam vínculos em um ambiente compartilhado; esse ambiente deve aplicar o procedimento com seus próprios IDs e autorização.
