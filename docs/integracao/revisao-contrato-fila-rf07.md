# Revisão do contrato de leitura da fila de aprovação (RF07)

**Estado: PROPOSTO.** Revisa `docs/api/reservas-leitura-contrato.md`, que está na branch `feature/marcos-base-frontend` (aceito por Marcos para o frontend; **não revisado** por Silva, Fausto e Débora). Este documento não altera o contrato de Marcos: lista o que o backend implementou e o que precisa de ratificação.

## 1. O que a camada de aplicação já cumpre (testado com fake)

| Regra do contrato | Onde |
|---|---|
| Somente `RESPONSAVEL` consulta | `ConsultarFilaAprovacao` (403 para Solicitante e Administrador; a porta nem é chamada) |
| Só reservas restritas em `SOLICITADA` | Contrato da porta e verificação defensiva no caso de uso (`IllegalStateException` se o adaptador violar) |
| `inicio` e `fim` juntos, `fim > inicio` | `FiltroFilaAprovacao.de(...)` |
| `recursoId` positivo; `pagina >= 0`; `tamanho` de 1 a 100, padrão 20 | `FiltroFilaAprovacao` (`ConsultaInvalidaException` → 400) |
| Projeção do solicitante coincide com a reserva; recursos correspondem a `recursosIds` | `ItemFilaAprovacao` |
| Projeção do solicitante sem dados pessoais | `SolicitanteResumo(usuarioId, identificacao)`, com teste estrutural |
| Interseção `[inicio, fim)`, ordem por início e id, total antes de paginar | **Contrato da porta** (`ReservaFilaPortContrato`); o filtro real é do adaptador |

## 2. Pontos que precisam de ratificação

1. **Rota.** `GET /api/reservas?status=SOLICITADA` reaproveita o caminho da futura listagem geral (Q9). Ratificar se `status` deve ser obrigatório e igual a `SOLICITADA` (proposta: outro valor ou ausência resulta em 400) ou se a fila terá rota própria.
2. **`identificacao` do solicitante.** O contrato usa um texto mínimo ("Solicitante 7"). É preciso decidir com a Débora qual dado real é seguro (por exemplo, somente o nome, sem e-mail).
3. **Projeção de professor.** O contrato diz que competências "podem integrar" a projeção, sem definir campos. Hoje `RecursoResumo` tem só `tipo`, `identificacao` e `patrimonio`.
4. **Tipo do recurso.** `RecursoResumo.tipo` é `String` (`SALA`, `PROFESSOR`, `MATERIAL`), para não criar dependência circular entre `reserva` e `recurso.dominio`. O adaptador converte com `TipoRecurso.name()`.
5. **Erros.** `ConsultaInvalidaException` ainda **não** está mapeada no `ReservaExceptionHandler`; entra junto com o controller (400, `REQUISICAO_INVALIDA`).
6. **Autorização na URL.** O `SecurityConfig` da Débora hoje restringe aprovação e rejeição. Definir se o GET da fila recebe regra própria por URL além da verificação no caso de uso (defesa em profundidade).

## 3. Para o adaptador (Fausto)

- Implementar `ReservaFilaPort.buscarFila(FiltroFilaAprovacao)` com filtro, ordenação e paginação **no banco**.
- Filtros fixos: `restrita = true` e `status = 'SOLICITADA'`. Período: `inicio_utc < fim_filtro AND fim_utc > inicio_filtro`. Recurso: reserva que contenha o `recursoId`.
- Ordem: `inicio_utc ASC, id ASC`. `total` calculado antes de paginar. Página além do fim devolve `itens=[]` com o `total` real.
- Considerar índice cobrindo `(status, restrita, inicio_utc, id)`.
- Validar o adaptador estendendo `ReservaFilaPortContrato` e implementando `portaComDados` com dados gravados no MySQL (Testcontainers).

## 4. Para a Débora

- Revisar a regra de autorização e a projeção de identidade (ponto 2).
- Quando houver endpoint, testar 401, 403 (Solicitante e Administrador) e que nenhum dado pessoal vaza.

## 5. Ainda fora deste escopo

Controller e DTO de leitura, consulta MySQL, `GET /api/reservas/{id}` (depende de Q9), listagem geral e RF12.
