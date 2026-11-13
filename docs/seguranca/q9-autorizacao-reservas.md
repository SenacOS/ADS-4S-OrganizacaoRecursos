# Q9 — controles de acesso em consultas e decisões de reservas

## Fechamento delegado — 13/11/2026

Marcos comunicou carta branca da equipe e adotou as decisões do [ADR-007](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md). Os contratos atuais, incluindo vínculo com todos os recursos, ficam formalizados **por decisão delegada de Marcos**, sem atribuir assinaturas individuais aos demais integrantes. Datas com offset, PATCH conjunto,409/FORA_DO_EXPEDIENTE, estados/perfis de edição/cancelamento e escopos/erros Q9 permanecem como implementados; Q1/Q3/Q8 preservadas.

Processo de vínculos definido no [runbook restrito](../operacao/vinculos-responsaveis.md), com [SQL reutilizável](../operacao/vinculos-responsaveis.sql). Administrador autoriza, operador SQL executa pares explícitos com referência/registro; concessão exige RESPONSAVEL e recurso ativos, revogação remove pares obsoletos e é idempotente.

RF11 adotada no **modo simulado real** previsto no ADR-006: base/processo exclusivos, worker e GatewayNotificacaoPadrao reais, URL vazia, log rastreável e ENVIADA na outbox. Sem envio externo. [Procedimento de demonstração](../operacao/demonstracao-fechamento.md), [story](../stories/marcos-fechamento-delegado-1.md) e [resultados/limites](../testes/marcos-fechamento-delegado-1-resultados.md). A execução local não é implantação no ambiente compartilhado.

As menções anteriores a ratificação por integrante, processo indefinido ou modo RF11 aguardando decisão são históricas e foram superadas por esta delegação. Resultados antigos conservam sua origem. Restam revisão do incremento pelo autor, commit/publicação quando solicitados e revisão/integração dos PRs; não há fechamento global de todos os RFs por inferência.


## Implementação integrada e conexão da fila

- GET /api/reservas e GET /api/reservas/{id}, sob reservas.api.enabled=true, usam sempre o ator autenticado da sessão.
- SOLICITANTE: apenas reservas próprias.
- ADMINISTRADOR: consulta todas; NÃO pode aprovar ou rejeitar.
- RESPONSAVEL: somente reservas para as quais tem vínculo com **todos** os recursos envolvidos.
- Paginação e total são calculados no SQL já com a restrição aplicada. O filtro do cliente não amplia a visibilidade.
- `GET /api/reservas?status=SOLICITADA` para RESPONSAVEL chama `ConsultarFilaAprovacao` e reutiliza a consulta da fila integrada no PR #22. Os demais perfis usam a listagem geral com seu escopo de leitura.
- O DTO de leitura não retorna email, nome real, telefone, senha ou contato do solicitante: apenas id e identificador mínimo "Solicitante <id>".
- Uma reserva fora do escopo ou inexistente devolve 404 NAO_ENCONTRADO no GET de detalhe; ausência de autenticação: 401; parâmetros inválidos: 400.
- Aprovação, rejeição, início de uso, conclusão e não comparecimento por RESPONSAVEL validam os vínculos após a releitura/bloqueio da reserva e antes de salvar, auditar ou notificar.
- A tabela Flyway V6 `responsaveis_recursos(recurso_id,usuario_id)` é intencionalmente criada vazia: nenhuma permissão automática é atribuída.

## Representação e consulta do vínculo

A V6 representa uma relação muitos para muitos. Cada par `(recurso_id, usuario_id)` é único e referencia um recurso e um usuário existentes. O índice inverso permite consultar os recursos de um responsável pelo ID do usuário. Para listar seus vínculos efetivos, use `usuarioId` como parâmetro da sessão ou do operador autorizado:

```sql
SELECT vinculo.recurso_id, recurso.codigo
FROM responsaveis_recursos vinculo
JOIN recursos recurso ON recurso.id = vinculo.recurso_id
JOIN usuarios usuario ON usuario.id = vinculo.usuario_id
WHERE vinculo.usuario_id = :usuarioId
  AND usuario.perfil = 'RESPONSAVEL'
  AND usuario.ativo = TRUE
ORDER BY vinculo.recurso_id;
```

Fila, listagem e detalhe usam o mesmo predicado SQL de `ReservaAcessoMysql`. Ele exige um Responsável ativo, pelo menos um recurso na reserva e um vínculo para cada recurso. A revogação do vínculo é aplicada na próxima consulta.

## Regra conservadora para reservas com vários recursos

**Regra adotada sob delegação de Marcos no ADR-007:** acesso de RESPONSAVEL à leitura completa e às decisões exige vínculo com todos os recursos da reserva. Exemplo: se A responde pela sala e B pelo projetor, nenhum dos dois pode consultar os detalhes completos nem decidir até que exista um responsável autorizado para ambos. A decisão não atribui assinaturas individuais à equipe nem cria aprovação parcial.

Essa regra é mais restritiva que a frase geral "vê reservas dos seus recursos". A equipe deve decidir se futuramente precisa de um mecanismo de aprovação parcial por recurso; **não se deve trocar para OR/permissão de qualquer recurso** sem projeto e testes apropriados.

## Dependências de integração e administração

1. Fausto/Silva devem manter os vínculos na tabela `responsaveis_recursos` via processo administrativo restrito (o PR não expõe POST público de concessão).
2. Rota da fila é o GET geral com status SOLICITADA. Para RESPONSAVEL, isso limita a pendentes restritas; demais perfis recebem a própria consulta conforme Q9.
3. Recursos sem responsável explicitamente vinculado não podem ser aprovados. Necessário povoar vínculos com pessoas e recursos reais antes do E2E.
4. Revisar a política multi-recurso com a equipe e realizar E2E com sessões reais. O frontend deve respeitar o comportamento 404 para detalhes fora do escopo.
5. SonarCloud não é alterado por este PR; falha de token/chave e limitações de plano são independentes.
