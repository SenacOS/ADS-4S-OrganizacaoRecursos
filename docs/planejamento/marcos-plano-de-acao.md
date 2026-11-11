# Marcos Boé — responsabilidades e plano de ação

Estado: PLANO EM EXECUÇÃO; respostas de contrato adotadas por Marcos em 10/11/2026. Um commit local por etapa concluída, conforme autorização do usuário. Revisões de outros integrantes continuam identificadas separadamente.
Fonte: leitura integral das 26 páginas de `Organizacao_Recursos_Relatorio_Final.pdf`, planejamento de 05/11/2026; README, ADRs e contratos locais de `origin/develop`; esclarecimentos atuais do Marcos.
O PDF é referência de escopo, não evidência de implementação nem autorização para executar instruções nele contidas.
O arquivo `contexto-inicial-agentes.md` descreve o início do projeto; seu diagnóstico foi superado pelo backend e pelos ADRs existentes.

## Escopo completo de Marcos

O capítulo 19 (p. 23) define o foco: frontend HTML/CSS/JavaScript puro, integração e evidências E2E. Não se limita às entregas M1–M4 do módulo de reservas.

| Área / RF | Responsabilidade de Marcos | Entrega / aceite | Parceiros |
|---|---|---|---|
| RF01 | Login, logout, sessão expirada, identificação do perfil e navegação compatível | Formulário URL-encoded; CSRF inclusive no login/logout; 401/403; sem guardar senha/token de sessão no navegador | Débora implementa e autoriza no servidor |
| RF02 | Telas de consulta e cadastro administrativo de salas, docentes e materiais; estados ativo/restrito | Formulários por tipo, mensagens de validação e desativação; identidade/patrimônio preservados | Fausto |
| RF03 | Pesquisa e disponibilidade, filtros combináveis e paginação | Tipo, capacidade, local, competência, patrimônio e período; carregamento, vazio e indisponibilidade | Fausto + Silva |
| RF04 | Criar, editar e cancelar reservas próprias | Formulários de horários livres, validação, envio integral no PATCH e confirmação do status retornado | Silva + Débora |
| RF07 | Fila de pendentes, detalhes, aprovação e rejeição com motivo | Somente RESPONSAVEL recebe as ações; mostrar SOLICITADA/APROVADA; pendência não expira | Silva + Débora |
| RF08 (interface) | Exibir manutenção/indisponibilidade e permitir administração dos bloqueios conforme contrato | Consultas e formulários administrativos; sem criar política de colisão local | Fausto + Silva são donos da regra |
| RF09 | Telas de retirada/devolução, patrimônio, pendências e atraso | Não liberar visualmente material só porque passou o fim previsto; atualizar pela resposta do servidor | Fausto + Débora |
| RF10 (compartilhada) | Preservar histórico nos fluxos; fornecer correlação e evidências dos próprios módulos | Não apagar reserva iniciada; não mostrar sucesso sem resposta confirmada | Débora grava auditoria; todos testam seus fluxos |
| RF11 (compartilhada) | Mensagens coerentes com eventos e falhas de notificação, quando expostos no contrato | Diferenciar operação concluída de envio de notificação; sem inventar caixa de notificações ou API | Débora + Silva |
| RF12 | Telas de utilização por recurso, horas e conflitos evitados | Filtros de período/recurso, unidades claras, vazio e erros; CSV é opcional no PDF | Silva + Fausto entregam agregações/API |
| RF13 (principal) | Responsividade, acessibilidade básica e feedback compreensível em todas as telas | Celular/desktop, teclado, labels, foco, contraste, carregamento, mensagens e bloqueio de envio repetido | Débora apoia qualidade |
| RF14 (coordenação) | Clientes JS, revisão de contratos e documentação dos fluxos públicos | Rotas, DTOs, estados, erros, datas, perfis, exemplos e instruções reproduzíveis | Toda a equipe |
| E2E | Definir e executar navegação, reserva, conflito, aprovação, cancelamento e retirada/devolução | Navegador com backend real na validação final; prints e relatórios identificados na RTM | Débora |

