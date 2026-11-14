# Sequências críticas de reserva

**Estado: PROPOSTO** — espelha o `ReservaService` e o ADR-003. Código: `br.senac.recursos.reserva.aplicacao.ReservaService`.

## Criar reserva (RF04, RF05, RF06)

```mermaid
sequenceDiagram
    participant C as Controller
    participant S as ReservaService
    participant E as ExpedientePort
    participant R as RecursosPort (FOR UPDATE)
    participant O as OcupacoesPort
    participant D as DetectorConflitos
    participant Rep as ReservaRepositorio
    participant A as AuditoriaPort
    participant N as NotificacaoPort
    participant X as ConflitosEvitadosPort

    C->>S: criar(comando, ator)
    S->>E: atual().comporta(intervalo)
    alt fora do expediente
        S-->>C: ForaDoExpedienteException (sem locks)
    end
    S->>S: ordenar IDs crescente, sem duplicatas
    S->>R: bloquear(ids)
    R-->>S: RecursoInfo (ativo, restrito)
    S->>O: buscar(ids, intervalo)
    O-->>S: ocupações (reservas, manutenção, retirada)
    S->>D: primeiroConflito(...)
    alt conflito
        S->>X: registrar (transação independente)
        S-->>C: ConflitoDisponibilidadeException (rollback, HTTP 409)
    end
    S->>Rep: salvar(SOLICITADA)
    S->>A: CRIACAO
    S->>N: RESERVA_CRIADA
    opt recursos sem restrição
        S->>Rep: salvar(APROVADA)
        S->>A: APROVACAO_AUTOMATICA
        S->>N: RESERVA_APROVADA
    end
    S-->>C: Reserva (commit)
```

## Aprovar ou rejeitar reserva restrita (RF07)

```mermaid
sequenceDiagram
    participant C as Controller
    participant S as ReservaService
    participant R as RecursosPort
    participant Rep as ReservaRepositorio
    participant Dom as Reserva (domínio)
    participant A as AuditoriaPort
    participant N as NotificacaoPort

    C->>S: aprovar(id, ator)
    S->>Rep: buscarPorId (leitura prévia)
    S->>R: bloquear(recursos da reserva, ordenados)
    S->>Rep: buscarPorId (releitura sob lock)
    S->>Dom: aprovar(ator)
    alt ator não é Responsável
        Dom-->>S: OperacaoNaoPermitidaException (403, nada gravado)
    else estado inválido
        Dom-->>S: TransicaoInvalidaException (409)
    end
    S->>Rep: salvar(APROVADA)
    S->>A: APROVACAO (antes=SOLICITADA, depois=APROVADA)
    S->>N: RESERVA_APROVADA
    S-->>C: Reserva
```

Cancelar, iniciar, concluir e registrar não comparecimento seguem o mesmo desenho do segundo diagrama, mudando apenas a regra de domínio chamada.
