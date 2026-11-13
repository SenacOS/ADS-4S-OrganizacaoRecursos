# Marcos-qualidade-1 — resultado local

12/11/2026, America/Sao_Paulo. Branch `fix/marcos-qualidade-frontend`, criada da develop `da5881bcb65dcf048678b784ed14ae3013feabc2`, após o merge do PR #24. Alterações ainda **sem commit**; não atribuir o código novo ao SHA base.

As duas canonicalizações em `administracao-recursos.js` agora passam um comparador textual explícito ao `sort`. A comparação continua por unidades UTF-16, com igualdade somente entre strings idênticas. Não muda DTO, normalização, horário, mensagem ou comportamento da interface. Dois testes pela API pública do cliente verificam aceitação de conjuntos reordenados e rejeição de conteúdo distinto, incluindo Unicode composto/decomposto e sufixos numéricos.

## Verificação executada

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
npm.cmd run build
```

Resultado: **exit 0**, lint/typecheck aprovados, **70 unitários e 238 execuções de navegador** aprovados, 119 por viewport; zero falhas, ignorados ou flaky. Navegador: 156,173 s. [Log da execução](marcos-qualidade-1-verificacao.txt), [resumo, hashes e proveniência](marcos-qualidade-1.json).

Essa rodada cobre o comparador na árvore anterior à correção de integração de datas. Os hashes identificam exatamente seus dois arquivos alterados. A validação posterior da árvore com ambos os ajustes será registrada na [story de integração](../stories/marcos-integracao-datas-1.md), sem substituir esta execução histórica.

Os testes de navegador desta regressão usam API controlada. Não comprovam Spring Security, MySQL, concorrência ou notificações. A preparação/validação real autorizada depois é outro incremento: [Marcos-e2e-1](../stories/marcos-e2e-1.md).

## CI: falha separada da correção

Na develop `da5881b`, a [execução 43241249745](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43241249745), job `131261917002`, aprovou **239 testes unitários/HTTP e 49 integrações MySQL**. O Maven registrou cobertura atendida e `BUILD SUCCESS`. Só depois o scanner Maven **5.8.0.7211** terminou com `Not authorized or project not found`, seguido de `BUILD FAILURE`. [Trecho sanitizado do log remoto](marcos-qualidade-1-ci-diagnostico.txt).

Isso identifica a etapa e a mensagem, mas não distingue token incorreto, projeto/organização divergente ou permissão ausente. Não permite atribuir a causa ao plano do serviço. Débora deve conferir as configurações e permissão de análise no ambiente da CI, sem expor credenciais; conferir também se o token pertence à organização/projeto esperados. A documentação oficial orienta essas verificações: [troubleshooting do SonarQube Cloud](https://docs.sonarsource.com/sonarqube-cloud/appendices/troubleshooting) e [parâmetros de análise](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/analysis-parameters/parameters-not-settable-in-ui).

Nenhuma nova análise remota foi disparada. Workflows, gates, secrets, dependências e backend Java permanecem intactos. Os dois apontamentos de ordenação e a falha de autorização do scanner são problemas distintos; corrigir o primeiro não aprova o segundo. CodeRabbit CLI/WSL não estão disponíveis neste computador; não há aprovação dessa ferramenta inferida.

## Entrega e limites

Os PRs #23 e #24 já foram mesclados à develop; esse fato encerra sua pendência de merge. Os GETs de reservas, o vínculo Responsável/recurso e a autorização Q9 no servidor seguem com a equipe, conforme confirmação de Marcos. [Handoff concreto e responsáveis](../integracao/marcos-pendencias-2026-11-12.md).

Revisão QA do incremento, revisão humana da equipe, checks remotos e novo aceite/commit são registrados separadamente. Esta correção local não encerra todas as etapas 1 a 5.