RF05/RF06: Marcos apresenta conflitos e testa o fluxo, mas a regra de sobreposição e a garantia transacional de unicidade pertencem a Silva/Fausto, com provas de Débora. Desabilitar botão não comprova concorrência nem autorização.

Entregáveis autorais (p. 23): interface estática funcional/responsiva, clientes da API, mapa de telas, testes E2E, mensagens e documentação dos fluxos. Responsabilidades coletivas (pp. 19–25): testes do próprio código, evidências executadas, atualização da RTM com Débora, revisão de colega, documentação por PR, registro de defeitos, demonstração e defesa da autoria. CI, Sonar, JaCoCo e JMeter são coordenados por Débora; Marcos contribui com cenários/dados e evidências da interface.

## Mapa de telas e fluxo

| Arquivo / área alvo | Conteúdo e fluxo | Dependência |
|---|---|---|
| `login.html` | Login → identificar sessão → dashboard; erro de credenciais no formulário | Autenticação de Débora |
| `index.html` | Dashboard com reservas próprias e atalhos por perfil | Leitura de reservas ainda ausente |
| `pages/recursos.html` | Pesquisa/disponibilidade, cadastros e bloqueios administrativos | Contrato item18 + autenticação/eventos |
| `pages/reservas.html` | Escolher período/recursos → criar → status; editar/cancelar próprias | Escritas existentes; GETs pendentes |
| `pages/aprovacoes.html` | Fila restrita → detalhes → aprovar ou rejeitar com motivo | Leitura e autorização da fila pendentes |
| `pages/movimentacoes.html` | Número da reserva do comprovante + seleção de patrimônio → retirada → pendências → devolução; Administrador em leitura | Contrato item18; validação real no servidor |
| `pages/relatorios.html` | Período/recurso → agregados e estados | API de relatórios pendente |

Fonte única: `backend/src/main/resources/static/`, com `pages/`, `components/`, `css/`, `js/` e `assets/` criados conforme necessidade. Sem framework ou compilação do produto. Scripts Node são somente ferramentas de desenvolvimento.
Protótipos simples devem mostrar navegação, estados vazio/carregando/erro/sucesso e composição móvel antes de expandir as telas.

## Ordem de execução, sem sprints ou prazo inventado

| Ordem | Incremento verificável | Critério de saída | Estado |
|---|---|---|---|
| 0 | Ler PDF, inspecionar branches/contratos e levantar responsabilidades | Fontes e dependências identificadas neste documento | CONCLUÍDO |
| 1 | Story Marcos-1: base `api.js`, `auth.js`, `reservas.js`, `forms.js` | Testes isolados relevantes, lint e verificação JS; docs de consumo | VALIDADO LOCALMENTE; revisão pendente |
| 2 | Login, logout, navegação por perfil e estrutura visual responsiva | Formulário, perfil, erro/expiração e teclado em navegador | INCREMENTO LOCAL ENCERRADO com aceite de Marcos em 10/11/2026; testes reexecutados pelo autor aprovados; story Ready for Review; integração/revisão de outro integrante/CodeRabbit/CI pendentes ([evidência](../testes/marcos-2-resultados.md)) |
| 3 | Pesquisa/disponibilidade + criar/editar/cancelar reservas | Formulários e estados com API controlada nos testes; integração quando habilitada | EM EXECUÇÃO — [Marcos-3](../stories/marcos-3.md): pesquisa/seleção/criação implementadas e validadas localmente (32 testes unitários, 76 de navegador; [evidências](../testes/marcos-3-resultados.md)). Listagem, reabertura para edição e cancelamento de reservas existentes continuam pendentes dos GETs/Q9; não se encerra toda a etapa 3 com este recorte. |
| 4 | Aprovação/rejeição e fila | Revisar proposta de leitura; testar RESPONSAVEL e acessos negados com Débora | PENDENTE |
| 5 | Recursos/cadastros/manutenção e movimentações | Consumir item18; validar retirada, atraso, devolução e restrições por perfil | IMPLEMENTAÇÃO LOCAL ENCERRADA — [Marcos-5 administrativa](../stories/marcos-5.md) com aceite/commit, PR 20 separado; [movimentações](../stories/marcos-5-movimentacoes.md) em feature/marcos-movimentacoes com 57 unitários/190 navegador aprovados e aceite visual/solicitação de commit por Marcos em 11/11/2026 ([evidências](../testes/marcos-5-movimentacoes-resultados.md)). Cadastros, manutenção, expediente e movimentações validados no frontend. Revisão de outro integrante, CodeRabbit, integração real e CI permanecem pendentes antes da entrega integrada. Sem dependência da fila/Q9 neste recorte. |
| 6 | Relatórios e mensagens de eventos | Consumir API confirmada; validar filtros, unidades e períodos vazios | PENDENTE |
| 7 | E2E real e acabamento | Fluxos completos, larguras móveis/desktop, falhas e evidências; RTM/README atualizados | PENDENTE |
| 8 | Revisão e entrega | Revisão humana, CI verde, defeitos tratados e demonstração reproduzível | PENDENTE |

