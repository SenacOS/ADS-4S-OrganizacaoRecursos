# Reservas — leitura da fila de aprovação

**Estado: ESPECIFICADO / ACEITO POR MARCOS PARA O FRONTEND em 10/11/2026. LEITURA NÃO IMPLEMENTADA NO BACKEND.** O cliente desta especificação está na [Marcos-4](../stories/marcos-4.md), validado com API controlada; isso não altera a pendência de implementação/revisão da equipe.

Fonte: quatro respostas do [plano de Marcos](../planejamento/marcos-plano-de-acao.md#respostas-adotadas-para-o-contrato), adotadas pelo usuário. Esta especificação não comprova revisão de Silva, Fausto ou Débora. A [política geral de leitura Q9 foi comunicada como decidida em 11/11/2026](reservas-politica-leitura-q9.md); esta especificação continua tratando apenas da fila do Responsável, com implementação e revisão de contrato pendentes.

## Requisição da fila

```http
GET /api/reservas?status=SOLICITADA&inicio=2026-11-10T13%3A00%3A00-03%3A00&fim=2026-11-10T18%3A00%3A00-03%3A00&recursoId=101&pagina=0&tamanho=20
```

Sessão autenticada com papel RESPONSAVEL. Solicitante e Administrador não recebem acesso à fila de decisões por esta especificação; suas consultas gerais seguem contratos próprios orientados pela Q9. O servidor impõe status SOLICITADA, restrita=true e escopo dos recursos sob responsabilidade do ator, conforme a decisão comunicada; não basta filtrar ou ocultar ações no navegador. O modelo desse vínculo e sua aplicação na consulta ainda precisam ser integrados pelo backend.

| Parâmetro | Regra |
|---|---|
| status | SOLICITADA identifica esta consulta de fila. Outros estados/consultas dependem de contrato separado que aplique a Q9 decidida. |
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

Valores acima são exemplos, não dados reais. Os campos até motivoDecisao já existem no DTO de resposta de escrita. solicitante e recursos são **projeções adicionais de leitura ainda não implementadas**. Não alterar os corpos de criação/edição para recebê-las.

- solicitante.usuarioId deve coincidir com solicitanteId. identificacao é o texto mínimo necessário à avaliação, definido com segurança; não incluir email, contato ou outros dados pessoais sem necessidade autorizada.
- recursos deve corresponder aos recursosIds e apresentar identificação legível por tipo, com código/nome e patrimônio para materiais. Para professor, competências necessárias à validação podem integrar essa projeção após confirmação de Fausto/Débora.
- Inicio e fim preservam os instantes, apresentados com offset do fuso America/Sao_Paulo. Data de criação não é exigida: a primeira ordem usa inicio/id.
- A fila traz os dados para avaliar e decidir; não exige um GET de detalhe fictício. Carregar uma reserva para edição continua dependendo de GET /api/reservas/{id} e da política de leitura a implementar.

## Decisões e erros

Aprovar/rejeitar reutiliza os POSTs já escritos no [contrato de escrita](reservas-contrato.md). Rejeição exige motivo. Após decisão, refazer a leitura da página para refletir o estado real; se a reserva já mudou, apresentar 409/TRANSICAO_INVALIDA e permitir atualizar a fila, sem repetir automaticamente o POST.

Erros no formato {codigo,mensagem,correlationId}: 400 para parâmetros inválidos, 401 para sessão ausente/expirada, 403 para perfil não autorizado. Não revelar dados de reservas conflitantes de outros usuários.

## Pendências de implementação

Silva/Fausto: porta de leitura, consulta e controller. Débora: revisão da projeção de identidade e autorização no servidor, incluindo o escopo de recursos do Responsável. Equipe: consolidar contratos e implementação da Q9 comunicada; o relatório não define a convenção 403/404 fora do escopo. Somente depois dessas entregas esta leitura pode ser integrada e validada de ponta a ponta.
