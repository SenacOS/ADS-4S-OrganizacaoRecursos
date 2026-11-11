# Marcos-deps-1 — minimatch corrigido com ESLint 10

Estado: VALIDADO LOCALMENTE. Correção de ferramentas separada da Marcos-2/Marcos-3, sem commit ou push. Revisão independente pendente. Data: 10/11/2026, America/Sao_Paulo.

## Diagnóstico e alteração

O npm audit reportava quatro registros moderados associados ao [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), originados no minimatch 10.2.6 e propagados à cadeia do ESLint. O advisory indica 11.0.1 como versão corrigida. O registry consultado nesta sessão ainda fornece ESLint 10.14.0 com minimatch ^10.2.6 e @eslint/config-array 0.23.5 com ^10.2.4.

Foi acrescentado ao package.json um override limitado aos descendentes do ESLint:

```json
"overrides": {
  "eslint": {
    "minimatch": "11.0.1"
  }
}
```

ESLint permaneceu 10.14.0 e @eslint/js permaneceu 10.0.1. O package-lock foi regenerado por npm, com hashes de integridade; a reinstalação usou npm ci. O minimatch passa de 10.2.6 para 11.0.1 e acrescenta a dependência transitiva de desenvolvimento @isaacs/nonrecursive-glob-match 1.1.0. Nenhuma dependência direta nova, regra/configuração do lint ou código da aplicação foi alterado por este incremento.

O mecanismo segue a [documentação de overrides do npm](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides). **O minimatch muda de versão principal e está fora do range originalmente declarado pelo ESLint.** A compatibilidade aqui é a observada nas verificações deste projeto; não é uma afirmação de suporte upstream ou equivalência geral entre as versões.

## Verificações

| Verificação | Resultado |
|---|---|
| npm install --package-lock-only --ignore-scripts --no-fund | Lockfile atualizado, sem audit fix --force |
| npm ci --ignore-scripts --no-fund | Instalação reproduzida; zero vulnerabilidades |
| npm ls eslint @eslint/js @eslint/config-array minimatch | Árvore válida; ESLint 10.14.0 e minimatch 11.0.1 sob override |
| npm audit completo | Antes: 4 moderadas; depois: zero vulnerabilidades, exit code 0 |
| Compatibilidade do lint | Mesmos 20 arquivos e diagnósticos antes/depois; nenhum erro/aviso |
| Regras intencionais | no-unused-vars e no-undef detectadas em lintText; módulo válido aceito |
| npm run build | Exit code 0; lint, checkJs, 32 unitários e 76 testes de navegador aprovados |

Navegador: Chrome instalado via PLAYWRIGHT_CHANNEL=chrome, headless, viewports desktop/móvel, sem retries ou testes ignorados na execução aprovada. Node 24.22.2, npm 11.19.1 e Playwright 1.65.0. O servidor de teste é local e a API segue controlada nos testes. Esta correção não acrescenta evidência de integração real com Spring/MySQL.

A comparação de lint usou ESLint.lintFiles com os mesmos diretórios/arquivos do script lint. Foram comparados caminhos, errorCount e warningCount de cada resultado. As verificações em memória usaram const naoUsado = 1 para no-unused-vars, nomeInexistente() para no-undef e export const valor = 1 como caso válido. Não foram adicionados arquivos JavaScript artificiais ao produto nem reduzido o conjunto analisado para obter aprovação.

## Evidências e reprodução

- [Auditoria anterior](marcos-deps-1/audit-antes.json).
- [Auditoria após a reinstalação](marcos-deps-1/audit-depois.json).
- [Árvore instalada](marcos-deps-1/arvore.json).
- [Arquivos e verificações de compatibilidade do lint](marcos-deps-1/lint-compatibilidade.json).
- [Resumo da execução](marcos-deps-1/resultados.json).
- [Saída integral do build](marcos-deps-1-verificacao.txt).

```powershell
npm ci
npm ls eslint @eslint/js @eslint/config-array minimatch
npm audit
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run build
```

Nos comandos executados pelo agente, NODE_USE_SYSTEM_CA=1 foi definido somente no processo para respeitar os certificados do Windows. Nenhum ajuste permanente de TLS ou configuração global foi feito.

## Manutenção e fluxo de entrega

Reavaliar o override quando o ESLint/@eslint/config-array declararem uma dependência corrigida compatível. Removê-lo somente após verificar o lockfile, repetir npm ci/audit e comparar os arquivos/regras analisados pelo lint. Ao atualizar ferramentas, conferir também as mudanças de API do minimatch.

As alterações anteriores e suas evidências foram preservadas. Esta correção deve receber seu próprio commit quando Marcos solicitar; não se mistura ao aceite humano da Marcos-3. Revisão independente/CodeRabbit/CI continuam pendentes, sem alegação de aprovação. Não houve commit, push ou atualização de branch remota.
