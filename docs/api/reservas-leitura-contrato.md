# Reservas — leitura da fila de aprovação

**Estado: GETs integrados pelo PR #26.** Este complemento conecta o GET ao adaptador da fila integrado pelo PR #22. O cliente está na [Marcos-4](../stories/marcos-4.md).

Atualização do frontend após merge do **PR #27**, develop `4cea177`: fila/Q9 revalidadas com backend real, incluindo total de página vazia e revogação de vínculo. [Resultados](../testes/marcos-integracao-q9-1-pr27-resultados.md). Marcos aceitou consumir o escopo de todos os recursos; ratificação coletiva e manutenção administrativa dos vínculos continuam separadas.

O escopo das leituras segue a [implementação da Q9](../seguranca/q9-autorizacao-reservas.md).

## Requisição da fila

```http
GET /api/reservas?status=SOLICITADA&inicio=2026-11-10T13%3A00%3A00-03%3A00&fim=2026-11-10T18%3A00%3A00-03%3A00&recursoId=101&pagina=0&tamanho=20
```

Com sessão de RESPONSAVEL e status SOLICITADA, o GET consulta a fila de aprovação. O servidor exige `restrita=true` e vínculo com todos os recursos da reserva. Solicitante e Administrador usam a listagem geral com seus respectivos escopos.

| Parâmetro | Regra |
|---|---|
| status | SOLICITADA seleciona a fila para o Responsável. Outros estados usam a listagem geral. |
| inicio, fim | Opcionais, sempre juntos, ISO 8601 com offset e fim > inicio. Selecionar reservas que intersectam [inicio,fim): reserva.inicio < fim e reserva.fim > inicio. |
| recursoId | Opcional, ID positivo. Seleciona reservas contendo esse recurso. |
| pagina | Inteiro >= 0, padrão 0. |
| tamanho | Inteiro entre 1 e 100, padrão 20. |

Ordem fixa por inicio crescente e id crescente como desempate. Filtros e total são calculados no servidor antes de paginar. Não expor todas as reservas para depois construir a fila no cliente. Sem resultados: itens=[] e total=0; página além da última também retorna itens=[].

## Resposta de leitura

Envelope consistente com a pesquisa de recursos: {itens,pagina,tamanho,total}.

```json
{
  "itens": [{
    "id": 1001,
    "solicitanteId": 7,
    "status": "SOLICITADA",
    "restrita": true,
    "inicio": "2026-11-10T13:00:00-03:00",
    "fim": "2026-11-10T14:00:00-03:00",
    "recursosIds": [101],
    "motivoDecisao": null,
    "solicitante": {"usuarioId": 7, "identificacao": "Solicitante 7"},
    "recursos": [{"id": 101, "tipo": "MATERIAL", "identificacao": "Projetor PROJ-01", "patrimonio": "PAT-01"}]
  }],
  "pagina": 0,
  "tamanho": 20,
  "total": 1
}
```

Os valores são exemplos. `solicitante` e `recursos` são projeções de leitura. Os corpos de criação e edição seguem o contrato de escrita.

- `solicitante.usuarioId` coincide com `solicitanteId`. A identificação é `Solicitante <id>`.
- `recursos` contém todos os recursos da reserva. A identificação usa o código da sala, o nome do professor ou a descrição do material. Patrimônio é preenchido somente para materiais.
- Inicio e fim preservam os instantes, apresentados com offset do fuso America/Sao_Paulo. Data de criação não é exigida: a primeira ordem usa inicio/id.

## Decisões e erros

Aprovar/rejeitar reutiliza os POSTs já escritos no [contrato de escrita](reservas-contrato.md). Rejeição exige motivo. Após decisão, refazer a leitura da página para refletir o estado real; se a reserva já mudou, apresentar 409/TRANSICAO_INVALIDA e permitir atualizar a fila, sem repetir automaticamente o POST.

Erros no formato {codigo,mensagem,correlationId}: 400 para parâmetros inválidos, 401 para sessão ausente/expirada, 403 para perfil não autorizado. Não revelar dados de reservas conflitantes de outros usuários.

## Listagem geral e detalhe

`GET /api/reservas` aplica os filtros de status, período e recurso sobre o escopo do ator autenticado. O total é contado no MySQL antes de paginar. A ordem é por início e ID. Uma página além do fim preserva o total. O Solicitante consulta suas reservas, o Responsável consulta as reservas vinculadas e o Administrador consulta todas.

`GET /api/reservas/{id}` devolve o mesmo formato de item, com todos os recursos associados. Uma reserva inexistente ou fora do escopo retorna 404. Os GETs são habilitados com `reservas.api.enabled=true`.
