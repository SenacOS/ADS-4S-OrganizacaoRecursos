# Porta de leitura do relatório RF12 — registro de implementação

**Estado:** implementada e integrada em `develop` pelo PR #37, mesclado em `d7a92f571066da5446d956aee90f556c958637f5`.

**Implementação:** `ReservaRelatorioPort` (camada `reserva/aplicacao`), `ConflitoEvitadoResumo` (projeção da aplicação) e `ReservaRelatorioMysql` (adaptador MySQL). O `ReservaRelatorioMysqlIT` cobre sete cenários de leitura com MySQL/Testcontainers, incluindo filtros, intervalos, múltiplos vínculos e seleção de conflitos pelo momento do evento.

**Camadas posteriores, também integradas:** serviço/agregação/DTO no PR #39; fronteira transacional e endpoint HTTP no PR #41; interface inicial no PR #40 e integração com a rota real no PR #42. O contrato HTTP vigente está em [`docs/api/relatorios-utilizacao-proposta.md`](../api/relatorios-utilizacao-proposta.md).

Os detalhes técnicos abaixo foram preservados como registro da porta e da semântica SQL implementadas. Menções a futura implementação de serviço, endpoint ou integração referem-se ao desenho original e devem ser lidas como histórico.

A porta entrega os dados persistidos para o cálculo de utilização. O cálculo continua em `UtilizacaoReservas`.

```java
interface ReservaRelatorioPort {
    List<Reserva> buscarReservas(
        IntervaloReserva periodo, Set<StatusReserva> estados, Long recursoId);

    List<ConflitoEvitadoResumo> buscarConflitosEvitados(
        IntervaloReserva periodo, Long recursoId);
}

record ConflitoEvitadoResumo(
    long id,
    long recursoId,
    IntervaloReserva intervaloSolicitado,
    OrigemOcupacao origem,
    Instant momento
) {}
```

| Consulta | Regras |
|---|---|
| Reservas | Período obrigatório. Seleciona interseção por `inicio_utc < fim` e `fim_utc > inicio`. Aplica o conjunto não vazio de estados recebido. Com `recursoId`, seleciona reservas que contêm esse vínculo. Ordena por `inicio_utc, id`. |
| Conflitos evitados | Período obrigatório aplicado a `momento >= inicio` e `momento < fim`. Com `recursoId`, filtra o recurso conflitante registrado. Ordena por `momento, id`. O intervalo solicitado é devolvido para contexto. |

- `recursoId` nulo consulta todos os recursos. Um ID informado deve ser positivo. Sem registros, a consulta devolve lista vazia.
- A consulta de reservas devolve **uma reserva por ID**, com todos os vínculos e os instantes originais. O filtro de recurso usa `EXISTS`, e os vínculos são carregados em lote. Assim uma reserva com três recursos conta uma vez no total.
- O serviço do Silva pode passar `UtilizacaoReservas.ESTADOS_PADRAO` ou estados explícitos. O cálculo recorta a duração ao período e preserva as horas por recurso. No relatório filtrado, o serviço seleciona a linha do recurso solicitado na projeção por recurso.
- Cada linha de `conflitos_evitados` é um evento. A projeção usa as colunas já gravadas por `ConflitosMysql` e omite a identidade do solicitante.

Para a implementação, validar no MySQL as bordas dos períodos, o filtro combinado de estado e recurso, uma reserva com múltiplos vínculos e o evento que permanece gravado após rollback. A revisão deve confirmar especialmente se o relatório de conflitos usa o momento da tentativa e se o filtro por recurso tem a semântica acima.
