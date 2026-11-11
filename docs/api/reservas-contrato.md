# Contrato da API de reservas

**Estado: ACEITO POR MARCOS PARA O FRONTEND em 10/11/2026** — datas, PATCH e 409 adotados conforme autorização do usuário. Revisões de backend/segurança e integração real permanecem pendentes. Os 8 endpoints de escrita estão escritos, mas desligados por padrão (reservas.api.enabled=false). A integração depende da sessão e dos provedores reais de auditoria/notificação; não foram validados ponta a ponta. A autenticação entregue em branch separada ainda precisa ser integrada à develop.

**Fora deste contrato por enquanto:** `GET /api/reservas`, `GET /api/reservas/{id}` e disponibilidade. Dependem de uma porta de leitura (Fausto), da regra de quem pode consultar (Q9) e do dono do endpoint de disponibilidade (`GET /api/recursos`, Fausto).

Convenções (ADR-004, ADR-006): sessão com cookie HttpOnly, CSRF no cabeçalho informado por `GET /api/auth/csrf` (`{token,header}`; não fixar o nome no cliente), JSON em UTF-8 nas operações de domínio, datas ISO 8601 **com offset** (`2026-11-10T13:00:00-03:00`), persistidas em UTC, exibidas em `America/Sao_Paulo`.

## Autenticação — atualização comunicada em 10/11/2026

| Método e rota | Envio / retorno |
|---|---|
| GET /api/auth/csrf | Retorna {token,header}; disponível antes do login |
| POST /api/auth/login | application/x-www-form-urlencoded: email e senha; 204 sem corpo ou 401/CREDENCIAIS_INVALIDAS |
| POST /api/auth/logout | 204 sem corpo |
| GET /api/auth/me | Retorna {usuarioId,email,papel} |

Todas as escritas, inclusive login/logout, usam o cabeçalho CSRF retornado pelo servidor e credentials same-origin. O cookie é HttpOnly. Renovar o token após login/logout. Não usar as rotas ilustrativas antigas do PDF. Detalhes de consumo em [frontend-integracao.md](frontend-integracao.md).

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

## Alterar reserva

`PATCH /api/reservas/{id}` **substitui** `inicio`, `fim` e `recursosIds` juntos; os três são obrigatórios (mesmo corpo do POST). Não há alteração parcial.

## Criar reserva

```http
POST /api/reservas
Content-Type: application/json
X-CSRF-TOKEN: <token>

{ "inicio": "2026-11-10T13:00:00-03:00", "fim": "2026-11-10T14:00:00-03:00", "recursosIds": [101, 305, 702] }
```

Resposta 201:

```json
{ "id": 1001, "solicitanteId": 7, "status": "APROVADA", "restrita": false,
  "inicio": "2026-11-10T13:00:00-03:00", "fim": "2026-11-10T14:00:00-03:00",
  "recursosIds": [101, 305, 702], "motivoDecisao": null }
```

Respostas trazem datas em `America/Sao_Paulo` com offset (ADR-006); o banco guarda UTC. Reserva com recurso restrito responde `"status": "SOLICITADA"` e `"restrita": true`; ela já bloqueia a agenda. O solicitante é sempre o usuário autenticado; **não existe** campo `solicitanteId` no corpo.

## Rejeição

```json
{ "motivo": "Equipamento reservado para a coordenação." }
```
`motivo` é obrigatório (400 se vazio).

## Revisão de cliente — decisões adotadas por Marcos

O cliente aceita datas ISO com offset e PATCH com substituição conjunta de inicio/fim/recursosIds. Mantém-se 409/FORA_DO_EXPEDIENTE. A necessidade de leitura da fila, campos legíveis, filtros e paginação está [especificada para implementação](reservas-leitura-contrato.md), sem declarar o endpoint implementado ou as revisões dos demais integrantes aprovadas. Ver [decisões completas](../planejamento/marcos-plano-de-acao.md#respostas-adotadas-para-o-contrato).

O cabeçalho X-CSRF-TOKEN dos exemplos HTTP é ilustrativo: usar o nome retornado pelo endpoint de CSRF. Ações de aprovação/rejeição continuam exclusivas de RESPONSAVEL; não atribuir a ADMINISTRADOR por hierarquia visual.

## Erros

Formato único: `{ "codigo": "...", "mensagem": "...", "correlationId": "..." }`.

| Exceção de domínio | HTTP | `codigo` |
|---|---|---|
| `IntervaloInvalidoException`, `IllegalArgumentException`, validação de DTO, JSON malformado, data fora do ISO 8601, id não numérico | 400 | `REQUISICAO_INVALIDA` |
| (sem sessão) | 401 | `NAO_AUTENTICADO` |
| `OperacaoNaoPermitidaException` | 403 | `OPERACAO_NAO_PERMITIDA` |
| `ReservaNaoEncontradaException`, `RecursoNaoEncontradoException` | 404 | `NAO_ENCONTRADO` |
| `ConflitoDisponibilidadeException` | 409 | `RECURSO_INDISPONIVEL` |
| `RecursoIndisponivelException` (recurso desativado) | 409 | `RECURSO_DESATIVADO` |
| `ForaDoExpedienteException` | 409 (aceito pelo cliente) | `FORA_DO_EXPEDIENTE` |
| `TransicaoInvalidaException` | 409 | `TRANSICAO_INVALIDA` |
| `AlteracaoConcorrenteException` (reserva mudou durante o bloqueio) | 409 | `TENTE_NOVAMENTE` |
| método sem mapeamento | 405 | `METODO_NAO_PERMITIDO` |
| `Content-Type` não JSON | 415 | `TIPO_DE_CONTEUDO_NAO_SUPORTADO` |
| deadlock/timeout de lock do banco | a mapear quando o adaptador do Fausto existir (409 ou 503) | `TENTE_NOVAMENTE` |
| qualquer outra | 500 | `ERRO_INTERNO` (detalhes só no log) |

Mensagens nunca incluem SQL, stack trace nem dados de outros usuários. O 409 de conflito não revela quem ocupa o recurso.

## Correlação

O cliente pode enviar `X-Correlation-Id` (1 a 64 caracteres entre letras, números, `.`, `_` e `-`); ele é devolvido no erro. Valores fora desse padrão são trocados por um UUID. Hoje o ID de auditoria e o ID do erro HTTP são diferentes (a unificar com Débora).

## Idempotência (PROPOSTO, **não implementado**)

Cabeçalho opcional `Idempotency-Key` em `POST /api/reservas`: repetir a mesma chave do mesmo usuário devolve a reserva já criada em vez de uma segunda. Escopo e prazo a definir (S3).
