# Marcos-1 — Base de comunicação do frontend com a API

## Status
In Progress

## Story
Como usuário, quero que as telas comuniquem autenticação, operações e falhas de maneira consistente, com sessão válida, feedback compreensível e proteção contra envios repetidos.

Responsável: Marcos Boé. RF01, RF04, RF07, RF13, RF14.
Incremento autorizado pelo usuário em 10/11/2026, definido com AIOX SM. Não entrega a interface completa.

## Fontes
PDF integral (26 páginas), especialmente pp. 12–13, 17–19 e 23; contratos `docs/api/reservas-contrato.md` e `docs/api/item18.md`; ADR-001/004/006; esclarecimentos atuais do usuário sobre autenticação prevalecem sobre as rotas ilustrativas do PDF.

## Acceptance Criteria
1. Módulos ES nativos em static/js, sem compilação/framework no produto.
2. Única camada fetch da mesma origem com credentials same-origin; não ler nem persistir cookies HttpOnly/credenciais.
3. CSRF obtido de GET /api/auth/csrf; nome do cabeçalho dinâmico em POST/PUT/PATCH/DELETE, inclusive login/logout.
4. Login URL-encoded com email/senha; login/logout aceitam 204 sem JSON; descartar CSRF após mudança de autenticação.
5. GET me devolve perfil para UI; aprovação visual exclusiva de RESPONSAVEL. Backend continua autorizando.
6. Preservar status/codigo/mensagem/correlationId; apresentação separa mensagem e suporte; falhas de rede/HTML recebem mensagem compreensível.
7. 401/NAO_AUTENTICADO aciona redirecionamento central; CREDENCIAIS_INVALIDAS permanece no formulário. Não repetir escritas automaticamente.
8. Clientes somente de criar/editar/cancelar/aprovar/rejeitar já contratados; criar/PATCH enviam inicio/fim/recursosIds completos, sem solicitante/papel/status; validar offset e motivo da rejeição.
9. Auxiliar por formulário impede submissões simultâneas, indica carregamento e restaura controles após sucesso/erro.
10. Testes isolados com fetch controlado cobrem contrato HTTP, CSRF, erros e duplo envio, sem alegar E2E/segurança de servidor/concorrência real.

## Tasks / Subtasks
- [x] Implementar api.js e auth.js (AC 1–7).
- [x] Implementar reservas.js (AC 8).
- [x] Implementar forms.js (AC 9).
- [x] Escrever e executar testes isolados relevantes (AC 10).
- [x] Executar lint, typecheck, test e build; registrar evidências e limites.
- [x] Documentar consumo e responsabilidades.
- [x] Atualizar checklist, file list, RTM e evidências reais.

- [ ] Realizar revisão CodeRabbit/independente e CI antes de fechar a story.

## Dev Notes
API de reservas desligada; autenticação em branch separada. Não criar GETs de reservas, provedores vazios ou Idempotency-Key fictício. Estados/permissões de início/conclusão/não comparecimento ficam fora deste incremento. Bloqueio de clique não garante unicidade no servidor. Formulários preservam dados em erro. Testes de cliente usam mocks exclusivamente em isolamento.

## Testing
Verificar CSRF dinâmico em todos os verbos; GET sem CSRF; login especial/204; renovação após login/logout; 401 distintos; erros 400/403/404/409 e rede/HTML sem replay; PATCH completo e filtrado; datas inválidas; motivo obrigatório; perfil; duplo envio e restauração de controles. Não declarar integração validada.
Node/npm inicialmente ausentes do PATH. Usar ferramentas de desenvolvimento sem introduzir compilação do produto.

## CodeRabbit Integration
Conferir disponibilidade e registrar resultado/limite antes de Ready for Review. Revisão humana e CI verde continuam obrigatórias antes do merge.

## Change Log
| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-11-10 | 1.0 | Story derivada pelo AIOX SM, implementação de clientes e validação local; revisão pendente | SM / Dev |

## Dev Agent Record
### Agent Model Used
Codex.
### Debug Log References
[Resultados e limitações](../testes/marcos-1-resultados.md); [saída integral](../testes/marcos-1-verificacao.txt). npm run build executou lint, typecheck e 21 testes; exit code 0 em 10/11/2026.
### Completion Notes List
Critérios técnicos locais atendidos. Revisão externa/CI pendentes; status mantido In Progress e não Done. Node portátil, ESLint/TypeScript foram instalados com aprovação de execução; ferramentas somente de desenvolvimento. CodeRabbit indisponível por falta de WSL/CLI. Telas e E2E real ficam para as próximas stories.
### File List
- docs/stories/marcos-1.md
- docs/planejamento/marcos-plano-de-acao.md
- docs/api/frontend-integracao.md
- backend/src/main/resources/static/js/api.js
- backend/src/main/resources/static/js/auth.js
- backend/src/main/resources/static/js/reservas.js
- backend/src/main/resources/static/js/forms.js
- tests/unit/frontend/clientes.test.js
- tests/unit/frontend/forms.test.js
- package.json
- package-lock.json
- eslint.config.js
- jsconfig.json
- docs/testes/marcos-1-resultados.md
- docs/testes/marcos-1-verificacao.txt
- docs/RTM.md
- docs/README.md
- docs/api/reservas-contrato.md
- README.md

## QA Results
Revisão independente e CI pendentes.
