# Marcos-deps-1 — Corrigir o alerta do minimatch mantendo ESLint 10

## Status

Ready for Review

## Story

Como responsável pelo frontend, quero corrigir a dependência vulnerável das ferramentas de lint mantendo a versão principal do ESLint, para preservar a configuração e a execução das verificações.

Responsável: Marcos Boé. RF13/RF14 e qualidade das ferramentas. Preparação AIOX SM e implementação AIOX Dev. Marcos autorizou tratar os alertas sem mudar a versão principal do ESLint nesta sessão. Não autoriza commit ou push. Este incremento é separado da revalidação Marcos-2 e da implementação Marcos-3, já presentes no workspace.

## Fontes e diagnóstico

- [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249): minimatch >=7.0.0 e <11.0.1 afetado; correção em 11.0.1. CPU/memória excessivas ao processar padrões controlados externamente com optimizationLevel >=2.
- npm audit: quatro registros moderados na cadeia minimatch, @eslint/config-array, eslint e @eslint/js; nenhuma alta/crítica. São dependências de desenvolvimento.
- Registry npm consultado nesta sessão: ESLint 10.14.0 é o último da linha 10 e depende de minimatch ^10.2.6; @eslint/config-array 0.23.5 depende de ^10.2.4. Atualizar apenas dentro desses ranges não alcança a correção indicada pelo advisory.
- [npm overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides): override por ancestral permite limitar a substituição à árvore do ESLint.
- ADR-001 e package.json: Node/npm são ferramentas de desenvolvimento; o produto permanece HTML/CSS/JS estático servido pelo Spring.

## Critérios de aceitação

1. Manter eslint 10.14.0 e @eslint/js 10.0.1, sem mudar configuração/regras do ESLint ou código da aplicação.
2. Fixar minimatch 11.0.1 sob a árvore do ESLint via overrides; gerar package-lock com npm, sem editar node_modules manualmente ou usar audit fix --force.
3. Explicitar que minimatch muda de versão principal e fica fora do range originalmente declarado pelo consumidor. Validar a compatibilidade observada no projeto, sem afirmar suporte geral ou correção upstream no ESLint.
4. Comparar antes/depois a lista de arquivos analisados, os diagnósticos e a detecção intencional de no-unused-vars/no-undef. O lint não pode passar por deixar arquivos sem análise.
5. npm ci reproduz a árvore corrigida, npm ls não acusa dependências inválidas e npm audit completo retorna zero vulnerabilidades na consulta final.
6. Executar lint, typecheck, testes e build; preservar evidências anteriores. Registrar versões, auditoria, verificação de compatibilidade e limites.
7. Documentar a manutenção do override: reavaliar quando o ESLint declarar suporte à dependência corrigida; não remover apenas para eliminar a configuração.

## Tasks / Subtasks

- [x] Registrar árvore/auditoria e arquivos/diagnósticos do lint antes da mudança.
- [x] Aplicar override restrito e atualizar lockfile.
- [x] Reinstalar com npm ci e verificar árvore/auditoria.
- [x] Comparar análise do lint e executar gates completos.
- [x] Atualizar evidências, checklist e File List.
- [ ] Obter revisão independente e autorização para commit; push continua com Marcos.

## Dev Notes

Mudança limitada a ferramentas. O override é uma substituição explícita de dependência transitiva com mudança principal; compatibilidade precisa de evidência. Não reduzir regras, omitir diretórios, trocar ESLint para 9, alterar endpoints ou misturar as evidências de segurança com o aceite humano da Marcos-3. Sem dependências diretas novas. A validação usa Node 24.22.2 e Chrome instalado para a suíte existente.

## CodeRabbit Integration

Tipo: manutenção/segurança de ferramentas. @dev executa gates e autoavaliação; revisão independente pendente. Conferir override, lockfile e cobertura dos arquivos pelo lint. CodeRabbit/WSL estavam indisponíveis neste ambiente; registrar a limitação sem afirmar revisão aprovada.

## Dev Agent Record

### Completion Notes

Override aplicado somente a minimatch sob ESLint. ESLint 10.14.0/@eslint/js 10.0.1 preservados; minimatch 11.0.1 fora do range original validado no contexto do projeto. Lockfile gerado pelo npm e reinstalado com npm ci. Auditoria completa passou de quatro alertas moderados para zero. Mesmos 20 arquivos/diagnósticos e regras de erro intencionais conferidos antes/depois.

`npm run build` passou: lint, checkJs, 32 testes unitários e 76 testes de navegador, sem falhas/ignorados/retries. [Resultados, fontes, reprodução e limites](../testes/marcos-deps-1-resultados.md). Autoavaliação: alteração mínima em package.json/lockfile; nenhuma edição de configuração do lint ou fonte/teste da aplicação neste incremento. O novo pacote transitivo do minimatch é documentado. Reavaliar o override em atualizações futuras. Evidências e arquivos das etapas anteriores preservados. Revisão independente/CodeRabbit/CI pendentes; commit/push não realizados.

### File List

- docs/stories/marcos-deps-1.md
- package.json
- package-lock.json
- docs/testes/marcos-deps-1-resultados.md
- docs/testes/marcos-deps-1-verificacao.txt
- docs/testes/marcos-deps-1/audit-antes.json
- docs/testes/marcos-deps-1/audit-depois.json
- docs/testes/marcos-deps-1/arvore.json
- docs/testes/marcos-deps-1/lint-compatibilidade.json
- docs/testes/marcos-deps-1/resultados.json

## QA Results

Revisão independente pendente.
