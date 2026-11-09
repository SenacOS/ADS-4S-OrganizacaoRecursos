# Contrato da API de reservas

**Estado: PROPOSTO** — a revisar por Marcos (cliente) e Débora (segurança). Nenhum endpoint existe ainda; este documento orienta o controller que será escrito sobre `ReservaService`.

Convenções (ADR-004, ADR-006): sessão com cookie HttpOnly, CSRF no cabeçalho `X-CSRF-TOKEN`, JSON em UTF-8, datas ISO 8601 **com offset** (`2026-11-10T13:00:00-03:00`), persistidas em UTC, exibidas em `America/Sao_Paulo`.

## Endpoints

| Método e rota | Perfil | Serviço | Sucesso |
|---|---|---|---|
| `POST /api/reservas` | autenticado | `criar` | 201 |
| `PATCH /api/reservas/{id}` | dono | `editar` | 200 |
| `POST /api/reservas/{id}/cancelamento` | dono ou Administrador | `cancelar` | 200 |
| `POST /api/reservas/{id}/aprovacao` | Responsável | `aprovar` | 200 |
| `POST /api/reservas/{id}/rejeicao` | Responsável | `rejeitar` | 200 |
| `POST /api/reservas/{id}/inicio` | Responsável/Administrador (PROPOSTO) | `iniciarUso` | 200 |
| `POST /api/reservas/{id}/conclusao` | Responsável/Administrador (PROPOSTO) | `concluir` | 200 |
| `POST /api/reservas/{id}/nao-comparecimento` | Responsável/Administrador (PROPOSTO) | `registrarNaoComparecimento` | 200 |

## Criar reserva

```http
POST /api/reservas
Content-Type: application/json
X-CSRF-TOKEN: <token>

{ "inicio": "2026-11-10T13:00:00-03:00", "fim": "2026-11-10T14:00:00-03:00", "recursosIds": [101, 305, 702] }
```

Resposta 201:

```json
{ "id": 1001, "status": "APROVADA", "restrita": false,
  "inicio": "2026-11-10T16:00:00Z", "fim": "2026-11-10T17:00:00Z", "recursosIds": [101, 305, 702] }
```

Reserva com recurso restrito responde `"status": "SOLICITADA"` e `"restrita": true`; ela já bloqueia a agenda. O solicitante é sempre o usuário autenticado; **não existe** campo `solicitanteId` no corpo.

## Rejeição

```json
{ "motivo": "Equipamento reservado para a coordenação." }
```
`motivo` é obrigatório (400 se vazio).

## Erros

Formato único: `{ "codigo": "...", "mensagem": "...", "correlationId": "..." }`.

| Exceção de domínio | HTTP | `codigo` |
|---|---|---|
| `IntervaloInvalidoException`, `IllegalArgumentException`, validação de DTO | 400 | `REQUISICAO_INVALIDA` |
| (sem sessão) | 401 | `NAO_AUTENTICADO` |
| `OperacaoNaoPermitidaException` | 403 | `OPERACAO_NAO_PERMITIDA` |
| `ReservaNaoEncontradaException`, `RecursoNaoEncontradoException` | 404 | `NAO_ENCONTRADO` |
| `ConflitoDisponibilidadeException` | 409 | `RECURSO_INDISPONIVEL` |
| `RecursoIndisponivelException` (recurso desativado) | 409 | `RECURSO_DESATIVADO` |
| `ForaDoExpedienteException` | 409 (a confirmar, Q6) | `FORA_DO_EXPEDIENTE` |
| `TransicaoInvalidaException` | 409 | `TRANSICAO_INVALIDA` |
| deadlock/timeout de lock | 409 ou 503 (a combinar), nunca 500 genérico | `TENTE_NOVAMENTE` |
| qualquer outra | 500 | `ERRO_INTERNO` (detalhes só no log) |

Mensagens nunca incluem SQL, stack trace nem dados de outros usuários. O 409 de conflito não revela quem ocupa o recurso.

## Idempotência (PROPOSTO)

Cabeçalho opcional `Idempotency-Key` em `POST /api/reservas`: repetir a mesma chave do mesmo usuário devolve a reserva já criada em vez de uma segunda. Escopo e prazo a definir (S3).
