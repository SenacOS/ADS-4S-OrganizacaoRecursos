# Marcos-5 — Administração de recursos, manutenção e expediente

## Status

Ready for Review

Implementação deste recorte autorizada por Marcos em 11/11/2026, após concordar com a continuidade pelos cadastros de recursos, manutenção e expediente do item18. O recorte é independente de Marcos-4 e da política de leitura Q9. Não inclui movimentações nem encerra toda a etapa 5 do plano. Integração real, revisão de outro integrante e CI continuam pendentes. Commit somente após validação e quando Marcos solicitar.

Aceite do incremento local e solicitação de commit registrados em 11/11/2026, após reexecução dos testes pelo autor e abertura da revisão visual no Chrome. A story permanece Ready for Review para a revisão de outro integrante e entrega integrada.

## Story

Como Administrador, quero cadastrar e editar salas, professores e materiais, desativar recursos e administrar bloqueios e horários de funcionamento, para manter os dados e as restrições usados nas reservas.

Responsável: Marcos Boé. RF02, RF03 (consulta administrativa), RF08 (interface), RF13 e RF14. Preparação: AIOX SM; implementação: AIOX Dev. Marcos-1 fornece comunicação/CSRF/guard, Marcos-2 fornece sessão/estilo e Marcos-3 fornece pesquisa, datas e identificação de recursos, validados localmente com integração/revisão pendentes.

## Fontes

