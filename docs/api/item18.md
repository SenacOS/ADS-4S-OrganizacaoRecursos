# Contratos do item 18

Estado: IMPLEMENTADO; validação de sessão/CSRF depende do módulo de segurança.

## Ativação
`recursos.api.enabled` e `movimentacoes.api.enabled` são false por padrão.
A ativação exige `AtorAutenticadoProvider` real, baseado na sessão, e `EventosDominioPort` transacional. Reservas também exigem `AuditoriaPort` e `NotificacaoPort`. Nenhum provedor vazio é distribuído em produção. Os serviços são beans lazy: dependências ausentes impedem sua utilização. A equipe de segurança deve instalar filtros de autenticação/CSRF antes de habilitar as rotas.

## Rotas
| Método | Rota | Permissão / sucesso |
|---|---|---|
| GET | /api/recursos | Autenticado; página 200 |
| POST | /api/recursos | Administrador; 201 |
| GET | /api/recursos/{id} | Autenticado; 200; inativos só Administrador |
| PUT | /api/recursos/{id} | Administrador; substituição completa; 200 |
| DELETE | /api/recursos/{id} | Administrador; desativação; 204 |
| GET/PUT | /api/horarios-funcionamento | Consulta autenticada / escrita Administrador; 200 |
| GET/POST | /api/recursos/{id}/bloqueios | Consulta autenticada / escrita Administrador; 200/201 |
| POST | /api/bloqueios/{id}/cancelamento | Administrador; 200; repetição não audita novamente |
| GET | /api/movimentacoes?abertas=true | Responsável ou Administrador; 200 |
| POST | /api/movimentacoes/retiradas | Responsável; 201 |
| POST | /api/movimentacoes/{id}/devolucao | Responsável; 200; idempotente |

## Cadastro e retorno
Corpo material: `{"tipo":"MATERIAL","codigo":"PROJ-01","ativo":true,"restrito":false,"patrimonio":"PAT-01","descricao":"Projetor","condicao":"BOM"}`.
Sala: campos comuns mais `capacidade`, `localizacao`, `tipoSala`.
Professor: campos comuns mais `nome`, `competencias:["Java","Banco de Dados"]`.
O retorno é `{id,dados:{...campos do cadastro...},disponivel:null}`. Competências são normalizadas para minúsculas, espaços simples e sem duplicatas. Tipo é imutável. Não há exclusão física.

Pesquisa aceita `tipo,capacidadeMinima,localizacao,competencia,patrimonio,inicio,fim,disponivel,pagina,tamanho`. Textos usam busca parcial sem distinguir maiúsculas. Capacidade só seleciona salas; competência só professores; patrimônio só materiais. `inicio` e `fim` devem vir juntos, ISO 8601 com offset; `disponivel` exige intervalo. Página zero-based, tamanho padrão 20, máximo 100, ordenação por ID. Resposta `{itens,pagina,tamanho,total}`. Disponibilidade é calculada antes de paginar; ela é informativa, sem locks, e sempre revalidada na escrita. Fora do expediente é indisponível.

Expediente PUT: `{"janelas":[{"dia":"TUESDAY","inicio":"07:00","fim":"22:00"}]}`. Retorno inclui `zona:America/Sao_Paulo`. Sem janelas, fechado. Reservas não atravessam dias locais. Feriados são bloqueios datados. Mudança que invalida reserva ativa futura retorna 409.

Bloqueio POST: `{"inicio":"2026-11-10T13:00:00-03:00","fim":"2026-11-10T14:00:00-03:00","motivo":"Manutenção"}`. Respostas usam nomes das colunas SQL (`recurso_id`, `inicio_utc`, `fim_utc`, `status`) e datas com offset explícito. Não revelam dados do solicitante de reservas conflitantes.

Retirada POST: `{"reservaId":1001,"recursoId":10}`. Horários e operador vêm do servidor. Resposta: `{id,recursoId,reservaId,responsavelId,retiradoEm,devolvidoEm,devolvidoPor,fimPrevisto,atrasoSegundos}`. Unidade deve estar ativa, na reserva APROVADA/EM_USO e no intervalo `[inicio,fim)`. Não muda estado da reserva. Devolução independe do encerramento da reserva. Retirada aberta bloqueia novos períodos até o retorno; reserva e manutenção continuam sendo consideradas após devolução.

## Erros e eventos
Formato `{codigo,mensagem,correlationId}`: 400 entrada inválida; 401 sessão ausente; 403 perfil; 404 ID; 409 conflito, duplicidade, vínculo inválido ou disputa; 500 genérico. `INTEGRIDADE_DOS_DADOS` representa restrições SQL, `TENTE_NOVAMENTE` deadlock/timeout/mudança concorrente. Não há retry automático.
`EventosDominioPort.Evento` contém entidade, id, ator, ação, antes/depois e instante; o implementador deve gravar na mesma transação. Ações: CRIACAO, EDICAO, DESATIVACAO, CANCELAMENTO, RETIRADA, DEVOLUCAO. DEVOLUCAO deve também persistir notificação pendente; envio posterior ao commit é responsabilidade do módulo de notificações.
