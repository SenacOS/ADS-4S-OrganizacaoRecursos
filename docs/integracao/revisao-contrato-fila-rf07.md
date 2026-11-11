# RF07 — Revisao do contrato da fila de aprovacao (aguarda validacao de Marcos e Silva)

**Status: PENDENTE DE VALIDACAO CONJUNTA.** Esta proposta nao autoriza incluir
campos pessoais no frontend nem substituir a API atual sem revisao.

## Situacao verificada

- O PR #15 (base develop, em revisao) introduz caso de uso da fila e records
  `SolicitanteResumo(usuarioId, identificacao)` e `ItemFilaAprovacao`.
- A fila deve conter somente reservas **restritas** com status `SOLICITADA`.
- `ConsultarFilaAprovacao` limita o acesso ao papel `RESPONSAVEL`.
- O PR #15 e o trabalho de RF01/RF10/RF11 ainda nao estao integrados; revisao
  contratual e de DTOs deve ocorrer **antes** de expor nova rota HTTP.

## Proposta minima, sem identificar pessoalmente o solicitante

- `solicitante.usuarioId`: id interno, numerico, usado pela API.
- `solicitante.identificacao`: valor **nao pessoal**, como `Solicitante #7`,
  ate a equipe decidir se outro identificador e necessario.
- **Nao retornar** email, telefone, nome completo, senha, hash, cookie ou contato.
- Se a interface precisar de identidade nominal para atendimento, abrir decisao
  especifica com objetivo, controles e fundamento legal; nao presumir isso.
- `reserva`: id, periodo, status, restrita, recursos; `recursos`: id, tipo,
  identificacao e patrimonio se aplicavel.
- A ordenacao, paginacao, erros e datas devem seguir o contrato do PR #15.

## Verificacoes pendentes

- [ ] Marcos: confirmar tela, filtros, nome de campos e tratamento 401/403/409.
- [ ] Gabriel Silva: confirmar DTO, semantica de pagina e endpoint definitivo.
- [ ] Gabriel Fausto: validar consultas SQL e ausencia de dados sensiveis.
- [ ] Frente de seguranca: testar 401 anonimo, 403 para SOLICITANTE e
      ADMINISTRADOR, 200 para RESPONSAVEL e ausencia de vazamento de PII.
- [ ] Equipe: aprovar contrato antes de integrar exposicao HTTP da fila.

Referencias: PR #15 (fila em aplicacao), PR #18 (seguranca IDOR integrada),
`docs/api/reservas-contrato.md` e `docs/RTM.md`.

## Nao confundir com implementacao concluida

Este documento registra o acordo a validar. A rota, a consulta real MySQL
e os testes E2E da fila dependem das entregas dos demais autores.
