# Documentacao do Projeto

**Estado: PROPOSTO**

Os documentos do projeto academico devem ficar sob `docs/`. Esta organizacao e uma proposta de trabalho, nao uma decisao arquitetural aprovada. O material do framework AIOX permanece em `.aiox-core/` e nao deve ser confundido com os entregaveis do projeto.

## Organizacao proposta

| Pasta ou arquivo | Conteudo previsto | Estado |
|---|---|---|
| `contexto-inicial-agentes.md` | Escopo, restricoes, ambiguidades e contexto inicial fornecidos pela equipe | Referencia atual; conferir com a equipe antes de substituir |
| `dominio/` | Glossario, regras de negocio, ciclo de vida e decisoes de dominio | PROPOSTO |
| `personas/` | Descricao das personas e jornadas, distinta dos perfis de autorizacao | PENDENTE de descoberta |
| `requisitos/` | Requisitos funcionais e nao funcionais refinados, criterios de aceitacao e RTM | PENDENTE de refinamento |
| `arquitetura/` | Diagramas e decisoes arquiteturais aprovadas, incluindo ADRs quando pertinentes | PENDENTE de aprovacao das decisoes |
| `qualidade/` | Plano e evidencias de testes, defeitos e relatorio de qualidade | PENDENTE de planejamento e execucao |
| `entrega/` | Instrucoes e artefatos finais de apresentacao e demonstracao | PENDENTE |

Criar subpastas quando houver um artefato real a registrar; nao criar documentos ou diretorios vazios apenas para antecipar estrutura. Requisitos, personas, arquitetura e plano de qualidade devem permanecer identificados pelos seus estados (`PROPOSTO`, `EM ANALISE`, `APROVADO`, `IMPLEMENTADO`, `VALIDADO` ou `PENDENTE`).

## Estado observado

**Estado: EM ANALISE**

Na inspecao de 2026-10-20, `docs/contexto-inicial-agentes.md` era o unico documento do projeto em `docs/`. O repositorio nao continha codigo de aplicacao nem artefatos de dominio, personas ou requisitos refinados. O scaffold e as configuracoes AIOX presentes no workspace nao comprovam que a aplicacao foi implementada ou que suas escolhas estejam aprovadas.

Ha um desalinhamento a resolver antes de qualquer implementacao: o contexto do projeto fixa Java 21 e Spring Boot 3.x, enquanto `.aiox-core/data/technical-preferences.md` e `.aiox-core/core-config.yaml` indicam o preset `nextjs-react`. Isso e registrado como pendencia de configuracao, nao como autorizacao para alterar a plataforma obrigatoria.

## Primeiro artefato

- [Proposta de dominio e ciclo de vida das reservas](dominio/proposta-dominio-reservas.md) — **PROPOSTO**; depende de validacao da equipe e esclarecimento de ambiguidades.