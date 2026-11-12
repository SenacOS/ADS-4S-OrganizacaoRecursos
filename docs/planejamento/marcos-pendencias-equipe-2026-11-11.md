# Marcos — conferência das pendências da equipe

Conferência em 11/11/2026, America/Sao_Paulo. Fonte recebida: `Pendencias Marcos - QS.md`. Comparação com a branch `feature/marcos-base-frontend`, HEAD `a10e0b5`, alterações locais da Marcos-4 e consultas de leitura ao GitHub nesta data.

Para compartilhar com a equipe, usar o [status resumido das entregas e dependências](marcos-status-equipe-2026-11-11.md). Este documento mantém os detalhes da conferência e do planejamento local.

**Atualização posterior:** a conferência abaixo foi feita antes do relatório do restante do dia. Marcos comunicou a [Q9 decidida por escopo de perfil](../api/reservas-politica-leitura-q9.md); a etapa 5 foi concluída localmente em outra máquina e publicada nos PRs #20/#21, ainda abertos em Draft. Para o estado atual, consultar o [plano atualizado](marcos-plano-de-acao.md) e o [relatório recebido](relatorio-marcos-2026-11-11.md). Referências abaixo à Q9 pendente são o diagnóstico anterior; implementação dos GETs/autorização continua pendente.

O arquivo recebido registra solicitações da equipe para análise. Esta conferência não executa a abertura de PR, publicação de review, ratificação coletiva ou ativação de APIs mencionadas nele.

## Comparação dos seis itens

