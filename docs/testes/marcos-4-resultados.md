# Marcos-4 — cliente da fila e decisões de reservas

Estado: IMPLEMENTADO E VALIDADO LOCALMENTE contra a especificação aceita pelo frontend. Story Ready for Review; validação humana do Marcos, revisão independente, backend de leitura/autorização e integração real pendentes. Sem commit ou push nesta etapa.

Data: 10/11/2026, America/Sao_Paulo. Base `a10e0b5` com alterações locais da Marcos-4. Desenvolvido em `feature/marcos-base-frontend`. A develop remota foi consultada e permanece em `395ac73`, sem integração das dependências de leitura/segurança por este incremento.

Registro histórico da execução anterior à etapa 5. A retomada de 11/11/2026 foi autorizada em `feature/marcos-4-aprovacoes`, base `f7360a2`, para regressão conjunta. Ver [resultados da conciliação](marcos-4-conciliacao-resultados.md); os logs, JSON e capturas abaixo foram preservados.

## Execução e resultados

Na raiz, com Node 24+ e Chrome instalado:

```powershell
npm ci
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run build
```

| Gate | Resultado |
|---|---|
| npm run lint | Sem diagnósticos |
| npm run typecheck | Sem diagnósticos, checkJs/noEmit estrito |
| npm run test:unit | 43 aprovados: 32 anteriores e 11 novos |
| npm run test:browser | 124 aprovados em 133,2 s: 30 de acesso, 46 de recursos e 48 da fila |
| npm run build | Exit code 0; agrega lint, tipos e ambas as suítes |

Zero falhas, ignorados e retries na execução aprovada. Antes da regressão completa, a suíte específica de aprovações também passou com 48 execuções. Ambiente: Windows x64, Node 24.22.2, npm 11.19.1, Playwright 1.65.0 e Chrome 157.0.8103.39 headless. Viewports 1366 × 900 e 390 × 844; testes da Marcos-4 usam Asia/Tokyo para verificar apresentação/filtros em São Paulo. Nenhuma dependência ou regra de lint foi alterada; o override do minimatch foi preservado.

[Saída integral](marcos-4-verificacao.txt) e [ambiente/resultados](marcos-4/resultados.json). Nenhum arquivo Java ou flag de API foi alterado. Servidor local de teste: 127.0.0.1:4173, encerrado pelo Playwright.

## Cobertura do recorte

- Cliente consulta exclusivamente status SOLICITADA, com período opcional de vários dias, recursoId e paginação zero-based. Não consulta detalhes por id nem listagem geral/Q9.
- Solicitante/Administrador acessando a URL não consultam a fila nem recebem ações visíveis. 403 da API, mesmo para Responsável na interface, não revela solicitações.
- Validação de envelope, identidade mínima, estado/restrição, datas e correspondência dos recursos/patrimônio. Resposta inválida não renderiza itens parciais. Campos extras não passam para a projeção da interface.
- Filtros alterados descartam resultados/detalhes e respostas atrasadas; limpar filtros restaura parâmetros padrão. Vazio é apresentado separadamente de erro/404 de API indisponível.
- Aprovação e rejeição reutilizam escritas existentes, CSRF dinâmico e motivo aparado/obrigatório. Não enviam identidade, papel ou status no corpo.
- Resposta de decisão validada antes do sucesso. Após confirmação, leitura da fila atualizada; página esvaziada retorna a uma página anterior com GET. Se a leitura falha, a confirmação do POST permanece visível e não se oferece replay sobre detalhes antigos.
- Submits simultâneos fazem uma escrita; filtros, paginação e troca de solicitação ficam bloqueados durante a decisão. Erros 400/401/403/404/409, rede e resposta incoerente não provocam POST automático; 403 renova CSRF somente na próxima ação explícita.
- Motivo recuperável preservado; 409/rede/resposta incerta exigem atualizar/conferir a fila antes de outra decisão. Mensagens/identificações com HTML são tratadas como texto.
- Detalhes acessíveis por teclado, foco ao abrir/fechar, labels, layout sem rolagem horizontal e nenhum storage de sessão/dados da fila. Pendência não expira por regra do navegador.

## Capturas e validação humana

Imagens com dados fictícios e API controlada exclusivamente em `tests/browser/aprovacoes.spec.js`:

- [Fila/detalhes desktop](marcos-4/fila-desktop.png).
- [Fila/detalhes móvel](marcos-4/fila-mobile.png).
- [Decisão confirmada desktop](marcos-4/decisao-desktop.png).
- [Decisão confirmada móvel](marcos-4/decisao-mobile.png).

As quatro capturas foram inspecionadas pelo agente para composição, legibilidade e estados, sem atribuir aceite visual ao Marcos. Para acompanhar os testes em navegador visível, com pausa/inspector do Playwright:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npx playwright test aprovaco --project=desktop --debug
```

Esse comando acompanha testes automatizados com API controlada. A reexecução pelo autor e a inspeção visual devem ser registradas separadamente do E2E com backend real. O preview comum apenas serve arquivos: sem módulo de segurança/GET implementado, ele não oferece sessão ou fila de demonstração.

## Limites e pendências

O cliente segue `docs/api/reservas-leitura-contrato.md`, cuja implementação do GET e cuja revisão de projeção/autorização continuam com Silva/Fausto/Débora. A guarda da interface não comprova autorização do servidor. Não se implementou listagem geral ou detalhe de reservas, política Q9, edição/cancelamento da etapa 3, regra de conflitos, expiração de pendência ou notificação.

Autoavaliação: considerados perfis, projeção mínima, XSS, datas/fuso, respostas atrasadas, motivo em branco, falha após escrita e duplo envio. Não houve alteração de dependências, Java ou ativação de APIs. As suítes anteriores passaram novamente.

- [x] Critérios locais e gates verificados; evidências, docs, plano, RTM e File List atualizados.
- [ ] Validação humana/aceite do Marcos: pendente.
- [ ] Leitura/autorização real, cookie/CSRF do Spring, auditoria/notificação, banco/concorrência e E2E integrado: não demonstrados por esses testes.
- [ ] Revisão independente, CodeRabbit e CI: pendentes. CLI CodeRabbit não encontrado; WSL não instalado, conforme diagnóstico do ambiente. Não se declara parecer de QA independente.
- [ ] Commit e push: somente após os passos combinados com Marcos; nenhum executado nesta etapa.
