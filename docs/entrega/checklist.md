# Checklist da entrega final — Prompt 1

**Projeto:** Organização de Recursos — Senac ADS / Qualidade de Software, 2026.2  
**Data da inspeção:** 13/11/2026 (America/Sao_Paulo)  
**Fonte:** https://afonsolelis.github.io/aulas_senac/pages/qualidade2/material/material_entrega-projeto-final.html  
**Versão remota examinada:** [`548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/tree/548f8b0b95980a3e292f271b9676105473822ead) na `main`, após o merge do [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).

> Este documento distingue **arquivo existente**, **atualização para a entrega** e **execução efetivamente reproduzida**. A presença de código ou evidência de outro SHA não equivale à aprovação da entrega.

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
| Pipeline de CI | Sim | **Não executa na main** | `.github/workflows/ci.yml` possui `push` em `develop` e PRs para `develop`/branches legadas, não para `main` |
| SonarCloud | Configurado/histórico | **Sem scanner verde da main** | `docs/qualidade/sonarcloud.md`: bot informou gate positivo no PR #45, mas o scanner Maven terminou com erro de autorização/projeto |
| JaCoCo | Sim | Resultado é de SHA anterior | `backend/pom.xml`, [CI PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976): 92,58% linhas / 76,39% branches |
| Plano de carga | Sim | Base histórica | `docs/qualidade/jmeter/01-consultas.jmx` a `04-manutencao-vs-reserva.jmx` |
| Resultado da carga | Sim | **Não vinculado à tag** | `docs/qualidade/jmeter/evidencias-2026-11-10.md`, `docs/performance/resultado-01.md` (índice neste PR) |
| Defeitos | Dispersos | Índice novo, sem reclassificar indevidamente | `docs/qualidade/defeitos-frontend.md`, `docs/qualidade/relatorio-evidencias.md`, `docs/defeitos/README.md` |
| Relatório final de qualidade | **Parcial** | **Não assinado/aceito** | `docs/qualidade/relatorio-evidencias.md` (preliminar); `docs/relatorio-qualidade.md` (síntese deste PR) |
| Tag `v1.0.0-rc1` | **Não encontrada** | **Bloqueada** | `refs/tags/v1.0.0-rc1` não encontrada na consulta; nenhuma CI de `main` vinculada ao commit inspecionado |
| Envio pelo Hub | Não verificável por repositório | **Pendente** | A equipe deve registrar um único envio; o assistente não enviou formulário |

## Bloqueadores priorizados

| ID | Prioridade | Bloqueador e providência |
|---|---|---|
| B01 | Crítica | **CI verde na main:** habilitar CI nesse destino, executar os checks no SHA efetivo e tratar a etapa SonarCloud que falha no scanner; não confundir aprovação de Maven com sucesso do workflow |
| B02 | Crítica | **Reprodução externa:** testar em clone limpo com Docker/JDK/Maven; fornecer Maven Wrapper ou obter aceitação explícita do professor para comando alternativo |
| B03 | Alta | **Tag verificável:** apenas depois de B01/B02 e revisão coletiva, criar tag **anotada** `v1.0.0-rc1` no exato SHA validado; nunca mover tag publicada |
| B04 | Alta | **Evidências do RC:** anexar link da CI, artefatos JaCoCo/JMeter e Sonar da mesma revisão/tag; índices atuais distinguem provas históricas |
| B05 | Média | **Documentação:** completar diagramas de contexto/componentes, plano global de testes e revisar o README para a `main` |
| B06 | Alta | **Aceite e envio:** colher declarações individuais e assinatura/decisão coletiva; um integrante preenche o formulário do Hub |

**Resultado do Prompt 1:** inventário e bloqueadores documentados. **Nenhum bloqueador foi corrigido durante a etapa de avaliação**, como exige o prompt.
