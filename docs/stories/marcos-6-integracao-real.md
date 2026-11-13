# Marcos-6 — Integração HTTP real do relatório de utilização

## Status

Ready for Review

## Story

Como Administrador, quero acessar o relatório pelo menu e consultar o período e o recurso no backend real, para acompanhar utilização e conflitos com os mesmos dados e permissões entregues pelos PRs #37/#39/#41.

Continuidade autorizada por Marcos em 13/11/2026 após a conferência dos merges #38/#40/#41. Base `origin/develop` em `806562688f9b359475d59441a1a1e75738f0cd28`, branch local `feature/marcos-6-integracao-real`. Preparação AIOX SM; implementação AIOX Dev. RF12, RF01, RF13 e RF14. A preparação não autorizava publicação automática.

**Autorização posterior de entrega em13/11/2026:** após o aceite humano, Marcos pediu expressamente **“faça o commit, push e abra o PR”**. O commit que inclui este registro identifica a integração local aceita; envio e PR têm sua confirmação remota própria. Revisão independente/equipe, checks e merge na develop permanecem separados e não foram aprovados por inferência.

## Fontes e escopo

- [Plano da etapa 6](../planejamento/marcos-etapa-6-plano-de-acao.md), fase C: conciliar HTTP e testar com Spring/MySQL isolados.
- [Story controlada Marcos-6](marcos-6.md), [contrato/DTO adotado](../api/relatorios-utilizacao-proposta.md) e [resultados 97/346](../testes/marcos-6-rf12-39-resultados.md): históricos próprios, sem atribuir E2E a interceptações.
- [PR #40](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/40): frontend integrado.
- [PR #41](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/41): `GET /api/reservas/relatorio-utilizacao`, `inicio`/`fim` com offset obrigatórios, `recursoId` positivo opcional e `estados` opcionais; serviço transacional registrado no Spring, acesso provisório ADMINISTRADOR pela sessão.
- `RelatorioUtilizacaoController`, `RelatorioUtilizacaoResponse`, `ConsultarRelatorioUtilizacao`, `ReservaRelatorioMysql`, `UtilizacaoReservas` e testes do controller/proxy: comportamento efetivamente entregue, sem reimplementar SQL/cálculo.
- [Guia de E2E local](../integracao/marcos-e2e-local.md) e [fluxo de trabalho](../planejamento/fluxo-de-trabalho-marcos.md).

Fora do recorte: CSV, gráficos, seletor de estados, caixa RF11, nova política de perfis, mudança Java/SQL/configuração persistente e reabertura das etapas 1–5. Se a integração revelar defeito de backend, registrar a evidência antes de ampliar o escopo.

## Critérios de aceitação

1. Preservar as 55 alterações antigas por cópia/hash e metadados, encerrar o merge antigo e guardar as 49 alterações autorais restantes em stash conferido. Partir de checkout limpo da develop atual, sem reaplicar esse conjunto. Manter ferramentas/dados privados e os demais worktrees intactos.
2. Cliente, fixtures e prévia usam somente a rota HTTP efetiva do #41; remover a condição de rota candidata no contexto atual. Preservar query, DTO/minutos truncados, precisão das datas, estados padrão, guarda de perfil, mensagens, envio único e descarte de respostas antigas.
3. Link Relatórios no menu somente para ADMINISTRADOR. Outros perfis não recebem link nem fazem consulta por acesso direto à página. Autorização do servidor continua indispensável; nenhum papel/ID enviado pelo cliente eleva a sessão.
4. Auxiliar opt-in com Spring/MySQL/Chrome reais, sem interceptações, identifica base/árvore/JAR/fontes servidas e ambiente isolado. Cria massa própria por HTTP autorizado, preserva dados anteriores e limita SQL de inspeção a SELECT. Credenciais e logs brutos continuam privados.
5. Comprovar total por reserva distinto da soma por recurso, filtro que mantém todos os vínculos, recorte do período, minutos truncados/zero com reservas, vazio e conflitos pelo momento do evento com fronteira semiaberta. Comparar respostas/UI com massa conhecida e inspeções de persistência, sem atribuir cobertura geral a exemplos pontuais.
6. Comprovar autorização HTTP para Administrador, 401 sem sessão, 403 para outros perfis/identidade forjada na query, parâmetros inválidos no envelope padrão e acesso/consulta pela UI real. Não atribuir ao teste de navegador prova de todos os controles ou da produção.
7. Executar gates frontend e build Java proporcionais. Publicar evidências sanitizadas, comandos, tentativas e limites com hashes/camadas; atualizar contrato, plano, story, RTM e File List. Manter revisão do autor, revisão independente, checks e entrega remota separados.

## Tasks

- [x] Preservar o checkout antigo e criar a branch limpa da develop (AC 1).
- [x] Conciliar rota e navegação; ajustar os testes de consumo/perfis e a prévia (AC 2–3).
- [x] Preparar JAR/ambiente e auxiliar real reproduzível (AC 4).
- [x] Executar provas sem interceptação de dados, fronteiras e autorização (AC 5–6).
- [x] Executar gates, registrar evidências e atualizar documentação/rastreabilidade (AC 7).
- [x] Obter aceite de Marcos após a execução do roteiro humano, sem ajuste solicitado.
- [x] Receber autorização explícita de Marcos para commit, push e abertura do PR.
- [ ] Obter revisão independente/equipe e concluir entrega; commit somente por solicitação própria.

## Dev Notes

O controller depende de `reservas.api.enabled=true`, já usado pelo ambiente isolado. O DTO usa minutos inteiros e o filtro conserva os recursos das reservas selecionadas. Não recuperar precisão que o backend não envia, somar alocações como total ou exigir duração positiva quando o truncamento resulta em zero. A política ADMIN permanece provisória conforme o serviço integrado.

Ferramentas e banco desta máquina são privados; nunca copiar credenciais do outro computador ou apagá-los para sincronizar Git. O JAR anterior precisa de backup e o processo próprio deve ser identificado antes de reconstruir/reiniciar. Não tratar um resultado parcial com erro como aprovação.

## Dev Agent Record

### Completion Notes

**Aceite do autor em13/11/2026:** Marcos executou o roteiro humano e confirmou todos os resultados esperados. [Registro](../testes/marcos-6-integracao-real-aceite-2026-11-13.md). Implementação e validação local da etapa6 concluídas no escopo implementado; aguardam revisão independente/equipe, commit solicitado, publicação/checks e integração do novo recorte. Ready for Review preservado; nenhum ajuste de produto ou novo teste decorreu do aceite.

Backup de 55 arquivos com hashes e metadados Git conferidos; merge antigo encerrado, 49 arquivos autorais guardados no stash `f8604623dd5391a8a5ae3eefb48f8715440ed4a4`, conferidos com conversões LF/CRLF explicitadas e cópia original byte a byte preservada. Branch criada limpa de `8065626`, sem reaplicação. Ferramentas/banco e demais worktrees preservados. Inventário privado em `.aiox-core/local/retomada-rf12-backup.json`.

Cliente/fixtures/prévia conciliados com `/api/reservas/relatorio-utilizacao`; menu exclusivo do Administrador e aviso de prévia removido da página real. Produto continua sem fallback fictício. Não houve mudança autoral Java/SQL/Spring, migrações ou dependências.

JAR anterior preservado; processos próprios identificados e reiniciados com a base atual, mantendo os dados. Configuração privada recebeu caminhos explícitos de Git/PowerShell exigidos pelos auxiliares atuais, sem alterar PATH global. Package **277 unitários/HTTP**, build **97 unitários frontend/346 navegador** e auxiliar real **13/0** aprovados. [Resultados/capturas/inventário](../testes/marcos-6-integracao-real-resultados.md), [roteiro humano](../testes/marcos-6-integracao-real-verificacao.md).

Encerramento assistido do servidor estático após346testes documentado; comando concluiu exit0 e emitiu JSON final, sem remover gate/teste. Capturas reais desktop/mobile inspecionadas pelo agente. A revisão técnica é assistida pelo mesmo executor; CodeRabbit local indisponível, sem aprovação presumida. Aceite humano/independente e entrega remota separados; sem novo commit/push, sem transição global da etapa6 para Done.

Após a troca de branch apareceu uma edição externa ao recorte no cabeçalho de `docs/planejamento/marcos-fechamento-etapas-1-a-5.md` (dois espaços iniciais). Foi preservada e não integra a File List autoral deste incremento. Etapas1–5 não foram reabertas.

### Agent Model Used

Codex; preparação AIOX SM, sincronização AIOX DevOps, implementação AIOX Dev e revisão QA assistida do mesmo executor. Sem revisão independente atribuída.

### File List

- `backend/src/main/resources/static/js/navegacao.js`
- `backend/src/main/resources/static/js/relatorios-utilizacao.js`
- `backend/src/main/resources/static/pages/relatorios-utilizacao.html`
- `docs/README.md`
- `docs/RTM.md`
- `docs/api/frontend-integracao.md`
- `docs/api/relatorios-utilizacao-proposta.md`
- `docs/integracao/marcos-e2e-local.md`
- `docs/planejamento/marcos-etapa-6-plano-de-acao.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/stories/marcos-6-integracao-real.md`
- `docs/stories/marcos-6.md`
- `docs/testes/marcos-6-integracao-real-resultados.md`
- `docs/testes/marcos-6-integracao-real-aceite-2026-11-13.md`
- `docs/testes/marcos-6-integracao-real-verificacao.md`
- `docs/testes/marcos-6-integracao-real/desktop-relatorio.png`
- `docs/testes/marcos-6-integracao-real/gates-resumo.txt`
- `docs/testes/marcos-6-integracao-real/inventario.json`
- `docs/testes/marcos-6-integracao-real/mobile-relatorio.png`
- `docs/testes/marcos-6-integracao-real/navegador-resumo.json`
- `docs/testes/marcos-6-integracao-real/resultados.json`
- `tests/browser/acesso.spec.js`
- `tests/browser/relatorios-utilizacao-preview.mjs`
- `tests/browser/relatorios-utilizacao.spec.js`
- `tests/e2e-local/validar-relatorios.cjs`
- `tests/unit/frontend/relatorios-utilizacao.test.js`

### Change Log

| Data | Alteração |
|---|---|
| 2026-11-13 | Preparação do recorte derivado da fase C e do endpoint #41; sincronização preservada e critérios definidos, sem novo commit/push. |
| 2026-11-13 | Integração local pronta para revisão: rota/menu, package277, build97/346 e13cenários reais aprovados; documentação/evidências/roteiro atualizados, preservando fontes históricas e limites. |
| 2026-11-13 | Marcos confirmou a execução humana com todos os resultados esperados; aceite registrado sem ajustes, nova execução de suítes ou autorização de commit/push. Implementação e validação local aceitas; entrega/revisão independente continuam pendentes. |
| 2026-11-13 | Após o aceite, Marcos autorizou expressamente commit/push/PR. Fontes/testes/evidências conferidos por hash, revisão documental e auditoria de dependências sem vulnerabilidades; sem nova execução das suítes ou dispensa de revisão/check remoto. |

## QA Results

Revisão técnica assistida em13/11/2026, pelo mesmo executor: rota/DTO, privilégios do menu/HTTP, fronteiras, fixture exclusiva, sanitização, fontes/JAR e capturas conferidos. Nenhum novo defeito demonstrado no recorte examinado. Resultados atuais277/97/346 e13/0 têm camadas/origens separadas; o teste controlado não foi convertido em prova Spring/MySQL.

Aceite de Marcos posteriormente confirmado pelo roteiro humano e [registrado](../testes/marcos-6-integracao-real-aceite-2026-11-13.md); não equivale a parecer independente. CodeRabbit local indisponível; nenhum novo check remoto executado. Revisão independente/equipe, commit solicitado e entrega do novo recorte permanecem pendentes; Ready for Review preservado, sem dispensa de gate.
