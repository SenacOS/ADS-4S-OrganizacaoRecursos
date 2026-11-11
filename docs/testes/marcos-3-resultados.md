# Marcos-3 — pesquisa e criação de reservas

Estado: IMPLEMENTADO E VALIDADO LOCALMENTE no recorte de pesquisa/seleção/criação. Story Ready for Review. Integração real, revisão independente, CodeRabbit e CI pendentes. A etapa 3 inteira inclui listagem/edição/cancelamento ainda dependentes da leitura autorizada.

Data: 10/11/2026, America/Sao_Paulo. Branch `feature/marcos-base-frontend`, base `5036ed3` com alterações locais da Marcos-3. RF03/RF04/RF13/RF14 somente na camada cliente.

## Execução reproduzível

Com Node 24+ e Chrome instalado, na raiz:

```powershell
npm ci
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run build
```

Alternativamente, instalar o Chromium do Playwright com `npx playwright install chromium` e executar sem `PLAYWRIGHT_CHANNEL`. A execução registrada usou Windows x64, Node 24.22.2 instalado, npm 11.19.1, Playwright 1.65.0 e Chrome 157.0.8103.39 headless. Não foram adicionadas dependências. O servidor de teste usa 127.0.0.1:4173 e é encerrado pelo Playwright.

| Gate | Resultado |
|---|---|
| npm run lint | Sem diagnósticos |
| npm run typecheck | Sem diagnósticos, checkJs/noEmit estrito |
| npm run test:unit | 32 aprovados, zero falhas/ignorados; 21 existentes e 11 novos |
| npm run test:browser | 76 aprovados em 112,9 s; 30 de acesso e 46 do novo recorte, desktop/móvel |
| npm run build | Exit code 0; agrega os quatro gates anteriores |

[Saída integral aprovada](marcos-3-verificacao.txt) e [ambiente/resultados](marcos-3/resultados.json). O horário UTC do relatório é 11/11/2026 01:31:59, correspondente a 10/11/2026 22:31:59 em São Paulo. Nenhum teste foi ignorado ou repetido automaticamente na execução aprovada.

## Casos verificados

- Conversão de datetime-local para São Paulo; datas inválidas, fim igual/anterior, limite diário e horários históricos de verão ausentes/ambíguos. O navegador da Marcos-3 usa `Asia/Tokyo`, e a criação continua enviando o instante correto com offset operacional.
- GETs contratados, filtros combináveis/codificados, disponibilidade false, paginação zero-based, envelope inválido e expediente com zona/horários válidos. Não há GET fictício de reservas/detalhes.
- Pesquisa inicial, carregamento, vazio, erro recuperável, expediente vazio/indisponível, limpar filtros e resposta atrasada descartada após alteração do período.
- Seleção de sala/docente/material, manutenção da seleção entre páginas/filtros, remoção ao mudar período ou ao receber indisponibilidade atualizada. Recursos inativos/indisponíveis não podem ser selecionados.
- Criação comum APROVADA e restrita SOLICITADA, CSRF dinâmico e DTO limitado aos três campos. Confirmação valida identidade da sessão, instantes e conjunto de recursos, sem inferir sucesso da seleção local.
- Duplo submit produz um POST, com busy/rótulo preservados; 400/403/404/409, falha de rede e resposta incoerente preservam dados sem replay. 401 usa o fluxo central de sessão expirada.
- HTML malicioso como texto, ausência de persistência em storage, teclado, foco após remoção/confirmação, links existentes, navegação por perfil e ausência de rolagem horizontal em 1366 × 900 e 390 × 844.

## Primeira rodada e capturas

A primeira execução teve 69 aprovações e um timeout de 15 s durante o setup de `page`, antes do fluxo da aplicação, no cenário móvel de recurso indisponível/inativo. [Registro dessa rodada](marcos-3/primeira-execucao.json). A suíte completa posterior incluiu também os novos casos de limpeza/atualização/capturas e passou com 76 aprovações. Não foram aumentados timeouts nem habilitados retries.

Após a suíte completa, a captura foi ajustada para posicionar o scroll no topo antes da imagem de página inteira, evitando o deslocamento visual do link fixo de acessibilidade. Somente os quatro testes de captura foram reexecutados: 4 aprovações em 27,5 s, zero falhas/ignorados/retries, conforme o resumo JSON. O código da aplicação não mudou depois da suíte completa.

As imagens usam apenas dados fictícios de teste e API interceptada:

- [Pesquisa/seleção desktop](marcos-3/pesquisa-desktop.png).
- [Pesquisa/seleção móvel](marcos-3/pesquisa-mobile.png).
- [Confirmação desktop](marcos-3/confirmacao-desktop.png).
- [Confirmação móvel](marcos-3/confirmacao-mobile.png).

As capturas foram inspecionadas para composição e legibilidade; os testes verificaram teclado, labels, foco e largura. Não se declara certificação de acessibilidade ou cobertura de todos os navegadores/dispositivos.

## Autoavaliação e limites

Riscos examinados: offset fixo/fuso do navegador, resposta antiga substituindo filtros atuais, perda de seleção paginada, POST repetido, sucesso sem confirmação e HTML da API. A seleção é informativa: o backend revalida disponibilidade, propriedade, expediente, estado e concorrência na escrita.

- [x] Recorte implementado e gates executados; consumo, plano, RTM e story atualizados.
- [x] API controlada apenas nos testes, sem ativação de rotas ou alterações Java.
- [x] Evidências anteriores da Marcos-2 preservadas e mudanças dessa tarefa mantidas separadas.
- [ ] Segurança/sessão/CSRF reais, auditoria/notificação persistidas, MySQL, concorrência e E2E integrado: não validados por este recorte.
- [ ] Listagem de reservas anteriores, reabertura para edição e cancelamento: aguardam GETs/política Q9. Clientes de escrita anteriores continuam disponíveis, sem inventar leitura.
- [ ] CodeRabbit: CLI não encontrado; `wsl --list --quiet` informou que o WSL não está instalado. Não se afirma revisão aprovada.
- [ ] Revisão de outro integrante e CI: pendentes; não houve push, PR ou merge.

O greeting AIOX não executa por ausência de `js-yaml` no framework; essa dependência não foi adicionada ao produto. Nenhum achado dos testes foi usado para declarar autoria de revisão independente ou TDD retroativo.