- [Plano: escopo, telas, etapa 5 e dependências](../planejamento/marcos-plano-de-acao.md).
- [Item18: ativação, rotas, cadastro, filtros, expediente e bloqueios](../api/item18.md).
- [Marcos-3: pesquisa, paginação, fuso, sessão e limites de integração](marcos-3.md).
- [ADR-001: fonte única e módulos nativos](../arquitetura/adr/ADR-001-monolito-modular-frontend-estatico.md#decisão).
- [ADR-004: sessão e autorização no servidor](../arquitetura/adr/ADR-004-sessao-spring-security.md#decisão).
- [ADR-006: datas, expediente e erros](../arquitetura/adr/ADR-006-timezone-expediente-notificacoes.md#decisão).
- Código existente, para os detalhes efetivos do contrato: `backend/src/main/java/br/senac/recursos/recurso/api/RecursoController.java`, `recurso/dominio/DadosRecurso.java`, `recurso/aplicacao/FiltroRecursos.java`, `recurso/aplicacao/RecursoService.java` e `reserva/dominio/JanelaFuncionamento.java`.
- PDF `Organizacao_Recursos_Relatorio_Final.pdf`, leitura integral já registrada no plano; páginas 13–17 e 23–24: telas, recursos, manutenção, mensagens, documentação e testes compartilhados.

## Critérios de aceitação

1. Área administrativa em `pages/gestao-recursos.html`, com HTML/CSS/JS nativos, reutiliza sessão, navegação, mensagens e estilo existentes. O atalho Gerenciar recursos recebe link somente para ADMINISTRADOR. A pesquisa geral de `pages/recursos.html` continua acessível conforme o contrato vigente.
2. Na entrada direta da área administrativa, consultar `auth.me()` e conferir ADMINISTRADOR antes de revelar controles ou disparar qualquer GET de recursos, detalhe, bloqueios ou expediente. SOLICITANTE/RESPONSAVEL recebem mensagem de acesso indisponível sem essas consultas; 401 usa o tratamento central de sessão. O GET de autenticação é a exceção necessária à identificação. Esta guarda visual não substitui autorização do servidor.
3. Pesquisa administrativa usa `GET /api/recursos` e os filtros existentes, com URLSearchParams e paginação do servidor: página zero-based, tamanho padrão 20, máximo 100, ordem do contrato por ID. Permitir ver os estados ativo/restrito e os inativos retornados para Administrador; não inventar filtro `ativo`, nova rota ou paginação da coleção inteira no navegador. Novos filtros reiniciam a página; respostas antigas não sobrescrevem a consulta ou o recurso atual. Mostrar carregamento, vazio, erro e total real.
4. Cadastro por `POST /api/recursos` suporta SALA, PROFESSOR e MATERIAL. Campos comuns: `tipo`, `codigo`, `ativo`, `restrito`. SALA usa `capacidade`, `localizacao`, `tipoSala`; PROFESSOR usa `nome`, `competencias` como array; MATERIAL usa `patrimonio`, `descricao`, `condicao`. Aplicar validação amigável coerente com DadosRecurso, sem criar enum fechado para condição nem exigir competências não vazias quando o servidor aceita lista vazia. Limites e tipos vêm do código, e a API mantém a validação final.
5. Antes de abrir edição e habilitar o PUT, carregar `GET /api/recursos/{id}` e preencher todos os campos pertinentes de `dados`. `PUT /api/recursos/{id}` envia substituição completa, preservando valores não alterados; não enviar o envelope `{id,dados,disponivel}` como corpo. Tipo fica imutável na edição, inclusive na montagem do DTO. Falha no detalhe impede salvar dados incompletos; alternar rapidamente recursos não mistura respostas ou formulários. Confirmar sucesso somente por resposta coerente com a operação e atualizar o recurso exibido.
6. Desativação exige confirmação explícita identificando o recurso, usa `DELETE /api/recursos/{id}` e aceita 204 sem JSON. Não apagar fisicamente nem remover histórico. Após sucesso, atualizar a consulta/estado confirmado. Em 409 por reserva ativa ou retirada aberta, manter os dados e exibir a mensagem; não cancelar compromissos automaticamente nem apresentar o recurso como desativado.
7. Para um recurso identificado, carregar `GET /api/recursos/{id}/bloqueios`, criar com `POST /api/recursos/{id}/bloqueios` enviando somente `{inicio,fim,motivo}` e cancelar com `POST /api/bloqueios/{id}/cancelamento`. Interpretar o DTO real com `recurso_id`, `inicio_utc`, `fim_utc`, `motivo` e `status`, além de `id`; não presumir camelCase nem que o sufixo `_utc` elimina o offset da resposta. Exibir estados retornados e impedir nova ação sobre bloqueio já CANCELADO. Atualizar pela confirmação do servidor.
8. Datas de bloqueios são ISO 8601 com offset; formulários e exibição usam America/Sao_Paulo por conversão explícita reutilizando os auxiliares existentes, sem depender do fuso do navegador ou anexar offset fixo. Validar fim posterior e motivo obrigatório, máximo 500 conforme o serviço. Não inventar duração, antecedência ou proibição de bloqueios atravessarem dias. Conflito 409 preserva entradas e informa a colisão sem expor dados de ocupantes nem cancelar reservas.
9. Expediente inicia por `GET /api/horarios-funcionamento` e preserva todas as janelas retornadas. Edição permite acrescentar/remover janelas e envia `PUT /api/horarios-funcionamento` com `{janelas:[{dia,inicio,fim}]}`, substituindo a lista inteira, inclusive dias não modificados. Usar nomes DayOfWeek do contrato; exibir zona America/Sao_Paulo. Respeitar fim posterior, múltiplas janelas e ausência de sobreposição positiva no mesmo dia, preservando segundos e fração retornados sem arredondamento silencioso. Lista vazia significa fechado e exige confirmação explícita do usuário antes de salvar. Não inventar expediente padrão; em falha de leitura, impedir substituição baseada em lista fictícia. Em 409 por invalidar reservas, preservar edição sem afirmar alteração aplicada.
10. Todas as escritas passam por `api.js`, CSRF com nome de cabeçalho retornado pelo servidor e `criarEnvioUnico` por formulário/ação, instanciado fora do listener. Indicar carregamento, impedir envio simultâneo e restaurar controles em falhas. Não repetir escrita automaticamente após 403, 409, timeout, rede ou resposta inválida; não pressupor Idempotency-Key. Não afirmar sucesso, auditoria ou notificação sem evidência da API.
11. Mensagens de 400/401/403/404/409, rede e resposta inesperada usam os helpers existentes, com referência correlationId separada e inserção por textContent. Preservar dados recuperáveis, oferecer correção/reconsulta explícita e manter interface utilizável com labels, foco, teclado e layout móvel/desktop. Nomes, códigos, competências, patrimônio e motivos recebidos da API não são interpretados como HTML.
12. Mocks ficam exclusivamente nos testes. Preview serve os arquivos estáticos sem inventar sessão/API. Não alterar Java, flags de ativação, serviços ou provedores reais; não habilitar APIs com fornecedores vazios. Não consumir GETs fictícios de reservas nem implementar Marcos-4, Q9, usuários, movimentações ou relatórios neste recorte.
13. Testes unitários cobrem contratos/DTOs/validações, e testes de navegador cobrem os três tipos, edição completa, confirmação de desativação, bloqueios, expediente, perfis, envio único, falhas, respostas fora de ordem e XSS em desktop/móvel, incluindo teclado e fuso diferente do operacional. Regressões Marcos-1/2/3 passam. Guardas administrativas são testadas comprovando ausência de consultas de dados para perfis indevidos. Evidências são de frontend isolado, sem alegar autorização real, auditoria ou concorrência MySQL.
14. Executar `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`; registrar comandos, ambiente, resultados e capturas reais, sem preencher metas ou contagens antecipadas. Atualizar documentação de consumo, plano (recorte parcial da etapa 5), RTM, checklist e File List. Revisão independente, CI e integração continuam discriminadas como pendentes. Não criar commit até solicitação de Marcos após validação.

## Tasks / Subtasks

- [x] Estender os clientes com detalhe, cadastro, PUT completo, desativação, bloqueios e expediente; testar DTOs e respostas (AC 3–9, 13).
- [x] Criar área administrativa e navegação, conferindo perfil antes de consultas de dados (AC 1–2).
- [x] Implementar pesquisa/paginação e formulários por tipo, com detalhe antes da edição e desativação confirmada (AC 3–6).
- [x] Implementar listagem/criação/cancelamento de bloqueios e datas operacionais (AC 7–8).
- [x] Implementar leitura/edição/substituição integral de janelas de expediente (AC 9).
- [x] Revisar CSRF, guard, mensagens, XSS, respostas antigas e uso móvel/teclado (AC 10–12).
- [x] Executar unitários, navegador, regressões e gates; produzir capturas e resultados reais (AC 13–14).
- [x] Atualizar docs de consumo, plano, RTM, checklist e File List, mantendo limites de evidência (AC 14).
- [ ] Obter integração real, revisão independente e CI antes da entrega integrada.
- [x] Receber solicitação de commit de Marcos após os testes e a revisão visual local.

## Dev Notes

Fonte única: `backend/src/main/resources/static/`. Cliente `js/administracao-recursos.js` reutiliza leituras de `recursos.js`; manipuladores em `js/gestao-recursos-page.js`, com complemento de estilo em `css/administracao.css`. Reutilizar `datas.js`, `auth.js`, `api.js`, `forms.js`, `sessao-page.js`, `ui.js`, `navegacao.js` e `css/app.css`. Se necessário, adaptar a estrutura comum de sessão para impedir revelação/consulta na página administrativa até concluir a verificação de perfil, sem restringir a pesquisa geral já existente. O incremento está em branch própria `feature/marcos-5-administracao-recursos`, baseada em `a10e0b5`, conforme organização pelo agente principal; esta preparação não altera Git.

Contrato de recursos: retorno `{id,dados,disponivel}`, com `disponivel:null` quando não calculado. No PUT, o objeto enviado é DadosRecurso completo para o tipo. Limites atuais: codigo 80; capacidade inteira positiva; localizacao 200; tipoSala 80; nome 120; cada competência 120; patrimonio 80; descricao 500; condicao 120. Competências são normalizadas pelo servidor, não exigir grafia exata da entrada na confirmação da resposta. Campos de outros tipos não devem ser reaproveitados acidentalmente ao trocar o tipo no cadastro.

GET de bloqueios retorna lista, não envelope paginado. POST/cancelamento retornam objeto e podem incluir campos extras; usar os nomes de coluna do contrato. Cancelamento repetido é idempotente no servidor, mas isso não autoriza retry automático do cliente. Desativação é lógica e pode falhar por compromissos; cadastro/edição também podem retornar 409 por integridade/duplicidade.

Expediente retorna `{zona,janelas}`. Não enviar `zona` como alteração: PUT recebe apenas `janelas`. Cada janela pertence a um dia, sem duração cruzando meia-noite; várias janelas no dia são permitidas. Backend rejeita sobreposição e mudança incompatível com reservas. Horários de expediente são LocalTime, não datas UTC; manter essa distinção dos bloqueios datados.

`recursos.api.enabled`, `reservas.api.enabled` e `movimentacoes.api.enabled` permanecem como estão. Ativação e integração dependem de sessão, EventosDominioPort e outros provedores reais da equipe. Documentação/Java existentes são referências de contrato, não autorização para habilitar a API. As consultas de reservas e a política Q9 não são dependências deste incremento.

## Validação de preparação

Checklist `story-draft-checklist`: objetivo/contexto, orientação técnica, referências, autocontenção, critérios testáveis e dependências conferidos contra item18, controller, DTOs e serviço. A autorização de Marcos em 11/11/2026 cobre este recorte; não se declara validação independente de PO nem aprovação dos demais integrantes. Story local, sem ClickUp configurado; segue o padrão documental da Marcos-3. Identificação textual AIOX SM utilizada conforme limitação do greeting do framework já registrada na Marcos-3.

## CodeRabbit Integration

Tipo principal: Frontend; secundários: Integração e Segurança; complexidade média. Execução @dev; revisão visual/acessibilidade @ux-design-expert e revisão independente @qa antes da entrega. Gates pré-commit: lint/checkJs/unitários/navegador e CodeRabbit quando disponível; pré-PR @devops com revisão humana/CI. Focos: perfil antes da leitura administrativa, PUT completo/tipo imutável, preservação de janelas, DTO snake_case, fuso, CSRF/guard, XSS e ausência de APIs fictícias. Self-healing @dev light: até 2 iterações/15 minutos para CRITICAL; HIGH documentado. Indisponibilidade do CLI é registrada sem alegar revisão aprovada. O gate não autoriza commit sem a solicitação de Marcos.

## Dev Agent Record

### Completion Notes

Implementado o recorte administrativo em branch local feature/marcos-5-administracao-recursos, criada a partir de a10e0b5. Nova tela, CSS próprio e cliente administrativo reutilizam comunicação, sessão, pesquisa, datas e guard existentes. Perfil antes de consultas; GET antes de editar; PUT completo e tipo imutável; desativação e cancelamento identificados/confirmados; bloqueios multidia; expediente completo com precisão e confirmação de fechamento. Nenhum Java, flag ou dependência foi alterado. Movimentações, fila e Q9 continuam fora deste recorte.

Validação final: npm run build exit 0, lint/checkJs sem diagnósticos, 45 unitários e 130 testes de navegador aprovados, zero falhas/ignorados/retries. São 13 unitários novos e 54 execuções administrativas em desktop/móvel, além das regressões. API controlada somente nos testes, navegador administrativo em Asia/Tokyo. Seis capturas reais conferidas visualmente. A primeira rodada de navegador teve quatro falhas da asserção aplicada ao próprio fieldset; corrigida para atributo e controles descendentes. Revisão identificou FE-002, corrigido e coberto por regressão. [Resultados, comandos, capturas e limites](../testes/marcos-5-resultados.md).

Reexecução fornecida por Marcos em 11/11/2026: npm run build no CMD com PLAYWRIGHT_CHANNEL=chrome; lint/tipos sem diagnósticos, 45 unitários e 130 testes de navegador aprovados (1,3 min). Saída original preservada em docs/testes/marcos-5-verificacao-marcos.txt, separada da execução do assistente. Confirmação dos testes do autor, sem presumir aceite visual, revisão independente ou autorização de commit.

Posteriormente, a pedido de Marcos, foi aberta uma janela visível do Chrome para teste manual com perfil Administrador e fixtures dos testes. O auxiliar temporário ficou fora do repositório e interceptou a API somente nessa sessão de navegador, com aviso de dados fictícios. Após essa abertura, Marcos autorizou o commit, registrando o aceite do incremento local. Não se atribui teste manual de todos os cenários nem revisão independente a esse aceite. O produto e os testes aprovados não foram modificados para a prévia; nenhum auxiliar temporário integra este commit.

Checklist de DoD/self-critique: critérios locais, contratos, fronteiras, segurança do cliente, documentação, testes e estrutura conferidos. [Autoavaliação](../testes/marcos-5/autoavaliacao.json). CodeRabbit indisponível (CLI/WSL ausentes). Aceite local e commit autorizados por Marcos; integração, revisão humana de outro integrante e CI permanecem pendentes. As evidências não comprovam autorização do servidor nem E2E real.

### Agent Model Used

Codex, preparação AIOX SM e implementação AIOX Dev; revisão assistida AIOX QA discriminada abaixo.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-11 | Marcos autorizou o recorte cadastros/manutenção/expediente do item18; criada story Ready for Dev, independente de Marcos-4/Q9. Commit aguarda solicitação após validação. |
| 2026-11-11 | Recorte implementado e validado localmente em branch separada; 45 unitários/130 navegador aprovados. Story Ready for Review, mantendo aceite, commit e entrega integrada pendentes. |
| 2026-11-11 | Registrada reexecução aprovada fornecida por Marcos: 45 unitários/130 navegador, preservando evidências e pendências de aceite/integração/commit. |
| 2026-11-11 | Revisão visual aberta no Chrome com dados fictícios em sessão temporária; Marcos aceitou o incremento local e solicitou o commit. Entrega integrada e revisão de outro integrante continuam pendentes. |

### File List

Arquivos criados ou alterados neste incremento:

- `backend/src/main/resources/static/pages/gestao-recursos.html`
- `backend/src/main/resources/static/js/administracao-recursos.js`
- `backend/src/main/resources/static/js/gestao-recursos-page.js`
- `backend/src/main/resources/static/js/navegacao.js`
- `backend/src/main/resources/static/css/administracao.css`
- `tests/unit/frontend/administracao-recursos.test.js`
- `tests/browser/administracao-recursos.spec.js`
- `tests/browser/acesso.spec.js`
- `docs/stories/marcos-5.md`
- `docs/api/frontend-integracao.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/RTM.md`
- `docs/testes/marcos-5-resultados.md`
- `docs/testes/marcos-5-verificacao.txt`
- `docs/testes/marcos-5-verificacao-marcos.txt`
- `docs/testes/marcos-5-primeira-execucao.txt`
- `docs/testes/marcos-5/resultados.json`
- `docs/testes/marcos-5/primeira-execucao.json`
- `docs/testes/marcos-5/autoavaliacao.json`
- `docs/testes/marcos-5/gestao-desktop.png`
- `docs/testes/marcos-5/gestao-mobile.png`
- `docs/testes/marcos-5/edicao-desktop.png`
- `docs/testes/marcos-5/edicao-mobile.png`
- `docs/testes/marcos-5/expediente-desktop.png`
- `docs/testes/marcos-5/expediente-mobile.png`
- `docs/qualidade/defeitos-frontend.md`
- `README.md`
- `docs/README.md`

## QA Results

Parecer assistido AIOX QA: PASS para o incremento local. Revisão de fonte, contratos Java/item18, testes, documentação, checklist e File List não encontrou defeitos materiais/bloqueantes remanescentes. FE-002 foi corrigido e recebeu regressão. Evidência conferida: 45 unitários e 130 testes de navegador aprovados; lint/checkJs/build aprovados. A revisão não repetiu as suítes nem alterou arquivos. Este parecer não comprova backend real, segurança Spring, MySQL, auditoria, concorrência, CI ou revisão humana. Marcos posteriormente deu o aceite local e autorizou o commit. CodeRabbit, integração real, revisão humana de outro integrante e CI continuam pendentes.
