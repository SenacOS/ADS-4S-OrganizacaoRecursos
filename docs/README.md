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
| `arquitetura/adr/` | ADR-001 a ADR-006 (monólito, MySQL, concorrência, sessão, políticas, timezone) | APROVADO |
| `arquitetura/` (diagramas) | C4 contexto/componentes e sequências críticas | PENDENTE |
| `qualidade/` | Plano e evidencias de testes, defeitos e relatorio de qualidade | PENDENTE de planejamento e execucao |
| `entrega/` | Instrucoes e artefatos finais de apresentacao e demonstracao | PENDENTE |

Criar subpastas quando houver um artefato real a registrar; nao criar documentos ou diretorios vazios apenas para antecipar estrutura. Requisitos, personas, arquitetura e plano de qualidade devem permanecer identificados pelos seus estados (`PROPOSTO`, `EM ANALISE`, `APROVADO`, `IMPLEMENTADO`, `VALIDADO` ou `PENDENTE`).

## Estado observado

**Estado: EM ANALISE**

Na inspecao de 2026-10-20, `docs/contexto-inicial-agentes.md` era o unico documento do projeto em `docs/`. O repositorio nao continha codigo de aplicacao nem artefatos de dominio, personas ou requisitos refinados. O scaffold e as configuracoes AIOX presentes no workspace nao comprovam que a aplicacao foi implementada ou que suas escolhas estejam aprovadas.

O desalinhamento entre o contexto (Java 21/Spring Boot 3.x) e o preset `nextjs-react` do AIOX foi resolvido: `.aiox-core/data/technical-preferences.md` agora indica o preset `java`.

## Primeiro artefato

- [Proposta de dominio e ciclo de vida das reservas](dominio/proposta-dominio-reservas.md) — **PROPOSTO**; depende de validacao da equipe e esclarecimento de ambiguidades.

## Incremento de Marcos — 10/11/2026

O diagnóstico de outubro acima é histórico. O backend e os contratos já estão na develop; este incremento acrescenta a base do cliente.
- [Responsabilidades completas, mapa de telas, plano e quatro respostas para a equipe](planejamento/marcos-plano-de-acao.md).
- [Story Marcos-1](stories/marcos-1.md).
- [Autenticação atual e consumo dos clientes JS](api/frontend-integracao.md).
- [Resultados locais e limites da validação](testes/marcos-1-resultados.md).
- [Aceite do contrato pelo cliente](stories/marcos-contrato-1.md) e [leitura da fila ainda não implementada](api/reservas-leitura-contrato.md).
- [Login/logout e entrada por perfil — Marcos-2](stories/marcos-2.md), com [evidências de navegador](testes/marcos-2-resultados.md).
- [Pesquisa e criação de reservas — Marcos-3](stories/marcos-3.md): primeiro recorte da etapa 3, com [evidências e limites](testes/marcos-3-resultados.md). Listagem/edição/cancelamento de reservas existentes continuam dependentes da leitura autorizada.
- [Fila e decisões — Marcos-4](stories/marcos-4.md): cliente da especificação aceita, com [evidências e limites](testes/marcos-4-resultados.md). Implementação/autorização da leitura no backend e integração real continuam pendentes.
- [Conciliação da Marcos-4 com a etapa 5](testes/marcos-4-conciliacao-resultados.md): checkout separado baseado em movimentações; comandos e evidência da regressão conjunta, preservando as execuções anteriores.

- [Administração de recursos — Marcos-5](stories/marcos-5.md): recorte de cadastros, manutenção e expediente, independente da fila/Q9. Movimentações possuem story própria abaixo; integração real permanece pendente. [Resultados e limites](testes/marcos-5-resultados.md).
- [Movimentações — complemento da etapa 5](stories/marcos-5-movimentacoes.md): retirada, pendências e devolução, sem consulta de reservas/Q9. Aceite visual e commit autorizados por Marcos em 11/11/2026, encerrando a implementação local da etapa 5 junto à administração. Revisão da equipe, CI e integração continuam pendentes. [Resultados e limites](testes/marcos-5-movimentacoes-resultados.md).