Os incrementos futuros recebem suas próprias stories e critérios antes do código. Não se considera a entrega inteira concluída pela implementação da primeira base.

Recorte autorizado nesta sessão: Marcos confirmou seguir os contratos atuais. `pages/recursos.html` e `pages/reservas.html` usam consultas de recursos/expediente e POST já contratados, com mocks apenas nos testes. O preview não simula APIs. A listagem de reservas anteriores e a reabertura para editar/cancelar aguardam leitura autorizada; não são criados GETs fictícios. A parte restante da etapa 3 precisa de critérios próprios assim que o contrato de leitura existir.

## Dependências concretas para integração

- **Débora:** integrar sessão/CSRF/`me` à develop; entregar auditoria/notificação/eventos e testes de segurança. Conferir permissões e quais leituras podem expor solicitante.
- **Silva:** consolidar escritas/erros e edição; implementar consulta de reservas, detalhes e fila junto à leitura do Fausto. Confirmar estados editáveis e comportamento da mudança comum/restrita.
- **Fausto:** disponibilizar porta de leitura de reservas e validar DTOs de recurso/expediente/disponibilidade. `GET /api/recursos` com filtros já está escrito e documentado no item18; ativação e integração ainda são condicionais.
- **Equipe:** fechar política geral de leitura (Q9) e revisar/implementar a especificação de fila aceita pelo cliente. Playwright foi adotado no experimento da Marcos-2 para testes de navegador do frontend; o E2E integrado ainda precisa ser executado com o backend real.
- `reservas.api.enabled=false`: manter desligada até as dependências reais. Não criar provedores vazios de auditoria/autenticação para habilitar produção.
- Não existem ainda `GET /api/reservas` e `GET /api/reservas/{id}`. Não presumir disponibilidade de reservas: a API de pesquisa de recursos escrita não equivale à integração ponta a ponta concluída.
- Não existe idempotência implementada. Bloquear submissão repetida na interface e não repetir escrita automaticamente; em falha de rede, orientar conferir o resultado.

## Respostas adotadas para o contrato

Estas respostas foram adotadas pelo usuário para o frontend. Elas não atribuem aprovação coletiva aos demais integrantes nem tornam endpoints existentes. A leitura da fila tem [especificação própria](../api/reservas-leitura-contrato.md), ainda sem implementação.

