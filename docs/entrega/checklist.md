# Checklist da entrega final — Prompt 1

**Projeto:** Organização de Recursos — Senac ADS / Qualidade de Software, 2026.2  
**Inspeção original:** 13/11/2026; **atualização:** 14/11/2026 (America/Sao_Paulo)  
**Fonte:** https://afonsolelis.github.io/aulas_senac/pages/qualidade2/material/material_entrega-projeto-final.html  
**Versão remota examinada:** [`548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/tree/548f8b0b95980a3e292f271b9676105473822ead) na `main`, após o merge do [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).

> Este documento distingue **arquivo existente**, **atualização para a entrega** e **execução efetivamente reproduzida**. A presença de código ou evidência de outro SHA não equivale à aprovação da entrega.

**Atualização verificada — 14/11/2026:** o [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50) foi integrado. A tag/release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) **existe e aponta para o commit `5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf`**; é uma tag *lightweight* (não anotada). A [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142), executada nesse mesmo SHA, aprovou os passos Maven/Testcontainers/JaCoCo e o job JMeter, com artefatos [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614) e [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151). O workflow global terminou com **failure** exclusivamente porque a análise Maven SonarCloud retornou `Not authorized or project not found`. A autorização do SonarCloud e o aceite coletivo seguem pendentes; clone limpo independente ainda não foi comprovado.

## Clone limpo e reprodução solicitada

O professor solicita clonar do zero, seguir apenas o README, iniciar o sistema e executar `./mvnw -B verify`. A tentativa foi realizada em ambiente temporário sem checkout prévio, mas parou **antes do clone**:

```console
$ git ls-remote https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos.git refs/heads/main
fatal: unable to access 'https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos.git/':
Could not resolve host: github.com
```

Neste executor, `git` está disponível, mas `mvn` e `docker` não estão instalados. A árvore remota da `main` **não contém `mvnw`, `mvnw.cmd` nem `.mvn/wrapper`**. O README orienta `mvn -f backend/pom.xml clean verify`, não `./mvnw -B verify`. Portanto, a reprodução a partir de clone limpo, execução da aplicação e a suíte exigida pelo professor permanecem **não realizadas** nesta inspeção; não foram simuladas saídas de teste.

## Inventário — item → existe → atualizado → caminho

| Item exigido | Existe? | Atualizado para a main / RC? | Caminho / observação |
|---|---|---|---|
| Repositório público e revisão por pares | Sim | Integração sim; aceite final pendente | [Repositório](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos); [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47) aprovado por `jovemOG-Dev` e mesclado na `main` |
| Aplicação reproduzível | Código e Compose presentes | **Não verificado por clone limpo** | `backend/`, `backend/pom.xml`, `compose.yml`, `README.md`; execução bloqueada pelo ambiente |
| README de instalação | Sim | **Parcial** | `README.md`; contém instruções Maven/Docker e referência antiga à `develop` |
| Documentação da API | Sim | Revisão final pendente | `docs/api/`, em especial `reservas-contrato.md`, `item18.md` e `frontend-integracao.md` |
| `docs/rtm.md` | Equivalente, com capitalização distinta | Caminho canônico acrescentado neste PR | `docs/RTM.md`; no Linux `RTM.md` não é `rtm.md`. Índice em `docs/rtm.md` |
| Diagramas de contexto, componentes e sequências | **Parcial** | **Incompleto** | `docs/arquitetura/sequencia-reserva.md` (sequências), `docs/arquitetura/adr/` (decisões); não localizados arquivos dedicados para contexto e componentes |
| Plano e relatório de testes | Evidências e guias parciais | Plano global/aceite a verificar | `docs/qualidade/relatorio-evidencias.md`, `docs/testes/`, `docs/qualidade/seguranca.md`, `docs/qualidade/jmeter/README.md` |
| Pipeline de CI | Sim | **Executa na main** | [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50) corrigiu gatilho; [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142) executou no SHA da tag |
| SonarCloud | Configurado | **Falha de autorização na main** | [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142): `Not authorized or project not found`; Quality Gate não aprovado |
| JaCoCo | Sim | **Step Maven/JaCoCo aprovado no SHA da tag** | [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614) (sem atribuir ao SHA atual percentuais medidos em PR antigo); histórico PR #45: 92,58% linhas / 76,39% branches |
| Plano de carga | Sim | Base histórica | `docs/qualidade/jmeter/01-consultas.jmx` a `04-manutencao-vs-reserva.jmx` |
| Resultado da carga | Sim | **Job JMeter aprovado no SHA da tag** | [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151), [resultados históricos](../performance/resultado-01.md) |
| Defeitos | Dispersos | Índice novo, sem reclassificar indevidamente | `docs/qualidade/defeitos-frontend.md`, `docs/qualidade/relatorio-evidencias.md`, `docs/defeitos/README.md` |
| Relatório final de qualidade | **Parcial** | **Não assinado/aceito** | `docs/qualidade/relatorio-evidencias.md` (preliminar); `docs/relatorio-qualidade.md` (síntese deste PR) |
| Tag `v1.0.0-rc1` | **Publicada** | **Tipo: lightweight (não anotada); Quality Gate pendente** | [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) aponta para o commit [`5e9b9ea`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf) |
| Envio pelo Hub | Não verificável por repositório | **Pendente** | A equipe deve registrar um único envio; o assistente não enviou formulário |

## Bloqueadores priorizados

| ID | Prioridade | Bloqueador e providência |
|---|---|---|
| B01 | Crítica | **CI global verde na main:** gatilho corrigido no PR #50; Maven/JaCoCo e JMeter aprovados no SHA da tag, mas SonarCloud falhou por autorização. Corrigir e reexecutar sem ocultar o erro |
| B02 | Crítica | **Reprodução externa:** testar em clone limpo com Docker/JDK/Maven; fornecer Maven Wrapper ou obter aceitação explícita do professor para comando alternativo |
| B03 | Alta | **Tipo da tag e aceite:** `v1.0.0-rc1` existe no SHA correto, mas é *lightweight*; registrar a divergência frente à tag anotada solicitada, sem movê-la |
| B04 | Alta | **Evidências do RC:** anexar link da CI, artefatos JaCoCo/JMeter e Sonar da mesma revisão/tag; índices atuais distinguem provas históricas |
| B05 | Média | **Documentação:** completar diagramas de contexto/componentes, plano global de testes e revisar o README para a `main` |
| B06 | Alta | **Aceite e envio:** colher declarações individuais e assinatura/decisão coletiva; um integrante preenche o formulário do Hub |

**Resultado do Prompt 1:** inventário e bloqueadores documentados. O teste independente em clone limpo não foi executado. Posteriormente, o PR #50 corrigiu o gatilho da CI na `main`; a falha SonarCloud e o aceite final permanecem pendentes.
