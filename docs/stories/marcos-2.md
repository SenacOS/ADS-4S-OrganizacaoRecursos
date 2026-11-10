# Marcos-2 — Login e entrada autenticada responsivos

## Status

Ready for Review

Incremento local do frontend encerrado com aceite de Marcos em 10/11/2026. Integração real, revisão de outro integrante, CodeRabbit e CI permanecem pendentes antes da entrega integrada e do merge.

## Story

Como usuário, quero entrar, identificar minha sessão e sair do sistema por telas claras e responsivas, para acessar os fluxos permitidos ao meu perfil.

Responsável: Marcos Boé. RF01, RF13, RF14. Story definida com AIOX SM. Dependência: clientes da Marcos-1. Fontes: PDF pp. 12–14, 17–19 e 23, ADR-001 e contrato de autenticação comunicado pelo usuário. Implementação e commit por etapa autorizados em 10/11/2026.

## Critérios de aceitação

1. login.html e index.html semânticos, CSS nativo responsivo e módulos ES na fonte única static/.
2. Manipuladores da UI reutilizam auth.js, api.js e forms.js; não duplicam fetch/serialização/CSRF.
3. Login com labels, autocomplete, feedback acessível, teclado e nenhum armazenamento de senha/token.
4. Formulário envia email/senha pelo cliente existente, com busy e bloqueio de submissões simultâneas; falhas restauram controles.
5. Login válido conduz à entrada autenticada; CREDENCIAIS_INVALIDAS permanece no formulário.
6. auth.me valida o perfil/identidade antes de revelar dados da sessão; UI não inventa nome, reservas ou contadores.
7. Sessão ausente/expirada redireciona para login com mensagem conhecida, sem loop ou destino externo arbitrário.
8. Logout usa CSRF e bloqueio de clique repetido; sucesso retorna ao login, falha não afirma encerramento da sessão.
9. Mensagens e referência de suporte usam textContent; aprovação é exclusiva de RESPONSAVEL na navegação, sem herança para ADMINISTRADOR.
10. Não há links para páginas inexistentes. Funcionalidades dos próximos incrementos aparecem indisponíveis, sem simular dados.
11. Layout utilizável em móvel e desktop, foco visível, ordem de teclado, estados de carregamento/erro e botão de nova tentativa segura de leitura.
12. Testes de navegador com API controlada cobrem login, sessão, logout, erros, duplo envio, perfis, teclado e responsividade; não são apresentados como E2E real do backend.
13. Gates, documentação, RTM, checklist, File List e evidências reais são atualizados antes do commit local.

## Tasks / Subtasks

- [x] Construir login, entrada autenticada e CSS compartilhado.
- [x] Implementar manipuladores de login e guardas de sessão.
- [x] Implementar identificação/perfil, navegação e logout.
- [x] Tratar sessão expirada, falhas, mensagens e referências seguras.
- [x] Executar testes de navegador em móvel/desktop e manter a suíte unitária.
- [x] Executar lint, typecheck, test e build.
- [x] Atualizar docs, RTM, evidências, checklist e File List; preparar commit local.
- [x] Registrar execução dos testes pelo Marcos e seu aceite visual do incremento local.
- [ ] Integrar autenticação real e obter revisão de outro integrante/CodeRabbit/CI antes de fechar a entrega integrada.

## Dev Notes

Não integrar branches ou habilitar APIs com provedores falsos. Mocks ficam exclusivamente nos testes. As páginas não fazem GETs de reservas inexistentes. A escolha da ferramenta de navegador será validada por experimento curto nesta etapa; sem ferramenta obrigatória no produto.

## Testing

Login URL-encoded + CSRF dinâmico/204; credenciais inválidas; me/sessão expirada; logout sucesso/falha; envio único; três perfis; texto com HTML; teclado; largura móvel/desktop; ausência de links quebrados/dados fictícios. Sem afirmar cookie HttpOnly real, autorização do servidor, auditoria, persistência ou concorrência.

## Dev Agent Record

### Completion Notes

Implementação do incremento validada localmente: lint, checkJs, 21 testes unitários e 30 execuções de navegador em Chrome headless. Backend de autenticação ainda fora deste checkout; não se declara integração real. Playwright adotado como ferramenta de desenvolvimento após experimento com Chrome instalado. Dependência instalada com autorização; não há compilação do frontend no produto. FE-001 foi encontrado e corrigido durante os testes. [Resultados e limites](../testes/marcos-2-resultados.md).

Marcos repetiu npm run build no próprio terminal: lint e tipos sem diagnósticos, 21 testes unitários e 30 testes de navegador aprovados em 17,1 s. Após orientação para visualizar a tela no Chrome, informou que estava perfeita e solicitou o encerramento da etapa. Aceite registrado em 10/11/2026; não equivale a revisão independente nem a teste manual de todos os cenários. A saída fornecida foi preservada separadamente em docs/testes/marcos-2-verificacao-marcos.txt. Esta atualização altera somente documentação e conserva as evidências da execução anterior.

### File List

- .gitignore
- README.md
- backend/src/main/resources/static/login.html
- backend/src/main/resources/static/index.html
- backend/src/main/resources/static/css/app.css
- backend/src/main/resources/static/js/api.js
- backend/src/main/resources/static/js/auth.js
- backend/src/main/resources/static/js/login-page.js
- backend/src/main/resources/static/js/dashboard-page.js
- backend/src/main/resources/static/js/ui.js
- backend/src/main/resources/static/js/navegacao.js
- eslint.config.js
- package.json
- package-lock.json
- playwright.config.js
- tests/browser/static-server.mjs
- tests/browser/acesso.spec.js
- docs/README.md
- docs/RTM.md
- docs/api/frontend-integracao.md
- docs/planejamento/marcos-plano-de-acao.md
- docs/stories/marcos-2.md
- docs/testes/marcos-2-resultados.md
- docs/testes/marcos-2-verificacao.txt
- docs/testes/marcos-2-verificacao-marcos.txt
- docs/testes/marcos-2/resultados.json
- docs/testes/marcos-2/login-desktop.png
- docs/testes/marcos-2/login-mobile.png
- docs/testes/marcos-2/inicio-desktop.png
- docs/testes/marcos-2/inicio-mobile.png
- docs/qualidade/defeitos-frontend.md

## QA Results

Parecer AIOX QA anterior: PASS no incremento local, sem defeitos materiais/bloqueantes identificados. Evidências e escopo conferidos, sem nova execução redundante dos testes. Acrescentados execução dos testes e aceite visual informados por Marcos. A story fica Ready for Review com o incremento local encerrado; integração real, revisão de outro integrante, CodeRabbit e CI permanecem pendentes. Esta atualização documental não constitui novo parecer de QA.
