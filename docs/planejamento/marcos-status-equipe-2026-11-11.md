# Status das entregas de Marcos — frontend e reservas

**Atualização: 11/11/2026.** Resposta à lista de pendências da equipe para RF04/RF07, com as entregas e dependências do frontend.

Atualizado após o [relatório do trabalho em outra máquina](relatorio-marcos-2026-11-11.md) e a conciliação autorizada por Marcos. Base publicada em `feature/marcos-base-frontend` (`a10e0b5`); administração em `feature/marcos-5-administracao-recursos` (`c395541`); movimentações em `feature/marcos-movimentacoes` (`f7360a2`). A Marcos-4 está conciliada em checkout separado, branch `feature/marcos-4-aprovacoes`, base `f7360a2`, com commit solicitado após a reexecução aprovada e publicação ainda separada. A pasta original foi preservada.

## Entregas já realizadas

- **Marcos-1:** clientes de API/autenticação/reservas, tratamento de erros, CSRF dinâmico e proteção contra envio duplicado pelo formulário.
- **Marcos-2:** login, logout, identificação da sessão, navegação por perfil e layout responsivo. Incremento local aceito por Marcos.
- **Marcos-3:** pesquisa e disponibilidade de recursos, seleção e criação de reservas comuns/restritas, com confirmação da resposta e tratamento de falhas.
- **Etapa 5 — administração:** cadastros de recursos, manutenção/bloqueios e expediente; aceite local do Marcos registrado, commit `c395541`, [PR #20](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/20) em Draft.
- **Etapa 5 — movimentações:** retirada, pendências e devolução; aceite local do Marcos registrado, commit `f7360a2`, [PR #21](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/21) em Draft.
- **Dependências de desenvolvimento:** correção da vulnerabilidade do minimatch mantendo a versão principal do ESLint em 10.

Esses incrementos estão publicados em branches separadas. O [PR #19](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/19) contém a base; #20 usa essa base e #21 usa a administração. Os três continuam abertos na consulta de 11/11/2026. A etapa 5 já compõe a base do checkout separado da Marcos-4. A validação é local; integração com backend real, revisão da equipe e CI permanecem pendentes.

## Resposta às seis pendências

| Pendência | Status de Marcos | Próximo passo |
|---|---|---|
| 1. Contrato de leitura da fila | Documento escrito e aceito para consumo pelo frontend. Revisão coletiva pendente. | Abrir PR exclusivo de `docs/api/reservas-leitura-contrato.md` para develop e fechar os pontos de contrato abaixo. |
| 2. Q9 e listagem/detalhe/edição/cancelamento | Política de escopo decidida, conforme comunicação de Marcos. As telas de reservas existentes continuam sem implementação. | Consolidar contratos e implementar GETs autorizados aplicando a decisão, inclusive detalhe para carregar todos os campos do PATCH. |
| 3. Fila de aprovação/rejeição | Marcos-4 conciliada com a etapa 5 e validada localmente; reexecução do autor aprovada e commit solicitado por Marcos. | Publicação/revisão do incremento local; contrato revisado, SQL/controller/segurança e E2E real continuam necessários à entrega integrada. O pedido de commit não descreve separadamente uma revisão visual. |
| 4. E2E integrado | Pendente. Os testes Playwright atuais usam API simulada. | Executar com Spring, MySQL, sessão e CSRF reais após integração das dependências. |
| 5. Datas | Atendido no cliente: requisições ISO 8601 com offset e apresentação em America/Sao_Paulo, com testes usando navegador em outro fuso. | Preservar e conferir novamente no teste integrado. |
| 6. Revisão do relatório/dependências do Silva | PR identificado; revisão completa e registro do parecer pendentes. | Revisar o [PR #17](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/17), especialmente as linhas M1–M4 e os limites das evidências. |

## Pontos de contrato a fechar com a equipe

- **Rota da fila:** manter `GET /api/reservas?status=SOLICITADA`, exigindo esse status e retornando 400 quando ausente/inválido, ou definir rota própria. O cliente local sempre envia SOLICITADA.
- **Projeções:** definir os campos de competência de professor, se necessários, e a identificação mínima do solicitante permitida pela segurança. Confirmar o formato do tipo de recurso e a autorização do GET na URL, além da checagem no caso de uso.
- **Parâmetros inválidos:** confirmar 400 com `REQUISICAO_INVALIDA` e mapear a exceção de consulta junto ao controller.
- **Q6:** Marcos já adotou 409 / `FORA_DO_EXPEDIENTE` para o frontend; falta ratificação coletiva.
- **Q9 — escopo decidido:** Solicitante consulta suas reservas; Responsável, as dos recursos sob sua responsabilidade; Administrador, todas. Ver [política registrada](../api/reservas-politica-leitura-q9.md). Falta aplicar nos contratos/servidor; a comunicação recebida não especifica 403/404 fora do escopo. Consulta não concede aprovação ou outras escritas ao Administrador.

## Dependências para retomar a Marcos-4

Na consulta de 11/11/2026, a develop permanece em `395ac73`. A camada de aplicação da fila está no [PR #15](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/15), ainda aberto, com testes usando fake. Faltam o adaptador SQL da fila (Fausto), controller/DTO HTTP e mapeamento de erros (Silva), além da revisão/autorização e integração dos provedores reais (Débora, com a equipe).

As entregas de segurança, auditoria, notificação e qualidade de Débora estão na cadeia de PRs [#8](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/8) → [#9](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/9) → [#10](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/10) → [#11](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/11) → [#12](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/12), ainda não integradas à develop consultada. As APIs continuam desligadas por padrão.

## Evidências disponíveis e validação restante

As execuções anteriores pertencem a conjuntos de código diferentes: Marcos-3 publicada, 32 unitários/76 navegador; preparação original da Marcos-4, 43/124; administração, 45/130; movimentações com administração, 57/190. Foram preservadas separadamente. Na nova conciliação, `npm run build` passou com **68 unitários e 238 execuções de navegador**, reunindo as etapas 4 e 5, com zero falhas/ignorados/retries na rodada final. Uma primeira falha de setup do Chrome e seis diagnósticos aprovados estão registrados nas [evidências conjuntas](../testes/marcos-4-conciliacao-resultados.md). Não se somam as contagens históricas como se fossem uma nova execução.

Esses testes verificam o comportamento do frontend com API controlada. Permanecem pendentes a validação humana da Marcos-4 e o E2E com autenticação, autorização, CSRF, persistência e transações reais.

A conciliação do frontend está validada localmente, com reexecução apresentada por Marcos: lint/typecheck, 68 unitários e 238 testes de navegador aprovados em 6,3 min no checkout conciliado. [Evidência do autor](../testes/marcos-4-conciliacao-verificacao-marcos.txt). Marcos solicitou o commit após a reexecução aprovada; a revisão visual não foi descrita separadamente. O push permanece com o usuário. Para a entrega integrada, falta fechar os contratos e integrar as dependências, adaptar o cliente ao contrato final e validar login, criação comum/restrita, conflito, fila, aprovação/rejeição e acessos negados com backend real. Edição/cancelamento aguardam GETs e autorização que apliquem a Q9 já comunicada. As novas evidências foram acrescentadas à RTM local; sua conciliação com a RTM da equipe continua necessária na integração.
