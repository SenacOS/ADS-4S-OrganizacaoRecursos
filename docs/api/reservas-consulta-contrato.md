# Reservas — consultas entregues no PR #26

Conferência do frontend em 12/11/2026, develop `3f2a9a3`. GETs implementados e exercitados com Spring/MySQL reais na [integração Q9](../testes/marcos-integracao-q9-1-resultados.md). O aceite de Marcos para consumir o comportamento atual não equivale à ratificação de todos os integrantes.

Revalidação posterior na develop **4cea177**, após PR #27: contrato externo preservado, fila encaminhada ao caso de uso/adaptador existente e predicado Q9 compartilhado. [10 cenários reais aprovados](../testes/marcos-integracao-q9-1-pr27-resultados.md), incluindo paginação vazia e revogação de consulta/decisão.

## Listagem e detalhe

`GET /api/reservas` recebe `status` (estado exato opcional), `inicio`/`fim` (juntos, ISO com offset), `recursoId` positivo opcional, `pagina` >= 0 (padrão 0) e `tamanho` 1–100 (padrão 20). O período filtra por sobreposição: início da reserva < fim consultado e fim da reserva > início consultado. Ordenação por início/id crescentes, paginação e total no servidor. Retorno `{itens,pagina,tamanho,total}`; página além do total pode ter itens vazios.

`GET /api/reservas/{id}` retorna a projeção completa autorizada, sem envelope. Campos: `id`, `solicitanteId`, `status`, `restrita`, `inicio`, `fim`, `recursosIds`, `motivoDecisao`, `solicitante` e `recursos`. Datas em São Paulo com offset. `solicitante` contém `usuarioId` e identificação mínima `Solicitante <id>`. Cada recurso contém `id`, `tipo`, `identificacao` e `patrimonio` quando aplicável. Não há e-mail/contato, competência adicional ou novo campo de criação.

## Escopo da sessão

- Solicitante: próprias reservas.
- Administrador: todas, sem herdar aprovação/rejeição.
- Responsável: precisa estar vinculado a **todos** os recursos da reserva. Vínculo parcial não libera detalhe nem decisão. A consulta `status=SOLICITADA` para esse perfil limita a fila às restritas pendentes.

O ator vem da sessão; filtros não ampliam o escopo. Fora do escopo ou inexistente no detalhe: 404 `NAO_ENCONTRADO`. Sem sessão: 401; parâmetro inválido: 400 `REQUISICAO_INVALIDA`; escrita sem autorização: 403. Mantém-se o envelope de erro `{codigo,mensagem,correlationId}` e CSRF dinâmico em toda escrita.

Marcos aceitou em 12/11 consumir a regra de todos os recursos. A ratificação coletiva dessa regra conservadora e o processo administrativo de manutenção dos vínculos permanecem pendentes. V6 cria `responsaveis_recursos` vazia; não há endpoint público de concessão. Os vínculos desta validação foram criados apenas na base isolada e para IDs de teste identificados.

Leitura permitida não concede edição/cancelamento. A [interface geral implementada localmente](../stories/marcos-3-consulta-edicao.md) usa as regras de escrita atuais e exige GET de detalhe antes dessas ações; [provas e limites](../testes/marcos-3-consulta-edicao-resultados.md). A fila já usa a projeção suficiente para avaliar sem exigir GET de detalhe separado.

Fontes de implementação: `ReservaLeituraController`, `ReservaLeituraResponse`, `ReservaConsultaMysql`, `ReservaAcessoMysql`, V6 e [documento de segurança](../seguranca/q9-autorizacao-reservas.md). [Especificação da fila](reservas-leitura-contrato.md).
