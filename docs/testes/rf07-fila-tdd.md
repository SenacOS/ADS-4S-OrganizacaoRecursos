# RF07 — Evidência TDD da fila de aprovação (camada de aplicação)

**Estado:** testado localmente com um executor mínimo (sem Maven, que estava inacessível no ambiente de desenvolvimento). **Não** é resultado de `mvn` nem de CI. Reexecutar com `mvn -f backend/pom.xml test`.

Escopo: filtro, projeções e caso de uso `ConsultarFilaAprovacao` com porta fake. Não inclui endpoint nem consulta MySQL.

Os três commits abaixo foram feitos em sequência real e seguem as convenções da organização (Conventional Commits com escopo). Os hashes são omitidos de propósito, pois mudam após `git am`; identifique-os pelo histórico (`git log --oneline`).

| Fase | Commit | Resultado observado |
|---|---|---|
| RED | `test(reserva): adiciona testes da fila de aprovação RF07 (fase RED do TDD)` | 18 falhas, 2 aprovados |
| GREEN | `feat(reserva): implementa filtro, projeções e consulta da fila de aprovação RF07` | 20 aprovados |
| REFACTOR | `refactor(reserva): extrai constantes e predicados da fila de aprovação` | 20 aprovados |

## Testes que falharam no RED (observados, não reconstruídos)

- ConsultarFilaAprovacaoTest.adaptadorComEnvelopeIncoerenteEDetectado
- ConsultarFilaAprovacaoTest.adaptadorQueDevolveReservaNaoPendenteEDetectado
- ConsultarFilaAprovacaoTest.adaptadorQueDevolveReservaNaoRestritaEDetectado
- ConsultarFilaAprovacaoTest.responsavelRecebeAPaginaEAPortaRecebeOMesmoFiltro
- ConsultarFilaAprovacaoTest.resultadoVazioEPreservado
- ConsultarFilaAprovacaoTest.solicitanteEAdministradorNaoConsultamEAPortaNaoEChamada
- ConsultarFilaAprovacaoTest.totalMaiorQueAPaginaEPreservado
- FiltroFilaAprovacaoTest.fimNaoPosteriorAoInicioEInvalido
- FiltroFilaAprovacaoTest.inicioEFimDevemVirJuntos
- FiltroFilaAprovacaoTest.limitesDeTamanhoSaoAceitos
- FiltroFilaAprovacaoTest.paginaNegativaEInvalida
- FiltroFilaAprovacaoTest.periodoCompletoViraIntervalo
- FiltroFilaAprovacaoTest.recursoIdDevePositivo
- FiltroFilaAprovacaoTest.semParametrosUsaPadroes
- FiltroFilaAprovacaoTest.tamanhoForaDeUmACemEInvalido
- ItemFilaAprovacaoTest.identificacaoEmBrancoEInvalida
- ItemFilaAprovacaoTest.recursosFaltandoOuSobrandoSaoDefeitoDoAdaptador
- ItemFilaAprovacaoTest.solicitanteDivergenteDaReservaEDefeitoDoAdaptador

Os 2 aprovados no RED (`itemConsistenteEAceito` e `projecaoDoSolicitanteNaoTemDadosPessoais`) já valiam para o esqueleto, pois dependem só da estrutura dos records.

## Depois do refactor

Foram adicionados 7 testes de **contrato da porta** (`ReservaFilaPortContrato`, com a implementação de referência `FilaEmMemoria`), sem ciclo RED próprio, porque especificam o adaptador e não o caso de uso. Total local: 27 aprovados.

Limites: a execução usou stubs de JUnit; os testes com `@Test` simples foram executados, mas não foram executados pelo JUnit real.
