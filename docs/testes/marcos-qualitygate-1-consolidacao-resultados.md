# Quality Gate — consolidação após os merges

**13/11/2026.** Os PRs#28/#29 já constam como mesclados; develop atualizada em **a0c04814211ed12f1c7086dc454560cb8cb56fc9**, incluindo os PRs#30/#31. Conforme autorização de Marcos, as correções locais foram consolidadas em **fix/marcos-qualitygate**, para um único PR novo contra develop. [Story](../stories/marcos-qualitygate-1.md) e [encaminhamento atual](../integracao/marcos-qualitygate-equipe-2026-11-13.md).

## Preservação e escopo

Antes da troca de base foram copiados37arquivos da árvore principal e18da worktree#28, com hashes, diffs e identificação das bases5537163/0775715, além do JAR anterior. As cópias privadas continuam em `.aiox-core/local/backups/qualitygate-consolidacao-2026-11-13T13-26-02-956Z/`. Todos37arquivos principais permaneceram idênticos imediatamente após criar a nova branch. Os seis arquivos Java/segurança/testes vindos da equipe não se sobrepunham aos ajustes locais; nenhum arquivo da equipe foi substituído por uma versão antiga.

A worktree antiga do#28 continua preservada como origem histórica, sem nova publicação dessa branch. Os fixes comuns/exclusivos agora formam uma única entrega; as instruções e provas anteriores de dois recortes continuam no [relatório anterior](marcos-qualitygate-1-resultados.md), identificadas pelas bases reais.

Código de produto, backend Java/testes, dependências e workflow neste PR corretivo permanecem iguais à develop a0c0481. Alterações são auxiliares, testes de desenvolvimento, representação de evidências e documentação. Os três JSONs antigos continuam equivalentes aos originais5537163; os hashes dos helpers e do JAR antigos não foram trocados para fingir correspondência com a implementação nova.

## Novo JAR e revalidação

Os processos próprios foram parados pelo controle com conferência de identidade; JAR reconstruído com Java21/Maven portátil e reiniciado em loopback18080/MySQL13307. Comando `package` usou **-Dmaven.test.skip=true -DskipITs**: não é clean verify nem nova execução de Testcontainers. [Extrato do empacotamento](marcos-qualitygate-1/consolidacao/empacotamento.txt), BUILD SUCCESS em8.057s.

O JAR anterior tem SHA256 **6d84690abcf10e7c1b811875b8a8d726b9857afca670bccfee222dd62923fe20**; o novo tem **e1e620cbce823b926ec348fe4447edfdc352060b33c7dccf243cf5020c29d2e7**. [Manifesto da árvore atual](marcos-qualitygate-1/consolidacao/arvore-testada.json) identifica a base a0c0481, arquivos e JAR efetivamente usados. Fontes estáticas servidas continuam correspondentes; regressão frontend81/278 anterior preservada por hashes, sem alteração de produto/testes frontend.

| Verificação na base nova | Resultado / evidência |
|---|---|
| Unitários de configuração/executor/INI/viewport/integridade |14PASS/0FAIL — [log](marcos-qualitygate-1/consolidacao/unitarios.txt) |
| Smoke real |16PASS/0FAIL/0BLOQUEADO — [JSON](marcos-qualitygate-1/consolidacao/smoke-real.json), [saída](marcos-qualitygate-1/consolidacao/smoke.txt) |
| Q9/fila + Q1/Q3 |12PASS/0FAIL — [JSON](marcos-qualitygate-1/consolidacao/q9-real.json), [saída](marcos-qualitygate-1/consolidacao/q9.txt) |
| Consulta/edição/cancelamento |8PASS/0FAIL — [JSON](marcos-qualitygate-1/consolidacao/consulta-real.json), [saída](marcos-qualitygate-1/consolidacao/consulta.txt) |
| Fechamento com inatividade/atraso |11PASS/0FAIL — [JSON](marcos-qualitygate-1/consolidacao/fechamento-real.json), [saída](marcos-qualitygate-1/consolidacao/fechamento.txt) |

Execuções em UTC: smoke13:29:16, Q9 13:29:24, consulta13:29:29 e fechamento13:29:36. O horário/detalhes de cada caso constam dos JSONs; datas de teste vêm do relógio real, sem manipulação de timestamp ou SQL de estado. Sintaxe dos auxiliares novos/alterados aprovada.

Os dez casos Q9 anteriores foram mantidos. Dois casos novos comprovam os merges da equipe:

- **Q3:** Responsável com vínculo completo cria reserva restrita própria; sua aprovação retorna403/OPERACAO_NAO_PERMITIDA e GET/SQL mantêm SOLICITADA. Cancelamento explícito da massa ocorre somente depois dessa prova.
- **Q1:** Administrador tenta início em APROVADA, conclusão em EM_USO e ausência em APROVADA:403, preservando o estado. Responsável vinculado realiza as três operações:200, com estados EM_USO/CONCLUIDA/NAO_COMPARECEU e persistência final conferidos.

Preparação usa HTTP autorizado e vínculos exclusivos já conferidos do próprio cenário; não afrouxa perfis ou regras. A prova nova é HTTP+SQL para Q1/Q3; não afirma novas telas para essas operações nem exercício de todas as combinações de papéis. Demais cenários continuam usando Chrome/Spring/MySQL reais, sem interceptação. Temporária18081 encerrada, principal preservada.

## Publicação e dependências

Marcos autorizou expressamente o plano de commit/push e abertura de um PR corretivo após validar. A revisão QA anterior descreve a base5537163; o complemento independente de QA da consolidação será registrado na story, sem transformar a aprovação antiga em validação da base nova. Nenhum merge, comentário adicional ou mensagem social está autorizado por esse plano.

O Quality Gate remoto continua pendente da análise do novo head. O scanner Maven anterior falhou por autorização/projeto; não foi alterado token, variable, workflow, gate ou exclusão. A equipe responsável precisa conferir `SONAR_ORGANIZATION=senacos`, `SONAR_PROJECT_KEY=SenacOS_ADS-4S-OrganizacaoRecursos` e autorização do token, sem divulgar segredo. Testes locais aprovados não representam aprovação desse scanner nem de todos os requisitos globais.

CodeRabbit local não está disponível: CLI ausente e WSL não instalado, conforme preparação DevOps. Não foi instalado/autenticado nem apresentado como zero achados. A publicação será em rascunho, para disponibilizar o corretivo e acompanhar checks/revisão; isso não aprova CodeRabbit/Sonar nem autoriza merge. QA assistido da base atual tem resultado próprio na story.
