# Marcos-3 — Pesquisa de disponibilidade e criação de reservas

Atualização em 12/11/2026: os GETs/Q9 foram entregues e o restante da etapa 3 foi implementado localmente na [story de consulta/edição/cancelamento](marcos-3-consulta-edicao.md), com [provas próprias](../testes/marcos-3-consulta-edicao-resultados.md). Revisão visual/entrega desse complemento seguem pendentes. Os estados e testes originais abaixo conservam o recorte de pesquisa/criação e não descrevem a disponibilidade atual dos GETs.

## Status

Ready for Review

Execução autorizada por Marcos nesta sessão, seguindo os contratos atuais. Primeiro recorte da etapa 3: pesquisa e criação. Listagem de reservas próprias, reabertura para edição e cancelamento de reservas existentes continuam dependentes dos GETs e da política Q9; a etapa 3 inteira não se encerra com este recorte.

## Story

Como usuário autenticado, quero pesquisar salas, docentes e materiais em um período e solicitar os recursos selecionados, para organizar uma reserva e conhecer seu status confirmado.

Responsável: Marcos Boé. RF03, RF04, RF13, RF14. Preparação: AIOX SM; implementação: AIOX Dev. Marcos-1 fornece os clientes e Marcos-2 fornece o acesso e o estilo visual, ambos validados localmente, com revisão e integração pendentes.

## Fontes

