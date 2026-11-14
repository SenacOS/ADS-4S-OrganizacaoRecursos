# Decisão de qualidade — Prompt 3 (Aula 14)

**Situação em 14/11/2026:** PR #50 integrado; CI do PR aprovada. A execução da `main` no commit `5e9b9ea` ocorreu, mas terminou com falha de autorização do SonarCloud (`Not authorized or project not found`). A release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) foi publicada; a CI verde e o Quality Gate do SHA da tag não estão comprovados. Clone limpo independente ainda não foi realizado (limitação do ambiente de verificação); o projeto usa `mvn` instalado, não `./mvnw`.


**Decisão técnica proposta: NÃO ATESTAR O ACEITE FINAL de `v1.0.0-rc1` até concluir a validação.**  
**Data da conferência original:** 13/11/2026; **atualização:** 14/11/2026 (São Paulo).  
**Snapshot de referência:** [main `548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/548f8b0b95980a3e292f271b9676105473822ead), após [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).  
**Importante:** esta é uma **avaliação técnica baseada nas evidências disponíveis**, não uma deliberação assinada em nome dos quatro integrantes. A decisão coletiva ainda deve ser formalizada.

## Critérios avaliados e provas

| Critério | Prova auditável | Status |
|---|---|---|
| Repositório público e revisão por pares | [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47) aprovado por `jovemOG-Dev` e mesclado | **Atendido para integração**, não é aceite final |
| Aplicação reproduzível por clone limpo | [Checklist](entrega/checklist.md): `git ls-remote` bloqueado por DNS; ambiente sem Maven/Docker | **Não comprovado** |
| Execução `./mvnw -B verify` | Não há Maven wrapper na árvore; README usa Maven externo | **Bloqueado** |
| Funcionalidade e rastreabilidade RF01–RF14 | [RTM canônica](RTM.md), [contratos](api/), [dossiê](entrega/marcos-entrega-final.md) | **Implementação documentada**, reteste do release pendente |
| Testes Java/MySQL | [CI PR45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976): 287 Surefire / 79 Failsafe, sem falhas, conforme [relatório](testes/marcos-8-resultados.md) | **Aprovado naquele PR**, não comprova tag |
| Cobertura | PR45: JaCoCo 92,58% linhas / 76,39% branches, acima de 80% / 70% configurados | **Aprovado naquele PR**, não comprova tag |
| Performance | [JMeter](performance/resultado-01.md): quatro cenários e invariantes específicos aprovados | **Aprovado nos testes históricos**; não é SLA |
| Frontend/integração | [Marcos-7](testes/marcos-7-resultados.md): 100 testes unitários / 350 de navegador e cenários reais separados | **Evidência local**, não execução deste SHA |
| Análise SonarCloud | [Bot PR45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/45#issuecomment-6869673675) informou Quality Gate passed, mas [scanner Maven](qualidade/sonarcloud.md) terminou com `Not authorized or project not found` | **CI integrada vermelha**; não validado na tag |
| CI verde no commit da tag | Workflow não executa na `main`; `v1.0.0-rc1` não existe | **Não atendido — bloqueador de release** |
| Documentação e decisões arquiteturais | [ADRs](arquitetura/adr/README.md), [sequências](arquitetura/sequencia-reserva.md), [índice](evidencias/README.md) | **Parcial**: contexto/componentes específicos pendentes |
| Riscos e aceite do grupo | Registro abaixo, ainda sem assinaturas individuais | **Não atendido** |

## Riscos residuais e decisão sobre aceitação

**Nenhum risco novo é declarado formalmente aceito pelo grupo nesta avaliação.** A tabela relaciona o impacto e **responsáveis sugeridos para tratar e submeter cada risco à equipe**; não é autorização individual retroativa.

| Risco | Impacto | Justificativa / situação | Responsável proposto | Aceite |
|---|---|---|---|---|
| Sem clone e wrapper reproduzíveis | Alto — professor pode não conseguir rodar | `./mvnw` ausente; teste independente bloqueado por DNS | **Gabriel Silva Gomes** (coordenação do fluxo) com **Débora dos Santos** (qualidade) | **Não aceito; corrigir e demonstrar** |
| Sem CI verde/Quality Gate íntegro na main | Alto — release sem gate auditável | Scanner Maven falha e workflow aciona na main, mas análise SonarCloud falhou por autorização; bot de PR não substitui CI verde | **Débora dos Santos** (CI) + administração SonarCloud | **Não aceito; corrigir ou obter decisão explícita do professor** |
| Grupos de teste/ambientes limitados | Médio — falhas não cobertas | Testcontainers/JMeter e E2E cobrem cenários, não a operação em produção | **Marcos Boé** (E2E/cliente) e **Gabriel Rodrigues Fausto** (persistência) | **Pendente de aceite formal com escopo** |
| Imutabilidade de auditoria depende de grants | Alto — risco de modificação SQL privilegiada | Restrição append-only operacional requer credenciais separadas; [fonte](qualidade/rf10-auditoria.md) | **Débora dos Santos** + **Gabriel Rodrigues Fausto** | **Não aceito sem comprovação operacional** |
| Notificações simuladas | Médio — não entrega mensagens externas | RF11 foi comprovada por outbox/log e testes WireMock, sem recebimento externo; [fonte](qualidade/rf11-notificacoes.md) | **Débora dos Santos** / deliberação de escopo do grupo | **Aceite de simulação descrito no ADR-007; não equivale a aceitar entrega externa** |
| Diagramas/aceite incompletos | Médio/alto — entrega documental pode ser recusada | Contexto/componentes e assinatura coletiva ainda não comprovados | **Equipe inteira**, coordenação a definir | **Pendente** |

## Participação dos integrantes e confirmação pendente

Os nomes e **focos de trabalho publicamente atribuídos** constam no [README](../README.md). A descrição abaixo é **pré-preenchimento para conferência**, não fala, depoimento ou assinatura redigida em nome de cada integrante.

| Integrante | Participação documentada, sujeita a confirmação individual | Declaração/assinatura |
|---|---|---|
| **Gabriel Silva Gomes** (GitHub `jovemOG-Dev`) | Reservas, regras de domínio, revisão e integrações | **PENDENTE de declaração pessoal** |
| **Gabriel Rodrigues Fausto** (GitHub `gabriel-fausto`) | Recursos, persistência e modelagem de dados | **PENDENTE de declaração pessoal** |
| **Marcos Boé** (GitHub `marcosboe`) | Frontend, experiência de uso e testes E2E | **PENDENTE de declaração pessoal** |
| **Débora dos Santos** (GitHub `debbySantos`) | Segurança, auditoria, CI e qualidade transversal | **PENDENTE de declaração pessoal** |

Cada integrante deve conferir sua participação, explicar em suas próprias palavras o que fez e registrar nome, data e concordância com a decisão. **Não presumir assinaturas a partir de merge, aprovação de PR ou atuação de agente.**

## Gatilhos para reavaliar o bloqueio

1. Resolver os bloqueadores do [checklist](entrega/checklist.md) e repetir a instalação e o teste em clone limpo.
2. Obter uma **execução verde da CI na main** vinculada ao SHA definido para release, incluindo os critérios de qualidade requeridos.
3. Conferir o SHA e o tipo da tag já publicada `v1.0.0-rc1`, atualizar o [índice](evidencias/README.md) e validar URLs; não mover a tag.
4. Apresentar os riscos residuais ao grupo e registrar aceite/ressalvas com responsável, impacto e justificativa; então colher as quatro declarações.
5. Um integrante envia o formulário do Hub **somente após** a conferência do pacote e da tag real.

## Texto curto para o Hub — rascunho NÃO ENVIAR ainda

> Projeto: Organização de Recursos. Repositório público: https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos. Tag publicada: [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) (CI verde do SHA pendente). Integrantes: Gabriel Silva Gomes, Gabriel Rodrigues Fausto, Marcos Boé e Débora dos Santos. Envio condicionado à CI verde no commit da tag e à aprovação coletiva do pacote.

**Conclusão:** não afirmar “pronto para produção” nem “release aprovado”. Os resultados anteriores são positivos em cenários definidos, mas a cadeia de evidência exigida para a tag final não está completa.