| Item da equipe | O que já fizemos | O que continua pendente / encaminhamento |
|---|---|---|
| 1. Contrato de leitura e revisão | [Contrato da fila](../api/reservas-leitura-contrato.md) escrito e aceito por Marcos para o cliente; filtros, paginação, projeção mínima e acesso exclusivo de RESPONSAVEL documentados. [Aceite local](../testes/marcos-contrato-1-resultados.md) registrado no commit `7e3b629`. | Abrir PR exclusivo do documento e obter revisão de backend/segurança. Resolver os pontos abaixo; o aceite do cliente não equivale a aprovação coletiva. |
| 2. Listagem geral, detalhe, edição e cancelamento aguardam Q9 | Bloqueio já respeitado no recorte da [Marcos-3](../stories/marcos-3.md): pesquisa de recursos, seleção e criação implementadas. Nenhuma tela de listagem geral, carregamento de reserva existente para editar ou cancelamento implementada. | Fechar quem consulta e 403/404 para reserva alheia; implementar leitura autorizada, inclusive GET de detalhe, antes dessas telas. Os métodos JS de PATCH/cancelamento existentes desde a base são clientes de escrita, não fluxos de interface concluídos. |
| 3. Fila e decisões após backend integrado | A [Marcos-4](../stories/marcos-4.md) já foi adiantada localmente: cliente, tela, detalhes da projeção da fila, aprovação/rejeição, testes e capturas. Permanece sem commit/push. | A condição comunicada pela equipe pede aguardar contrato revisado, adaptador SQL, controller e segurança integrados. Preservar o trabalho local como preparação; continuidade e entrega integrada aguardam essas condições. Não tratar a tela atual como RF07 entregue. |
| 4. E2E com backend real | Playwright local cobre acesso, criação, conflitos e decisões com API interceptada. A última execução registrada da Marcos-4 contém 43 testes unitários e 124 execuções de navegador, sendo 48 da fila; [evidências](../testes/marcos-4-resultados.md). | Criar e executar suíte integrada com sessão, CSRF, HTTP e persistência reais após as dependências da equipe. Os testes atuais não demonstram esse E2E. Plano de execução abaixo. |
| 5. Datas | Atendido na camada cliente: ISO 8601 com offset nas requisições; conversão e apresentação em America/Sao_Paulo. Testes executam também com navegador em Asia/Tokyo; não se concatena offset fixo. | Preservar esse comportamento e repetir a verificação no E2E integrado. Não há correção nova de datas decorrente desta lista. |
| 6. Review do relatório/dependências do Silva | PR identificado: [#17 — atualização do relatório e dependências](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/17). Os trechos M1–M4 foram consultados para esta comparação. | A revisão completa e seu registro continuam pendentes; a consulta encontrou zero reviews. Conferir os dois documentos, especialmente a distinção entre local, branch, PR e develop. Esta leitura de contexto não é um parecer de revisão. |

## Contrato: decisões do cliente e ratificações pendentes

| Ponto | Estado observado | Próximo passo |
|---|---|---|
| Rota e status obrigatório | O cliente local sempre envia GET /api/reservas com status=SOLICITADA. O contrato ainda não explicita que ausência/outro status deve retornar 400. | Ratificar a proposta de manter essa rota com status obrigatório ou adotar rota própria. Ajustar contrato e cliente conforme a decisão; não criar listagem geral por inferência. |
| Competências de professor | O contrato deixa os campos indefinidos. A projeção atual do cliente admite id, tipo, identificação e patrimônio de material; não transporta competências extras para a interface. | Definir com Fausto/Débora se são necessárias e qual o formato antes de acrescentar campos e testes. |
| 400 / REQUISICAO_INVALIDA | Padrão já usado nas escritas e na validação local. O contrato da fila declara 400, mas não nomeia explicitamente esse código para parâmetros inválidos. O PR #15 informa que o mapeamento de ConsultaInvalidaException ainda está pendente. | Ratificar o código, explicitá-lo no contrato revisado e conferir o mapeamento real junto ao controller. |
| Q6: fora do expediente | Marcos já adotou 409/FORA_DO_EXPEDIENTE para o cliente. O handler de escrita atual também usa 409. | Falta ratificação coletiva; não alterar para 422 nem declarar Q6 encerrada. |

A seção 2 da [revisão proposta no PR #15](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/feature/rf07-fila-aprovacao-aplicacao/docs/integracao/revisao-contrato-fila-rf07.md) acrescenta pontos relevantes que não vieram expressos na lista recebida: qual identificação real do solicitante é segura, representação do tipo de recurso como String e regra de autorização do GET na URL além da checagem no caso de uso. Esses pontos também precisam da revisão da equipe. O documento está naquela branch; ainda não existe na develop nem neste checkout.

## Estado das dependências consultadas

- A [develop](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/tree/395ac734fa246452cd9429e952b3a4f3db58ca9d) permanece em `395ac73`, com PRs #1–#6 integrados. Já há repositório MySQL de reservas e serviço transacional; o que falta para a fila é seu adaptador de leitura, não toda a persistência de reservas.
- [PR #15](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/15) aberto: aplicação/porta/projeções/testes da fila com fake. SQL, controller/DTO HTTP, mapeamento do novo erro e integração de segurança permanecem fora desse PR.
- PRs de Débora [#8](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/8), [#9](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/9), [#10](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/10), [#11](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/11) e [#12](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/12) continuam abertos. A sequência indicada é autenticação → auditoria → notificações → qualidade → fechamento. Nenhum deles está integrado à develop consultada.
- [PR #17](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/17) aberto: documentos atualizados do módulo, com Marcos como revisor sugerido. M1 segue sem revisão coletiva; M2/M3 têm telas parciais; M4 continua sem E2E integrado. O adiantamento local da Marcos-4 ainda não publicado não elimina as dependências dessas linhas.
- No checkout, `recursos.api.enabled`, `movimentacoes.api.enabled` e `reservas.api.enabled` permanecem false. Nenhuma configuração foi alterada nesta conferência.

## Ordem proposta para retomar

1. Revisar os pontos de contrato com a equipe e preparar PR contendo somente `docs/api/reservas-leitura-contrato.md`. Para isolar o documento, usar branch derivada da develop com apenas esse arquivo; abrir PR da branch atual levaria também os commits de frontend. Nenhuma nova branch ou PR foi criado nesta conferência.
2. Fazer a revisão completa do PR #17 e registrar o parecer pelo Marcos. Não confundir esse PR com o commit `a10e0b5`, que corrigiu dependência npm do frontend.
3. Aguardar integração da aplicação/SQL/controller da fila e dos provedores reais de segurança, auditoria e notificação. Confirmar os contratos HTTP resultantes antes de adaptar a preparação local da Marcos-4.
4. Executar a validação integrada abaixo, registrar evidências e fazer a validação humana. Depois seguir o fluxo combinado: commit somente quando Marcos solicitar; push pelo usuário.

## Plano mínimo de E2E integrado

Preparar ambiente de teste isolado com MySQL/migrações, usuários reais de cada perfil, recursos comuns/restritos e servidor Spring. Habilitar as APIs necessárias, incluindo reservas.api.enabled=true, somente nesse ambiente e após os provedores reais estarem disponíveis. Não modificar o padrão false nem criar provedores vazios para contornar dependências.

Criar configuração/suíte que use a URL do backend e dados de teste reproduzíveis, sem interceptar /api/** nem substituir respostas por route.fulfill. Exercitar:

1. Login, sessão, me e CSRF reais; logout e expiração.
2. Criação comum APROVADA, conflito 409 e restrita SOLICITADA, conferindo as respostas e o estado persistido.
3. Leitura da fila somente como Responsável; 401 sem sessão e 403 para Solicitante/Administrador, sem exposição dos dados.
4. Aprovação e rejeição com motivo, atualização da fila e confirmação por leitura/persistência reais.
5. POST sem CSRF/CSRF inválido rejeitado pelo servidor; nenhuma escrita repetida automaticamente.
6. Datas com offset e apresentação em São Paulo, inclusive em navegador com outro fuso; desktop e móvel.

Listagem geral, GET de detalhe, edição/cancelamento e seus testes de acesso a reserva alheia entram somente após Q9 e contrato implementado. Registrar comando, commit integrado, ambiente, dados de teste, resultado e capturas; conciliar evidências com a RTM de Débora após integração, preservando os registros locais existentes.

## Verificação desta conferência

Comparação documental, inspeção dos clientes/testes/configuração e consultas de leitura ao GitHub. Nenhum código do produto foi modificado, teste reexecutado, review publicado, PR aberto, commit/push ou merge realizado. Os números de testes acima referem-se à execução já registrada da Marcos-4.
