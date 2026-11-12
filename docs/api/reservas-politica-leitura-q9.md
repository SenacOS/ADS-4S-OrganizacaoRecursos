# Q9 — política de consulta de reservas

**Estado: DECISÃO COMUNICADA POR MARCOS em 11/11/2026.** O usuário informou que a Q9 foi decidida pela equipe e forneceu o [relatório de continuidade](../planejamento/relatorio-marcos-2026-11-11.md#9-q9-resolvido--informação-recebida-depois-do-commit). Este registro documenta a política recebida; não atribui implementação, revisão formal de PR ou integração ao backend.

## Escopo por perfil

| Perfil | Reservas que pode consultar |
|---|---|
| SOLICITANTE | Suas próprias reservas e respectivos estados. |
| RESPONSAVEL | Reservas dos recursos sob sua responsabilidade, incluindo as solicitações que precisa avaliar. |
| ADMINISTRADOR | Todas as reservas para administração, manutenção e acompanhamento. |

O backend aplica o escopo autorizado e fornece somente as informações necessárias ao trabalho de cada perfil. Consulta de disponibilidade e consulta dos dados completos de reservas são operações distintas; a decisão não torna os dados completos públicos.

O direito de consulta não concede novas operações de escrita. Aprovação/rejeição continuam exclusivas de RESPONSAVEL; ADMINISTRADOR não herda essas ações nem a escrita de movimentações.

## Aplicação nos contratos e testes

- A política orienta as futuras consultas gerais e de detalhe. Ainda são necessários contratos HTTP/DTOs e endpoints efetivos antes das telas de listagem, edição e cancelamento de reservas existentes.
- Para a fila específica de decisões, a seleção no servidor deve respeitar também os recursos sob responsabilidade do ator. O papel RESPONSAVEL isoladamente não autoriza uma fila global; filtro enviado pelo navegador não substitui essa delimitação.
- Os testes integrados deverão conferir escopo do Solicitante, vínculo do Responsável, consulta administrativa e ausência de exposição de dados fora da autorização, sem inferir permissão de escrita a partir da leitura.
- O relatório não informa a convenção HTTP entre 403 e 404 para reserva fora do escopo. Conferir/registrar esse detalhe no contrato com backend/segurança antes de criar expectativas de teste; não escolher por inferência. Isso não reabre a decisão de escopo comunicada pelo usuário.
- O relatório não define rotas novas, projeções completas, modelo do vínculo responsável/recurso ou regras técnicas para reservas com vários recursos. Esses detalhes precisam constar dos contratos de implementação; não inventar campos ou autorização no cliente.

## Estado técnico conferido

Na consulta ao GitHub de 11/11/2026, a develop permanece em [395ac73](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/tree/395ac734fa246452cd9429e952b3a4f3db58ca9d). O [PR #15](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/15) da aplicação da fila continua aberto, sem integração do controller/SQL dessa leitura. O checkout atual permanece em `feature/marcos-base-frontend`, HEAD `a10e0b5`, com a preparação local da Marcos-4 preservada.

Depois dessa conferência, Marcos autorizou a [conciliação do frontend em checkout separado](../testes/marcos-4-conciliacao-resultados.md), branch `feature/marcos-4-aprovacoes`, base `f7360a2` de movimentações. A pasta original foi preservada. Essa retomada não implementa o escopo da Q9 no backend nem encerra a validação integrada.

Nenhum endpoint, Java, flag, permissão de execução ou teste foi alterado para registrar esta decisão. A política agora está definida para o planejamento; a implementação e a validação integrada permanecem pendentes.
