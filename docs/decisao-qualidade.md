# Decisão de qualidade — Prompt 3

**Projeto:** Organização de Recursos — Senac ADS 2026.2  
**Inspeção inicial:** 13/11/2026; **atualização:** 14/11/2026 (America/Sao_Paulo)  
**Base analisada:** [`main` `548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/tree/548f8b0b95980a3e292f271b9676105473822ead)  
**Estado de aprovação:** **avaliação técnica provisória, não assinada pela equipe**.

**Atualização verificada — 14/11/2026:** o [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50) foi integrado. A tag/release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) **existe e aponta para o commit `5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf`**; é uma tag *lightweight* (não anotada). A [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142), executada nesse mesmo SHA, aprovou os passos Maven/Testcontainers/JaCoCo e o job JMeter, com artefatos [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614) e [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151). O workflow global terminou com **failure** exclusivamente porque a análise Maven SonarCloud retornou `Not authorized or project not found`. A autorização do SonarCloud e o aceite coletivo seguem pendentes; clone limpo independente ainda não foi comprovado.

## Decisão: **NÃO ATESTAR O ACEITE FINAL do release candidate já publicado**

Não é uma rejeição de todas as funcionalidades implementadas. A release já foi publicada, mas seu **aceite de qualidade permanece bloqueado**: falta CI global verde (SonarCloud), reprodução independente e aceite formal do grupo. Os artefatos de Maven/JaCoCo e JMeter já existem no SHA marcado, porém o Quality Gate SonarCloud não foi aprovado. A tag é *lightweight*, não anotada; isso também exige avaliação frente ao requisito da aula.

## Critérios e evidências

| Critério | Evidência consultada | Juízo |
|---|---|---|
| Funcionalidades e contratos integrados | `README.md`, `docs/RTM.md`, [merge #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47) | Código integrado na main, mas requer reprodução independente |
| Testes backend e MySQL | [CI 43546313469 (develop)](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43546313469), [CI PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976) | Maven/Testcontainers aprovados nos SHAs dessas execuções; não no SHA da main/tag |
| Cobertura | `backend/pom.xml`, `docs/testes/marcos-8-resultados.md` | Limites 80%/70% atendidos no PR #45: JaCoCo 92,58% linhas, 76,39% branches; não extrapolar |
| Robustez e carga | `docs/qualidade/jmeter/`, [run PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976) | Quatro cenários aprovados em ambiente isolado; sem SLA de produção |
| Segurança | `docs/qualidade/seguranca.md`, `docs/seguranca/q9-autorizacao-reservas.md` e testes citados na RTM | Evidências de autenticação, CSRF, Q9 e privilégios; não é auditoria de produção |
| SonarCloud | `docs/qualidade/sonarcloud.md` e run do PR #45 | Bot comunicou gate aprovado no PR; scanner Maven com `Not authorized or project not found`; resultado global da CI: falha |
| Release na main | [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142), [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50) | Main executada no SHA da tag; Maven/JaCoCo e JMeter aprovados, scanner SonarCloud falhou; CI global vermelha |
| Reprodução do professor | [Checklist](entrega/checklist.md) | Clone não concluído por DNS; `./mvnw` ausente; Docker/Maven indisponíveis no executor |
| Aceite do grupo | [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47), seção de responsabilidades abaixo | Review do merge **não é** assinatura da decisão de qualidade; assinaturas individuais pendentes |

## Riscos / bloqueadores, impactos e responsáveis propostos

| ID | Risco e impacto | Mitigação exigida | Responsável proposto (a confirmar pelo grupo) | Aceito? |
|---|---|---|---|---|
| R01 | RC sem CI global verde na main: validação SonarCloud incompleta | Gatilho da main corrigido no PR #50; obter nova execução success no SHA de release após corrigir a autorização SonarCloud | **Débora** — coordenação de CI/qualidade | **Não** |
| R02 | Sonar scanner falha: análise obrigatória do workflow não é validada | Revisar chave/organização/token/permissões ou tratar formalmente o procedimento permitido pelo professor, sem falsificar verde | **Responsável pela organização/SonarCloud**, em alinhamento com Débora | **Não** |
| R03 | Clone limpo não reproduzível: avaliador não consegue iniciar ou verificar aplicação | Testar de máquina limpa; providenciar wrapper ou aprovação explícita do comando substituto | **Gabriel Fausto** — ambiente/persistência; **Débora** — verificação Maven/CI | **Não** |
| R04 | Tag publicada como lightweight, Quality Gate pendente: aceite sem cadeia completa | Confirmar SHA da tag (já verificado), indexar artefatos existentes no SHA e resolver pendência de tag anotada sem mover a publicada | **Débora** — pacote de evidências, com revisão dos quatro | **Não** |
| R05 | Diagramas/plano global incompletos: entrega documental pode ser recusada | Completar contexto/componentes, plano de teste, contratos e README | **Gabriel Silva** — domínio/contratos; **Marcos** — frontend/E2E; **Gabriel Fausto** — arquitetura; **Débora** — rastreabilidade | **Não** |
| R06 | Ausência de declaração de cada integrante e formulário | Coletar assinaturas e enviar uma única resposta no Hub | **Os quatro integrantes**; **remetente a designar** | **Não** |

Os responsáveis acima são **propostas de atribuição baseadas na divisão pública do README**, não compromissos aceitos nem assinaturas.

## Contribuição de cada integrante — registro do repositório, confirmação pessoal pendente

| Integrante | Foco registrado no README | Declaração e aceite individual |
|---|---|---|
| **Gabriel Silva Gomes** (`jovemOG-Dev`) | Reservas, regras de domínio, contratos e integrações | **PENDENTE de confirmação pelo próprio integrante** |
| **Gabriel Rodrigues Fausto** (`gabriel-fausto`) | Recursos, modelo de dados, persistência, locks e migrações | **PENDENTE de confirmação pelo próprio integrante** |
| **Marcos Boé** (`marcosboe`) | Frontend, UX, testes de navegador e evidências E2E | **PENDENTE de confirmação pelo próprio integrante** |
| **Débora dos Santos** (`debbySantos`) | RF01, RF10/RF11, segurança, CI, RTM, qualidade e documentação | **PENDENTE de confirmação pela própria integrante** |

**Assinaturas:** nenhuma coletada neste documento. A equipe deve registrar decisão explícita após correções, especificar riscos **realmente aceitos**, impacto, justificativa e responsável, e confirmar as contribuições pessoalmente. Revisão ou merge técnico não implica aceite da qualidade final.

## Texto para entrega no Hub — **não enviar enquanto bloqueado**

```text
Projeto: Organização de Recursos (Senac ADS)
Repositório público: https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos
Tag publicada: v1.0.0-rc1 (lightweight) no commit 5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf; Quality Gate pendente
Situação: RELEASE PUBLICADA, ACEITE FINAL PENDENTE até CI verde na main,
reprodução do README e aprovação coletiva do pacote de evidências.
```

A tag já foi verificada. Após a validação final, anexar a URL de CI verde, formalizar as assinaturas e enviar o formulário uma única vez por integrante designado. **Não foi realizado envio no Hub.**