- [Plano, mapa de telas e etapa 3](../planejamento/marcos-plano-de-acao.md#ordem-de-execução-sem-sprints-ou-prazo-inventado).
- [Pesquisa, paginação, DTOs e expediente](../api/item18.md#cadastro-e-retorno).
- [Criação e respostas de reservas](../api/reservas-contrato.md#criar-reserva).
- [Fonte única, HTML/CSS/JS nativos](../arquitetura/adr/ADR-001-monolito-modular-frontend-estatico.md#decisão).
- [Sessão e perfis](../arquitetura/adr/ADR-004-sessao-spring-security.md#decisão).
- [Comum, restrita e disponibilidade](../arquitetura/adr/ADR-005-politicas-de-reserva.md#decisão).
- [Datas e erros](../arquitetura/adr/ADR-006-timezone-expediente-notificacoes.md#decisão).

## Critérios de aceitação

1. `pages/recursos.html` e `pages/reservas.html` reutilizam sessão, navegação, CSS e clientes existentes. A navegação aponta apenas para páginas existentes; áreas futuras permanecem indisponíveis.
2. Cliente de recursos usa apenas `GET /api/recursos` e `GET /api/horarios-funcionamento`, via `api.js`. Filtros contratados, codificação por URLSearchParams, página zero-based e tamanho até 100; nunca filtrar/paginar localmente a coleção inteira.
3. Pesquisa apresenta tipo, capacidade mínima, local, competência, patrimônio, início/fim e disponibilidade; filtros novos reiniciam a paginação. Mostrar carregamento, vazio, erro e indisponibilidade sem dados fictícios. Respostas antigas não substituem consultas posteriores ou filtros alterados.
4. Datas de `datetime-local` são convertidas usando `America/Sao_Paulo`, sem depender do fuso do navegador ou anexar offset fixo. Validar dias civis, fim posterior, par de datas e limite diário; horários inexistentes/ambíguos são recusados. Exibir expediente real quando disponível, sem inventar horários em caso de falha.
5. Seleção de múltiplos recursos ativos e disponíveis conserva itens entre páginas/filtros do mesmo período. Alterar período limpa a seleção com aviso; resultados indisponíveis ou sem período não oferecem seleção válida.
6. Criação envia somente `inicio`, `fim`, `recursosIds`. Reutilizar CSRF e guard de formulário. Sucesso somente após resposta coerente com usuário, período e recursos enviados; mostrar id e status APROVADA ou SOLICITADA, sem afirmar notificação entregue.
7. Falhas 400/401/403/404/409, rede e resposta inválida preservam formulário/seleção quando recuperáveis e exibem mensagem/referência como texto. Nenhuma escrita é repetida automaticamente; cliques simultâneos não duplicam POST. Após sucesso, nova solicitação exige ação explícita e nova pesquisa.
8. Labels, foco, teclado, estados acessíveis e layout utilizável em desktop/móvel. Mensagens e identificações da API usam textContent.
9. Mocks ficam nos testes de navegador; preview apenas serve os arquivos e não simula sessão/API. Não criar GETs fictícios de reservas, habilitar APIs ou alterar código Java.
10. Testes unitários verificam datas/fuso, filtros, paginação, DTOs e confirmação. Testes de navegador cobrem seleção, criação comum/restrita, erros, envio único, sessão, estados e responsividade; regressões Marcos-1/2 passam. Evidências não são apresentadas como E2E integrado.
11. Executar lint, typecheck, testes e build; atualizar documentação de consumo, plano, RTM, checklist e File List.

## Tasks / Subtasks

- [x] Implementar datas e cliente de recursos com testes de contrato (AC 2, 4, 10).
- [x] Compartilhar sessão/navegação e criar as duas páginas responsivas (AC 1, 8).
- [x] Implementar pesquisa, paginação, expediente e controle de respostas antigas (AC 3, 4).
- [x] Implementar seleção e criação com confirmação/erros (AC 5–7).
- [x] Executar testes de navegador e regressões completas (AC 8–10).
- [x] Atualizar plano, API, RTM, evidências, checklist e File List (AC 11).
- [ ] Obter integração real, revisão independente e CI para a entrega integrada.

## Dev Notes

Fonte única: `backend/src/main/resources/static/`, sem dependências novas ou build do produto (ADR-001). `reservas.api.enabled`, `recursos.api.enabled` e `movimentacoes.api.enabled` permanecem false. Escritas e leituras reais dependem da segurança e dos provedores da equipe (item18, Ativação). Disponibilidade é informativa, revalidada na escrita; a interface não implementa a política de conflito (ADR-003/005).

`GET /api/recursos` retorna `{itens,pagina,tamanho,total}`, cada item `{id,dados,disponivel}`. `GET /api/horarios-funcionamento` retorna `{zona,janelas}`. POST de reserva retorna id, solicitanteId, status, restrita, inicio, fim, recursosIds e motivoDecisao. Nenhuma listagem/detalhe de reservas é contratada neste recorte. A autenticação usa os clientes Marcos-1/2 e a resposta validada de `auth.me` (contratos de frontend/reserva).

O gerador de greeting do framework não executa por ausência de `js-yaml`; usar identificação textual das personas. O projeto usa plano/PDF e ADRs em português em lugar dos caminhos PRD/architecture genéricos do scaffold. A story é local, sem ClickUp configurado. Nenhum desses ajustes altera requisitos.

## Validação de preparação

Checklist `story-draft-checklist`: objetivo/contexto, orientação técnica, referências, autocontenção e testes conferidos. Recorte implementável com contratos existentes; dependências externas descritas. O pedido de continuidade e a resposta de Marcos para seguir os contratos atuais autorizam a implementação deste recorte. Não se declara validação independente de PO.

## CodeRabbit Integration

Tipo principal: Frontend; secundário: Integração; complexidade média. Execução @dev; revisão visual/a11y @ux-design-expert e revisão independente @qa antes da entrega. Gates: pré-commit (lint/checkJs/unitários/navegador e CodeRabbit quando disponível); pré-PR @devops com CI/revisão humana. Focos: datas/fuso, preservação de seleção, respostas fora de ordem, CSRF, envio único e ausência de APIs fictícias. Self-healing @dev: light, até 2 iterações/15 minutos para CRITICAL; HIGH documentado. Indisponibilidade do CLI deve ser registrada, sem alegar revisão aprovada.

## Dev Agent Record

### Completion Notes

Recorte local implementado. Datas e cliente de recursos reutilizam a camada HTTP; duas páginas usam sessão/navegação/logout compartilhados. Pesquisa/paginação vêm do servidor, seleção conserva itens no mesmo período e descarta recursos atualizados como indisponíveis. Criação confirma o DTO retornado antes de mostrar sucesso e não repete POST. Edição/listagem/cancelamento de reservas existentes continuam para o contrato de leitura.

`npm run build`: exit code 0, lint/checkJs sem diagnósticos, 32 testes unitários e 76 de navegador aprovados em desktop/móvel. Os testes da Marcos-3 usam navegador em Asia/Tokyo para conferir o fuso operacional. Uma rodada anterior teve timeout no setup de page; registro preservado. Capturas tiveram ajuste de scroll e quatro reexecuções aprovadas, sem alterar código da aplicação após a suíte completa. [Resultados e limites](../testes/marcos-3-resultados.md); [saída integral](../testes/marcos-3-verificacao.txt).

Autoavaliação pelos checklists de self-critique/DoD: critérios locais, casos de fronteira, erros, XSS, datas, seleção e envio único conferidos; sem dependências novas. Estrutura, contratos, testes, documentação e file list atualizados. CodeRabbit indisponível (CLI/WSL não instalados); revisão independente/CI e integração real continuam pendentes. Não se declara parecer de QA independente, aceite visual do Marcos, E2E integrado ou entrega inteira da etapa 3. Alterações de evidência da Marcos-2 já presentes no início foram preservadas.

### Agent Model Used

Codex, com preparação AIOX SM e implementação AIOX Dev.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-10 | Marcos autorizou seguir contratos atuais; implementado e validado o recorte pesquisa/seleção/criação. Leitura/edição/cancelamento e integração continuam pendentes. |

### File List

- docs/stories/marcos-3.md
- README.md
- backend/src/main/resources/static/css/app.css
- backend/src/main/resources/static/index.html
- backend/src/main/resources/static/js/dashboard-page.js
- backend/src/main/resources/static/js/navegacao.js
- backend/src/main/resources/static/js/reservas.js
- backend/src/main/resources/static/js/datas.js
- backend/src/main/resources/static/js/recursos.js
- backend/src/main/resources/static/js/recursos-page.js
- backend/src/main/resources/static/js/sessao-page.js
- backend/src/main/resources/static/pages/recursos.html
- backend/src/main/resources/static/pages/reservas.html
- eslint.config.js
- tests/unit/frontend/recursos-datas.test.js
- tests/browser/recursos.spec.js
- tests/browser/acesso.spec.js
- docs/README.md
- docs/api/frontend-integracao.md
- docs/planejamento/marcos-plano-de-acao.md
- docs/RTM.md
- docs/testes/marcos-3-resultados.md
- docs/testes/marcos-3-verificacao.txt
- docs/testes/marcos-3/resultados.json
- docs/testes/marcos-3/primeira-execucao.json
- docs/testes/marcos-3/pesquisa-desktop.png
- docs/testes/marcos-3/pesquisa-mobile.png
- docs/testes/marcos-3/confirmacao-desktop.png
- docs/testes/marcos-3/confirmacao-mobile.png

## QA Results

Revisão independente, integração e CI pendentes.
