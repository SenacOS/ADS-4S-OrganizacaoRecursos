# Marcos-7 — conferência do checklist de evidências

**Data:** 13/11/2026, America/Sao_Paulo. **Tipo:** correção de compatibilidade Q5 e regressão integrada. **Conferência:** Codex, revisão assistida do mesmo executor; não é revisão independente da equipe.

Marcos pediu validar a [seção5 do relatório preliminar](../../../qualidade/relatorio-evidencias.md#5-checklist-para-fechar-evidências-sem-falsificar-resultados), encaminhada por Silva, antes do envio. O conteúdo remoto foi conferido com o arquivo local em develop `7d5480b394e134dacd8c139a3dcd5c97670ee5da`, blob `00f9fc9038e836d79ce9f8b5757c037c6f37b377`.

**Resultado:** evidências obrigatórias da correção Q5 presentes; checklist global ainda incompleto. Dos oito itens, cinco têm atendimento demonstrado no recorte conferido, dois permanecem parciais e um aberto. O relatório de10/11 e seus checkboxes foram preservados como histórico; esta conferência não atribui novos resultados àquela data.

**Autorização posterior:** após receber esta conferência, Marcos solicitou expressamente commit, push e PR da etapa7 em13/11/2026. A publicação autorizada não converte os itens globais pendentes em aprovados nem altera os resultados das execuções inspecionadas.

## Conferência dos oito itens

| Item do checklist | Estado atual | Evidência conferida e limite |
|---|---|---|
| 1. Java21, Docker, Maven verify e carga | **Atendido na CI conferida** | [CI do PR #44, run43538288222](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43538288222): Java21/Testcontainers, `clean verify`, **287 unitários/API e79MySQL**, zero falhas/erros/ignorados. JaCoCo e job JMeter aprovados. Essa execução não inclui o frontend local novo da etapa7. |
| 2. Relatórios de testes e cobertura arquivados | **Atendido** | Artefato `quality-evidence`, ID14090962620, baixado e SHA-256 comparado ao digest da API. Foram lidos **43XMLs de testes** (33Surefire,10Failsafe), `site/jacoco/jacoco.xml` e presença do HTML. [Índices, totais e hashes](../../../testes/marcos-7/checklist-evidencias-ci44.json). Não se trata apenas da existência de um passo de upload. |
| 3. SonarCloud e URL do Quality Gate | **Aberto** | O scanner do #44 executou e falhou com `Not authorized or project not found`. Não foi comprovado Quality Gate aprovado nem URL de análise bem-sucedida. O erro não demonstra sozinho token ausente, projeto inexistente ou restrição de plano. Administração da integração deve conferir acesso/chaves/permissões e apresentar uma execução e gate próprios; nenhuma configuração foi alterada para ignorar o erro. |
| 4. Quatro cenários JMeter e artefatos | **Atendido na execução conferida** | Artefato `jmeter-evidence`, ID14090183668, baixado e SHA-256 conferido. Contém4JTLs,4dashboards HTML e `resultado.json`; os quatro cenários registram `APROVADO`, sem erros HTTP inesperados. Disputa registra1reserva ativa e recursos distintos registram1reserva por recurso. Métricas e limites abaixo. |
| 5. RF01–RF14 e lacunas na RTM | **Atendido no recorte documentado** | [RTM vigente](../../../RTM.md) do #44 preservada e complementada pela [matriz RF/CT/camada](../../../testes/marcos-7-matriz-evidencias.md). Fontes/versões, provas locais, CI, aceite, operação e limites estão separados. Rastreabilidade não significa certificação global dos RFs. |
| 6. Consultas, ownership e contratos | **Atendido no recorte integrado** | GETs/Q9 dos #26/#27 integrados; [contrato de consulta](../../../api/reservas-consulta-contrato.md), [autorização Q9](../../../seguranca/q9-autorizacao-reservas.md) e [ADR-007](../../../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md). Etapa7 tem Q9:12/0 e consulta:8/0 reais, além de negativas Q5/RF12 e integrações MySQL compartilhadas. Contratos adotados por delegação de Marcos; não são assinaturas individuais presumidas. O DEF-07 aberto no relatório de10/11 foi superado para esse escopo. |
| 7. E2E e ciclo TDD com os autores | **Parcial no fechamento global** | Sete suítes reais da etapa7 e [aceite de Marcos](../../../testes/marcos-7-verificacao.md#aceite-do-autor--13112026) comprovados. Q5 tem RED1PASS/2FAIL, GREEN3/3 e regressão100/350; log RED privado conferido por hash, sem fase REFACTOR separada registrada. O [relato TDD RF07](../../../testes/rf07-fila-tdd.md) tem três commits no histórico e20testes dessas classes aprovados pelo JUnit atual, mas descreve fases históricas com executor mínimo/stubs. Não reexecutamos o passado nem substituímos a confirmação final do respectivo autor/equipe. |
| 8. Integrações, revisão externa e CI verde | **Parcial** | #8/#9/#10/#11/#12 estão mesclados, conforme metadados remotos e [registro estruturado](../../../testes/marcos-7/checklist-evidencias-ci44.json). O #44 também está integrado. A CI conferida termina `failure` no Sonar e o incremento frontend7 ainda não tem publicação, revisão da equipe ou CI próprias. Aceite do autor não é revisão independente nem CI totalmente verde. |

## Leitura dos artefatos de CI

[Registro estruturado da inspeção](../../../testes/marcos-7/checklist-evidencias-ci44.json): ZIPs originais permanecem privados, sem incorporar relatórios com propriedades de ambiente ao Git. Links estáveis dos artefatos, IDs e hashes permitem conferir a origem; a API informa expiração em12/02/2027. URLs temporárias de download e credenciais não integram a evidência pública.

| Medida JaCoCo do backend no PR #44 | Cobertos / total | Percentual |
|---|---|---|
| Linhas | 1523/1645 | **92,58%** |
| Branches | 495/648 | **76,39%** |

Os valores superam os gates80%/70% e correspondem ao XML do run43538288222. Não são cobertura do JavaScript nem da árvore local completa da etapa7; não substituem SonarCloud. Os percentuais antigos do relatório preliminar permanecem vinculados às suas próprias versões.

| Cenário JMeter do #44 | Respostas do endpoint principal | p95 observado |
|---|---|---|
| Consulta | 50×200 | 4ms |
| Disputa por reserva | 1×201,7×409;1reserva ativa | 91ms |
| Recursos distintos | 5×201;1reserva em cada recurso | 26ms |
| Manutenção concorrente | Reserva1×201,4×409; manutenção1×409 | 25ms reserva;21ms manutenção |

Carga pequena em runner compartilhado e banco isolado, sem SLA de produção. Esses números vieram do `resultado.json` arquivado; não foram produzidos por nova carga nesta conferência nem somados a rodadas de10/11.

As contagens HTTP do JSON foram comparadas com os quatro CSVs JTL originais, incluindo requisições de preparação:65,32,20e24amostras, respectivamente. Totais por label e código HTTP coincidem. Essa leitura não recalcula os percentis nem executa novamente o teste de carga.

## Evidências obrigatórias da correção Q5

| Evidência | Estado | Referência |
|---|---|---|
| Erro original documentado (crítica) | Presente | [FE-007](../../../qualidade/defeitos-frontend.md), [RED original](../../../testes/marcos-7/q5-red-resumo.json), log privado com hash conferido. |
| Causa identificada (alta) | Presente | Backend #43 exige motivo administrativo; cliente/tela anteriores não o ofereciam/enviavam. [Contrato](../../../api/reservas-contrato.md). |
| Comparação antes/depois (alta) | Presente | Diff local do transporte/cliente/tela contra7d5480b: campo condicional,500caracteres, envio explícito e dono sem corpo. [Story](../../marcos-7.md) e [resultados](../../../testes/marcos-7-resultados.md). |
| Regressão que detecta o defeito (crítica) | Presente |3testes focais novos, casos de navegador em dois viewports e8cenários Q5 reais, incluindo negativas e persistência. [Prova real](../../../testes/marcos-7/cancelamento-resultados.json), build100/350 e [manifesto58fontes](../../../testes/marcos-7/regressao-frontend.json). |

Críticas:2/2presentes. Altas:2/2presentes. Nenhuma ausência obrigatória demonstrada para a correção de Marcos; isso não fecha automaticamente os itens globais3,7,8.

## Preservação e encaminhamento

Conferidos novamente68hashes de fontes reais,58do manifesto frontend,17artefatos publicados e10logs privados, além do log RED. Resultados/capturas originais, tentativas, datas e o manifesto do build permanecem intactos. Nenhum código de produto/teste ou dependência foi alterado; não se repetiram lint/typecheck/testes nem Maven/JMeter para esta inspeção documental.

Na preparação do commit, `git diff --cached --check` identificou uma linha vazia extra ao final de `ci-equipe.json`. Foi removida somente essa linha, com equivalência integral dos dados JSON conferida; original privado preservado e digests anterior/novo registrados em `normalizacaoPublicacao` no [inventário](../../../testes/marcos-7/inventario.json). Não mudou nenhum resultado, fonte executável, log ou manifesto do build.

Para o envio do incremento7, relacionar essa documentação e declarar os limites do Sonar, TDD e revisão/CI. Para fechar o checklist global, obter o gate Sonar verificável, a confirmação do respectivo autor do ciclo TDD e os registros efetivos de revisão/CI/entrega; a decisão coletiva de aceite/ATAM permanece própria. O pedido de conferência não autorizou publicação ou mensagens para a equipe.
