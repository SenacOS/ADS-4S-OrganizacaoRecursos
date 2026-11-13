# Quality Gate — recorte comum do PR #28

**13/11/2026.** Correção local na worktree de `feature/marcos-reservas-consulta`, base0775715, ainda sem commit. Relacionada à story específica do recorte e ao [encaminhamento à equipe](../integracao/marcos-qualitygate-equipe-2026-11-13.md). Não incorpora5537163 nem os auxiliares/JSONs exclusivos do#29.

Foram corrigidas as seis chamadas S4036 de Git/PowerShell por nome e a detecção de include S8786. O módulo de executáveis valida caminho absoluto, arquivo regular, nome/caminho real e força execução com argumentos separados, shell:false e janela oculta. Configuração local confiável de instalações, sem fallback no PATH. Detecção de include mantém CR/LF/CRLF/U+2028/U+2029 com custo linear.

Sete arquivos comuns corrigidos, iguais aos da árvore principal do#29: controle, smoke, Q9, consulta, módulos executaveis/configuracao-local e testes configuracao.test.cjs. Os nove testes públicos executados nesta worktree passaram, incluindo invocador absoluto/erro propagado e entradas INI longas/terminadores. [Log9/0](marcos-qualitygate-1/unitarios-pr28.txt). Sintaxe dos auxiliares aprovada.

As reexecuções reais dos mesmos bytes comuns foram realizadas na árvore principal do#29, preservando produto/JAR e isolamento. Não são apresentadas como uma execução independente nesta worktree:

- Smoke16/0/0: [JSON](marcos-qualitygate-1/smoke-real.json), [saída](marcos-qualitygate-1/smoke.txt).
- Q9/fila10/0: [JSON](marcos-qualitygate-1/q9-real.json), [saída](marcos-qualitygate-1/q9.txt).
- Consulta/edição8/0: [JSON](marcos-qualitygate-1/consulta-real.json), [saída](marcos-qualitygate-1/consulta.txt).

Produto/telas e testes da regressão81/278 permanecem inalterados, sem nova suíte frontend ou package Maven. Auxiliares têm novos hashes; resultados antigos e o manifesto da fonte anterior continuam históricos, sem adulteração.

O Sonar anterior classificou SecurityB no#28, exigindoA. Esta correção local não é aprovação do gate: depois de commit/push autorizados, conferir nova análise do head. O scanner Maven também falhou com Not authorized or project not found após244unitários/HTTP,57MySQL,JaCoCo/JMeter aprovados; token/organização/projeto/permissão precisam de conferência da equipe. Nenhuma configuração ou secret foi alterada para contornar a falha.
