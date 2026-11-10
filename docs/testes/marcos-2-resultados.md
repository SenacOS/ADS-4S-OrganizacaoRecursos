# Marcos-2 — acesso e entrada por perfil

**Estado: INCREMENTO LOCAL DO FRONTEND ENCERRADO COM ACEITE DE MARCOS em 10/11/2026.** Story Ready for Review. Integração real, revisão de outro integrante, CodeRabbit e CI pendentes antes da entrega integrada e do merge.

## Execução

No PowerShell, com Node disponível:

```powershell
npm ci
npx playwright install chromium
npm run build
```

Alternativa usada nesta máquina, com Chrome já instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run build
```

No Prompt de Comando (CMD), a mesma alternativa usa a sintaxe abaixo. O download do Chromium falhou na tentativa do Marcos com SELF_SIGNED_CERT_IN_CHAIN; o canal Chrome permite usar o navegador já instalado, sem alterar a validação de certificados.

```bat
set "PLAYWRIGHT_CHANNEL=chrome"
npm run build
```

Ambiente observado: Windows, Node v24.22.2 portátil, npm 11.19.1, Playwright 1.65.0 e Chrome headless. O navegador e os processos de testes foram executados com autorização fora do sandbox. O servidor de teste foi encerrado ao fim da suíte.

| Verificação | Resultado |
|---|---|
| npm run lint | Sem diagnósticos |
| npm run typecheck | Sem diagnósticos (checkJs/noEmit estrito) |
| npm run test:unit | 21 testes aprovados |
| npm run test:browser | 15 cenários em duas viewports: 30 execuções aprovadas, zero ignoradas/falhas/retries |
| npm run build | Exit code 0; inclui lint, tipos e ambas as suítes |

[Saída integral da execução aprovada](marcos-2-verificacao.txt). [Resumo da execução](marcos-2/resultados.json).

## Reexecução e aceite de Marcos

Marcos forneceu a [saída do próprio terminal](marcos-2-verificacao-marcos.txt): npm run build concluiu lint e typecheck sem diagnósticos, 21 testes unitários com zero falhas e 30 testes de navegador aprovados em 17,1 s. A tentativa anterior estava bloqueada pela ausência do navegador após falha de certificado no download; a reexecução aprovada ocorreu após a orientação de usar o Chrome instalado. A saída não informa as versões de Node e navegador dessa reexecução.

Após a orientação para abrir o preview no Chrome, Marcos informou que a tela estava perfeita e pediu o encerramento da etapa. Registrado o aceite visual do autor em 10/11/2026 e encerrado o incremento local. Não se atribui revisão independente a outro integrante nem teste manual de todos os cenários. As evidências da execução original foram preservadas. Esta atualização é documental e não altera o código testado.

## O que foi verificado

Login por teclado; codificação especial de email/senha; cabeçalho CSRF dinâmico; 204; identificação do perfil via me; credenciais inválidas sem saída do formulário; HTML de erro mostrado como texto; referência de suporte separada; submissões simultâneas; sessão expirada sem loop; sessão existente sem novo login; destinos externos ignorados; três perfis; aprovação exclusiva de RESPONSAVEL; ausência de links para páginas inexistentes; logout confirmado somente após sucesso; falhas de logout e leitura da sessão; perfil desconhecido mantendo painel oculto; 403 sem replay e token novo para ação futura; ausência de persistência em localStorage/sessionStorage; largura móvel/desktop sem rolagem horizontal e ausência de erros JS não tratados.

Viewports: desktop 1366 × 900 e móvel 390 × 844. Conferência visual realizada nas quatro capturas abaixo. Labels, teclado e foco visível foram verificados, sem afirmar certificação de acessibilidade ou testes em todos os navegadores/dispositivos.

## Capturas

Todas usam dados fictícios de teste e API interceptada; não são evidência da autenticação real.

- [Login desktop](marcos-2/login-desktop.png).
- [Entrada desktop — Responsável](marcos-2/inicio-desktop.png).
- [Login móvel](marcos-2/login-mobile.png).
- [Entrada móvel — Responsável](marcos-2/inicio-mobile.png).

## Defeito encontrado e corrigido

A primeira execução de navegador encontrou quatro falhas, duas por viewport, nos cenários de submissão repetida de login/logout. A escrita era bloqueada corretamente, mas o finally do segundo evento restaurava o rótulo do botão durante a primeira operação. A restauração foi movida para dentro da operação protegida. Os quatro cenários e a suíte completa passaram depois da correção. Registro: [FE-001](../qualidade/defeitos-frontend.md#fe-001--rotulo-de-carregamento-restaurado-por-submit-repetido).

Não se afirma TDD pela simples existência desse ciclo; trata-se de defeito observado durante validação com regressão automatizada.

## Limites e revisões

- A API é controlada por page.route somente em tests/browser/acesso.spec.js. O servidor de preview só serve arquivos e não concede sessão fictícia.
- Não foram integradas branches de autenticação nem ativadas APIs. Cookie HttpOnly real, CSRF do Spring, autorização no servidor, persistência, auditoria e concorrência continuam sem validação nesta etapa.
- Telas de reservas, disponibilidade, fila, cadastros, movimentações e relatórios ficam nos próximos incrementos; as áreas futuras são exibidas como Em breve e não possuem links quebrados ou contadores fictícios.
- CodeRabbit continua indisponível neste ambiente (WSL/CLI não instalados). Revisão de outro integrante e CI continuam necessárias antes do merge.
- Revisão AIOX QA anterior: PASS para o incremento local. A revisão de fonte, testes e evidências não identificou defeitos materiais ou bloqueantes; não repetiu as suítes e não alterou arquivos. Marcos posteriormente forneceu a reexecução aprovada e seu aceite visual. Revisão de outro integrante, integração real e CodeRabbit/CI permanecem pendentes.

## Autoavaliação

Riscos examinados: 401 no login causar loop (callback ignora a própria tela); perfil desconhecido revelar ações (me validado antes de mostrar painel); mensagem da API injetar HTML (textContent); falha de logout produzir sucesso falso (redirecionamento só após 204); segundo evento alterar estado da primeira operação (regressão FE-001). Não há armazenamento de senha/token no navegador.