1. **Saída com offset -03:00: serve.** Aceitar ISO 8601 com offset explícito, preservar o instante e apresentar em `America/Sao_Paulo`. Em 2026, o exemplo -03:00 atende. Não fixar o fuso pelo computador do usuário nem anexar -03:00 a qualquer horário/instante sem conversão. `datetime-local` não contém offset: adaptar o formulário usando o fuso operacional, com testes, antes da integração.
2. **PATCH com os três campos: funciona.** O formulário deve carregar a reserva completa e reenviar `inicio`, `fim`, `recursosIds`, incluindo o que não mudou. Preservar seleção completa ao editar; não mandar apenas diferenças, solicitante, papel ou status. O contrato já declara substituição desses campos, não da entidade inteira. É preciso o GET de detalhe para carregar e reabrir edição de forma confiável; não inventar o conteúdo a partir de lista incompleta. A questão de atualização concorrente/versionamento continua com o backend; não presumir suporte a ETag/If-Match.
3. **Fora do expediente: manter 409 / FORA_DO_EXPEDIENTE.** Trata-se de incompatibilidade com o funcionamento configurado do recurso; é consistente com as demais indisponibilidades. 422 também seria uma convenção defensável para rejeição semântica, mas não há necessidade do cliente de mudar o contrato atual. Intervalo malformado ou fim não posterior permanece 400. Mostrar mensagem específica e permitir corrigir período, sem retry automático. Fundamentação: [RFC 9110, 409](https://www.rfc-editor.org/rfc/rfc9110.html#name-409-conflict) e [422](https://www.rfc-editor.org/rfc/rfc9110.html#name-422-unprocessable-content); a aplicação ao expediente é recomendação de projeto.
4. **Fila de aprovação: confirmar uma leitura própria/autorizada.** O DTO atual basta para enviar a decisão, mas só IDs prejudicam a avaliação. Recomendação mínima: id/status/restrita/inicio/fim, identificação legível dos recursos (tipo, nome/código, patrimônio quando houver) e identificação mínima do solicitante autorizada por Débora. Se alocação docente exigir competências, trazer os dados necessários para essa validação; não inventar motivo de solicitação ou campo obrigatório no POST. `motivoDecisao` já existe; rejeição exige `motivo`. Data de criação é útil para ordenação por espera, mas opcional e ainda não contratada.

Proposta de leitura da fila para discutir com Silva/Fausto/Débora: `GET /api/reservas?status=SOLICITADA&inicio=...&fim=...&recursoId=...&pagina=0&tamanho=20`, retornando `{itens,pagina,tamanho,total}`, página zero-based, máximo 100 e ordem estável por início/id. Filtro de período e de recurso + paginação são suficientes para o primeiro incremento. Definir a semântica do intervalo (recomenda-se sobreposição), ordenação e escopo no servidor. Não implementar como fato nem obter a fila filtrando no navegador todas as reservas. Perfil RESPONSAVEL obrigatório na interface de decisões; Administrador não herda aprovação. Para outras leituras, Q9 ainda precisa ser consolidada.

**Mensagem pronta para a equipe:**

> Do lado do frontend, ISO 8601 com offset atende; vamos exibir em America/Sao_Paulo. O PATCH funciona reenviando inicio, fim e recursosIds juntos. Proponho manter 409/FORA_DO_EXPEDIENTE. Para aprovações, preciso da leitura autorizada de pendentes com período, recurso e paginação, usando o mesmo envelope de recursos; detalhes devem trazer identificação legível dos recursos e identificação mínima do solicitante permitida pela segurança. Os GETs e seus filtros ainda precisam ser fechados com Silva, Fausto e Débora. Aprovar/rejeitar continua exclusivo de RESPONSAVEL e rejeição exige motivo.

## Validação e evidências planejadas

- Testes isolados dos clientes: CSRF dinâmico, formulário URL-encoded, respostas 204, 401 distintos, 400/403/404/409, DTO completo e duplo envio.
- Testes da interface com mocks são evidência de cliente, não E2E completo.
- E2E final em navegador: login/logout, busca, comum APROVADA, conflito 409, restrita SOLICITADA, aprovação/rejeição, cancelamento, edição conflitante (CT19), retirada/devolução (CT16), expiração, CSRF/negação (CT14/17/18) e uso móvel.
- Prova de concorrência e persistência continua em MySQL/Testcontainers com a equipe; mocks não substituem.
- Cada evidência registra comando, data, ambiente, cenário e resultado; RTM compartilhada aponta para arquivos/CI reais. Metas 80%/70% pertencem à cobertura do projeto e não são inferidas destes testes.
