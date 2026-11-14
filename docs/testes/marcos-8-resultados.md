# Marcos-8 — conferência da entrega publicada — 13/11/2026

**Etapas1–7 integradas; consolidação documental da etapa8 pronta para revisão/publicação autorizadas.** [Story](../stories/marcos-8.md), [dossiê preparado](../entrega/marcos-entrega-final.md) e [evidência estruturada](marcos-8/ci-pr45.json).

## Base e orientação de continuidade

Etapa7 publicada no [PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/45), commit `468bf0e600de10682b28c9952905cdb062193315`,49arquivos. Branch documental local `docs/marcos-8-entrega-final`, criada desse commit e posteriormente sincronizada por fast-forward com a develop4525512, após merge efetivo do #45.

Marcos pediu considerar concluído o tópico1, informando que Silva aprovará em seguida. Registrada a liberação para avançar. Na consulta inicial, a API de reviews retornou lista vazia e o PR estava aberto/não mesclado; o único comentário era do bot Sonar, sem apontamento humano de correção. Essa inspeção foi preservada no JSON original.

## Confirmação posterior e sincronização

Silva (`jovemOG-Dev`) aprovou o #45 em2026-11-14T02:09:09Z; merge efetivo em2026-11-14T02:09:17Z, commit **4525512cb166f281ed1dfdc5363563690400c510**. [Recibo verificável](marcos-8/encerramento-pr45.json). Horários UTC correspondem a13/11 em São Paulo.

Após backup/hashes dos10arquivos locais, foram executados fetch e fast-forward na própria branch documental. Árvores468bf0e/4525512 idênticas;236fontes executáveis e68/58fontes dos inventários,17artefatos anteriores, cabeçalho manual e dois stashes preservados. Nenhum novo build/teste por ausência de mudança executável. Marcos autorizou commit/push/PR da consolidação8.

## CI própria do PR45

[Run43542757976](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976), jobs132286853242/132286853476, head468bf0e e checkout do merge de teste `b565df391c70a6fbcec4ad1819d69d1a39eab78a`. Esse SHA não representa integração do PR à develop.

| Prova inspecionada | Resultado |
|---|---|
| Surefire |33XMLs; **287 testes**,0falhas/erros/ignorados. |
| Failsafe/MySQL |10XMLs; **79 testes**,0falhas/erros/ignorados. |
| JaCoCo backend |1523/1645linhas (**92,58%**);495/648branches (**76,39%**). Gates80%/70% atendidos; XML e HTML presentes. |
| JMeter |Job aprovado;4JTLs,4dashboards HTML e JSON; quatro cenários APROVADO, sem erro HTTP inesperado. Totais por label/código conferem entre JTL e JSON. |
| Scanner Maven |Falhou com `Not authorized or project not found`. Conclusão global do workflow: **failure**. |
| Sonar externo |[Bot no PR45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/45#issuecomment-6869673675) informou **Quality Gate passed**,0novos problemas/0hotspots e cobertura de código novo0,0%. Resultado externo distinto do scanner Maven. |

ZIPs `quality-evidence`14092304959 e `jmeter-evidence`14092950367 baixados e comparados aos digests SHA-256 fornecidos pela API. Originais/propriedades de ambiente mantidos na pasta privada, com projeção pública em [ci-pr45.json](marcos-8/ci-pr45.json). A API informa expiração dos artefatos em12/02/2027.

Os quatro JTLs contêm65/32/20/24amostras, incluindo login/CSRF. O cenário de disputa confirma1reserva ativa; o de recursos distintos confirma1reserva por recurso. Carga pequena/isolada, sem SLA. Percentuais JaCoCo são do backend dessa CI e não representam JavaScript ou WCAG.

Não há resultado de “todos os checks verdes”: o comentário do Sonar não elimina a falha de autorização do scanner. A API de statuses clássicos retornou vazia; isso também não é aprovação presumida de checks. Causa específica de autorização/projeto permanece para administração da integração, sem alteração de workflow/token para contornar o erro.

## Preservação e verificações locais

Preparação registrou236arquivos de backend/testes/configuração e suas somas SHA-256; esses arquivos permanecem iguais. Também conferidos68hashes do inventário real e58do manifesto frontend, sem reescrever resultados/tentativas/artefatos da etapa7. Cabeçalho manual do plano1a5 e dois stashes anteriores preservados.

Como a execução foi de inspeção/documentação, não se repetiram lint/typecheck/testes frontend, Maven ou carga. Os resultados100/350 e as sete suítes reais anteriores mantêm suas origens na [etapa7](marcos-7-resultados.md); esta rodada acrescenta a inspeção da CI45.

## Situação dos tópicos da etapa8

| Tópico | Situação |
|---|---|
| 1. Revisão da equipe |CONCLUÍDA: aprovação real de Silva confirmada, com data/autor no recibo. |
| 2. Apontamentos |Conferência atual concluída: nenhum apontamento humano publicado e0novos problemas informados pelo bot; sem correção funcional demonstrada a executar. Novos comentários terão análise própria. |
| 3. CI |Conferência concluída e registrada, com testes/cobertura/carga aprovados, gate externo OK e scanner Maven falho separados. |
| 4. Integração |CONCLUÍDA: merge4525512 confirmado e branch local sincronizada por fast-forward, sem mudança executável. |
| 5. Consolidação |Dossiê, plano, RTM/índice e referências de qualidade atualizados após integração; commit/push/PR autorizados. Revisão/integração da consolidação documental conservam ciclo próprio. |

A aprovação/merge do #45 foram realizados pela equipe e verificados posteriormente, seguidos de sincronização local. A consolidação8 tem publicação autorizada; não inclui nova mensagem para a equipe ou merge remoto executado pelo assistente. Encerramento do escopo integrado de Marcos não substitui aceite coletivo/ATAM, implantação de produção ou confirmação do ciclo TDD de outro autor.
