# Marcos-1 — resultados locais

Estado: VALIDADO LOCALMENTE para a base de clientes; revisão independente, CodeRabbit, CI e E2E PENDENTES.
Data: 10/11/2026. Branch: `feature/marcos-base-frontend`, baseada em `origin/develop` (395ac73).
Escopo: RF01/RF04/RF07/RF13/RF14 apenas na camada cliente.

## Evidência executada

[Saída integral da verificação](marcos-1-verificacao.txt).

| Comando | Resultado |
|---|---|
| `npm run lint` | Passou, executado dentro de build; ESLint sem diagnósticos |
| `npm run typecheck` | Passou, executado dentro de build; TypeScript checkJs/noEmit estrito |
| `npm test` | 21 testes, 21 aprovações, zero falhas/ignorados |
| `npm run build` | Exit code 0; agrega os três comandos acima, sem compilar o produto |
| `git diff --check` | Sem diagnósticos nos arquivos rastreados |

Ambiente: Windows/PowerShell, Node portátil v24.22.2 e npm 11.19.1. Dependências de desenvolvimento fixadas em package-lock.json; frontend permanece HTML/CSS/JS nativo servido pelo Spring.
Para reproduzir em ambiente preparado: `npm ci` e `npm run build` na raiz.

Node/npm estavam ausentes do PATH. Após autorização de execução/escrita, Node foi baixado do site oficial para a pasta temporária com SHA256 verificado. A primeira instalação de dependências encontrou SELF_SIGNED_CERT_IN_CHAIN; a repetição usou `node --use-system-ca .../npm-cli.js install --ignore-scripts`, preservando validação TLS com os certificados do Windows. Nenhum .npmrc permanente foi alterado. Referência: [opção oficial do Node](https://nodejs.org/api/cli.html#--use-system-ca).
A linha inicial ESLint 9 informou fim de suporte; foi substituída por ESLint 10 e os gates foram executados novamente. [Política oficial de suporte](https://eslint.org/version-support/).

## Cenários cobertos

- Sessão same-origin; GET me sem CSRF desnecessário.
- POST/PUT/PATCH/DELETE com cabeçalho CSRF dinâmico; busca compartilhada do token para escritas paralelas.
- Login URL-encoded preserva caracteres especiais; respostas 204; renovação de CSRF após login/logout.
- 401 de credenciais permanece no login; 401/NAO_AUTENTICADO aciona callback central de redirecionamento.
- Erros 400/403/404/409 preservam mensagem/referência; nenhum replay; 403 descarta token para ação futura.
- PATCH completo com offset e remoção de solicitante/papel/status; datas sem fuso, dia inexistente, fim igual e recursos inválidos bloqueados localmente.
- Rotas de cancelamento/aprovação/rejeição e motivo obrigatório.
- Conveniência visual de aprovação exclusiva de RESPONSAVEL.
- Erros de rede e HTML inesperado sem vazamento técnico; origem externa e correlação inválida recusadas.
- Guard por formulário bloqueia segundo envio, indica busy e restaura controles após sucesso/erro.

## Autoavaliação e limites

Riscos examinados: CSRF anterior ao login reutilizado (token descartado após sucesso), 204 interpretado como JSON (tratamento explícito), duplo envio durante await (flag síncrona antes do await), datas normalizadas pelo Date.parse como 30/02 (dia civil conferido), rede falhando depois de commit (mensagem orienta conferir resultado; nenhum retry).
Fronteiras consideradas: motivo em branco, fim igual ao início, lista vazia/IDs inválidos, credenciais com &, + e caracteres acentuados, HTML em vez de JSON e 403 sem replay.

- [x] Critérios técnicos da story implementados e testes isolados executados.
- [x] Estrutura estática/contratos respeitados, sem código backend alterado nem GET inventado.
- [x] Checklists e file list atualizados; documentação de consumo e RTM incremental.
- [ ] CodeRabbit: indisponível. `wsl --list --quiet` informou que WSL não está instalado; não há CLI nativa encontrada. Não declarar revisão aprovada.
- [ ] Revisão humana, CI/quality gate do repositório e merge: ainda não realizados.
- [ ] E2E real, responsividade, acessibilidade no navegador, cookie/CSRF real, autorização do servidor, MySQL e cobertura JaCoCo/Sonar: fora do incremento e não validados.
- [ ] Auditoria de dependências não executada (`--no-audit`); nenhum resultado de vulnerabilidades é afirmado.

A execução do gerador de greeting AIOX também encontrou falta de js-yaml no framework. Isso não impediu os testes do cliente e não foi corrigido alterando dependências do framework.
Não se marca o frontend inteiro, os RFs inteiros ou a story como Done. Próxima story: login/logout e navegação responsiva por perfil; depois formulários/consulta e integração real conforme plano.
