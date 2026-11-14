# Decisão de qualidade — Prompt 3

**Projeto:** Organização de Recursos — Senac ADS 2026.2  
**Data:** 13/11/2026 (America/Sao_Paulo)  
**Base analisada:** [`main` `548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/tree/548f8b0b95980a3e292f271b9676105473822ead)  
**Estado de aprovação:** **avaliação técnica provisória, não assinada pela equipe**.

## Decisão: **BLOQUEAR o release candidate `v1.0.0-rc1` neste momento**

Não é uma rejeição de todas as funcionalidades implementadas. A execução do release está bloqueada porque faltam **CI verde na main**, **reprodução em clone limpo**, **evidências associadas à tag** e **aceite formal do grupo**. O estado atual não autoriza declarar produção, release homologado, ou uma tag aprovada.

## Critérios e evidências

| Critério | Evidência consultada | Juízo |
|---|---|---|
| Funcionalidades e contratos integrados | `README.md`, `docs/RTM.md`, [merge #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47) | Código integrado na main, mas requer reprodução independente |
| Testes backend e MySQL | [CI 43546313469 (develop)](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43546313469), [CI PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976) | Maven/Testcontainers aprovados nos SHAs dessas execuções; não no SHA da main/tag |
| Cobertura | `backend/pom.xml`, `docs/testes/marcos-8-resultados.md` | Limites 80%/70% atendidos no PR #45: JaCoCo 92,58% linhas, 76,39% branches; não extrapolar |
| Robustez e carga | `docs/qualidade/jmeter/`, [run PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976) | Quatro cenários aprovados em ambiente isolado; sem SLA de produção |
| Segurança | `docs/qualidade/seguranca.md`, `docs/seguranca/q9-autorizacao-reservas.md` e testes citados na RTM | Evidências de autenticação, CSRF, Q9 e privilégios; não é auditoria de produção |
| SonarCloud | `docs/qualidade/sonarcloud.md` e run do PR #45 | Bot comunicou gate aprovado no PR; scanner Maven com `Not authorized or project not found`; resultado global da CI: falha |
| Release na main | [Actions](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions), `.github/workflows/ci.yml` | Nenhum run de `main` localizado; workflow não a inclui no gatilho |
| Reprodução do professor | [Checklist](entrega/checklist.md) | Clone não concluído por DNS; `./mvnw` ausente; Docker/Maven indisponíveis no executor |
| Aceite do grupo | [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47), seção de responsabilidades abaixo | Review do merge **não é** assinatura da decisão de qualidade; assinaturas individuais pendentes |

## Riscos / bloqueadores, impactos e responsáveis propostos

| ID | Risco e impacto | Mitigação exigida | Responsável proposto (a confirmar pelo grupo) | Aceito? |
|---|---|---|---|---|
| R01 | RC sem CI verde na main: regressões podem passar despercebidas na versão entregue | Habilitar workflow em main, revisar e exigir execução success no SHA final | **Débora** — coordenação de CI/qualidade | **Não** |
| R02 | Sonar scanner falha: análise obrigatória do workflow não é validada | Revisar chave/organização/token/permissões ou tratar formalmente o procedimento permitido pelo professor, sem falsificar verde | **Responsável pela organização/SonarCloud**, em alinhamento com Débora | **Não** |
| R03 | Clone limpo não reproduzível: avaliador não consegue iniciar ou verificar aplicação | Testar de máquina limpa; providenciar wrapper ou aprovação explícita do comando substituto | **Gabriel Fausto** — ambiente/persistência; **Débora** — verificação Maven/CI | **Não** |
| R04 | Evidências do SHA errado e tag ausente: aceite sem rastreabilidade | Gerar CI no SHA da main e indexar artefatos no commit tagueado; criar tag anotada só depois | **Débora** — pacote de evidências, com revisão dos quatro | **Não** |
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
Tag avaliada: PENDENTE — v1.0.0-rc1 ainda não criada/validada
Situação: BLOQUEADO para entrega final até CI verde na main,
reprodução do README e aprovação coletiva do pacote de evidências.
```

Após liberação, substituir PENDENTE pela URL **verificada** da tag e enviar o formulário uma única vez por integrante designado. **Não foi realizado envio no Hub.**
