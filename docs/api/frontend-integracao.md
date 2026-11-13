# Consumo da API pelo frontend

Aceite posterior em 12/11/2026: Marcos aprovou a revisão visual do complemento de consulta/edição/cancelamento e autorizou commit local. [Registro](../testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md). Os testes e seus hashes permanecem preservados; publicação/revisão/checks/merge e matriz integrada restante continuam separados. Menções abaixo a aceite pendente descrevem a execução anterior.

Estado atualizado em 12/11/2026: clientes e telas das etapas 1 a 5 implementados localmente, incluindo consulta/edição/cancelamento. Sessão/CSRF, reservas, fila/Q9, administração e movimentações têm provas reais nos cenários registrados. [Resultado mais recente e limites](../testes/marcos-3-consulta-edicao-resultados.md). Revisão visual do incremento novo, revisão da equipe, matriz integrada completa e checks remotos continuam pendentes. As seções de implantação original abaixo conservam seu recorte; esta atualização e os contratos mais recentes prevalecem sobre diagnósticos antigos.
Fontes: contrato de reservas, item18, ADR-001/004/006 e esclarecimentos do Marcos em 10/11/2026.

## Autenticação comunicada pela equipe

| Método/rota | Envio | Retorno |
|---|---|---|
| GET /api/auth/csrf | Sessão da mesma origem | `{token,header}` |
| POST /api/auth/login | Form URL-encoded: email, senha; CSRF dinâmico | 204; 401/CREDENCIAIS_INVALIDAS |
| POST /api/auth/logout | CSRF dinâmico e sessão | 204 |
| GET /api/auth/me | Sessão | `{usuarioId,email,papel}` |

Não usar as rotas ilustrativas `/login`, `/logout` ou `/api/me` do PDF. Todo POST/PUT/PATCH/DELETE inclui o cabeçalho informado pelo GET de CSRF. O cliente invalida seu token após login/logout; a próxima escrita o renova. Em 403, descarta o token sem repetir a ação.

`api.js` concentra fetch da mesma origem, CSRF, JSON, respostas vazias 204 e erros. `auth.js` expõe login/logout/me e conveniência visual de aprovação, exclusiva de RESPONSAVEL. Sessão/cookies HttpOnly não são lidos pelo JS. Nada é persistido em localStorage.

## Uso em uma futura tela

```js
import { reservas } from '/js/reservas.js';
import { apresentarErro } from '/js/api.js';
import { criarEnvioUnico } from '/js/forms.js';

const formulario = document.querySelector('form');
const feedback = document.querySelector('[role="status"]');
const referencia = document.querySelector('[data-referencia-suporte]');
const enviar = criarEnvioUnico(formulario); // Uma instância por formulário.

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  // Ler FormData antes de desabilitar botões; adaptar datas locais ao fuso operacional.
  const dados = obterDadosDoFormulario(); // Adaptador da tela, ainda a implementar.
  try {
    await enviar(async () => {
      const reserva = await reservas.criar(dados);
      feedback.textContent = 'Reserva registrada: ' + reserva.status;
      referencia.textContent = '';
    });
  } catch (erro) {
    const aviso = apresentarErro(erro);
    feedback.textContent = aviso.mensagem;
    referencia.textContent = aviso.referencia ? 'Referência de suporte: ' + aviso.referencia : '';
  }
});
```

O exemplo ilustra a ligação futura da UI; não é uma tela entregue. Usar `textContent` nas mensagens evita interpretar HTML da API. Não limpar campos após erro recuperável. Desabilitar botão e marcar `aria-busy` são complementados por mensagens acessíveis de carregamento na tela.

## Reservas

`reservas.criar(dados)`, `editar(id,dados)`, `cancelar(id)`, `aprovar(id)`, `rejeitar(id,motivo)` usam somente rotas contratadas.
Criar/editar recebem `{inicio,fim,recursosIds}`; datas ISO com offset e fim posterior. PATCH envia os três campos juntos. Identidade, papel e status nunca entram no corpo. Rejeição exige motivo não vazio.
A validação do cliente é amigável; o servidor revalida datas, expediente, propriedade, estado, restrição e concorrência.

401/NAO_AUTENTICADO redireciona de páginas protegidas para `/login.html?sessao=expirada`; se já estiver no login, não redireciona novamente. A tela explica sessão ausente/expirada. 401/CREDENCIAIS_INVALIDAS continua no formulário de login.
Erros expõem `status`, `codigo`, `message`, `correlationId`; apresentarErro separa mensagem da referência de suporte.
409 não é sucesso: apresentar a mensagem e manter o formulário para correção. Não fazer retry automático, inclusive para TENTE_NOVAMENTE.
O cliente aceita `correlationId` opcional em `api.requisitar`, validando o padrão do contrato.

## Testes e limites

Node 24+, npm e Playwright são ferramentas de desenvolvimento; Spring continua servindo os módulos ES sem build/Node no produto.
Na raiz, execute `npm ci` e `npx playwright install chromium` antes da suíte completa. Alternativamente, com Chrome já instalado, defina `$env:PLAYWRIGHT_CHANNEL = 'chrome'` no PowerShell.
Execute na raiz: `npm run lint`, `npm run typecheck`, `npm test`; `npm run build` agrega as verificações e não compila a interface.
ESLint verifica o JS; TypeScript verifica JSDoc com checkJs/noEmit; `npm run test:unit` usa node:test com fetch/formulários controlados. `npm run test:browser` usa Playwright com API interceptada, Chrome/Chromium real e viewports desktop/móvel. `npm test` executa ambas as suítes.

## Telas de acesso — Marcos-2

- login.html verifica me antes de habilitar o formulário. Uma sessão válida segue para index.html; uma sessão ausente permite entrar. Campos possuem labels/autocomplete, validação nativa e envio por teclado. Login continua form-urlencoded com CSRF pelo cliente existente.
- index.html mantém o conteúdo oculto até obter e validar usuarioId/email/papel. Perfis desconhecidos não revelam o painel. Erro de leitura exibe mensagem/referência e permite nova tentativa explícita do GET.
- Login/logout usam um guard por formulário e restauram o texto do botão dentro da operação protegida. Um segundo evento não altera o estado visual da primeira operação.
- Logout só informa saída após 204. Falha mantém feedback de erro; 401 aciona o fluxo central de expiração.
- Mensagens/referências e dados da sessão usam textContent. Nenhuma senha/token é persistida em storage. Parâmetros de destino externo não são aceitos.
- A navegação deriva do perfil validado. Aprovações aparece somente a RESPONSAVEL. Áreas futuras estão marcadas Em breve e não contêm links para páginas ausentes nem dados inventados.

Para inspecionar somente o layout local: `npm run preview` e abrir http://127.0.0.1:4173/login.html. O servidor serve arquivos estáticos e não simula autenticação: login real requer a aplicação Spring com o módulo de segurança integrado. Mocks estão somente em tests/browser/acesso.spec.js.

O teste de navegador desta etapa não substitui o E2E integrado. [Resultados, capturas e limites](../testes/marcos-2-resultados.md). Referências da ferramenta: [servidor de teste](https://playwright.dev/docs/test-webserver), [API controlada](https://playwright.dev/docs/network) e [Chrome instalado](https://playwright.dev/docs/browsers#google-chrome--microsoft-edge).

Na implementação original da Marcos-2, a autenticação estava separada e os GETs ausentes. Isso foi superado pela integração e pelos PRs #26/#27; ver [contrato atual](reservas-consulta-contrato.md). As flags seguem desligadas por padrão; habilitação de testes é somente local. Teste controlado do frontend continua distinto de prova real.

## Pesquisa e criação — Marcos-3

`pages/recursos.html` consulta recursos e disponibilidade; `pages/reservas.html` permite pesquisar um período, selecionar recursos e criar uma solicitação. A entrada autenticada oferece os dois links. Cadastros, movimentações, relatórios e consulta de reservas anteriores permanecem para outros recortes. O cliente da fila foi acrescentado na Marcos-4 abaixo. A sessão/navegação/logout das páginas são compartilhados em `sessao-page.js` e `navegacao.js`; os testes de acesso foram ajustados para verificar a existência dos novos destinos, mantendo as restrições por perfil.

`recursos.js` expõe `pesquisar(filtros)` e `expediente()`, usando somente GETs de recursos/funcionamento contratados no item18. A pesquisa retorna `{itens,pagina,tamanho,total}` e não é repaginada no navegador. Cada recurso mantém `{id,dados,disponivel}`. Tipos usam `PROFESSOR` no contrato e “Docente” na interface. O cliente valida o envelope antes de renderizar e não confunde `disponivel:null` com disponibilidade confirmada.

```js
import { recursos } from '/js/recursos.js';
import { intervaloDoFormulario } from '/js/datas.js';

const periodo = intervaloDoFormulario('2026-11-10T13:00', '2026-11-10T14:00', true);
const pagina = await recursos.pesquisar({ ...periodo, tipo: 'SALA', capacidadeMinima: 20,
  disponivel: true, pagina: 0, tamanho: 20 });
```

`datas.js` interpreta datetime-local no fuso `America/Sao_Paulo` com Intl, calcula o offset desse horário e recusa dias inválidos, fim não posterior, limite diário e horários ambíguos/inexistentes de transições históricas. Não depende do timezone do navegador. O expediente consultado é exibido; a API decide se o período cabe nas janelas e se há conflito. A interface não cria uma regra paralela de ocupação.

A seleção mantém recursos entre páginas/filtros do mesmo período. Alterar início/fim limpa a seleção; atualizar a pesquisa remove itens selecionados que voltarem inativos/indisponíveis. Uma resposta atrasada é descartada se os filtros mudarem enquanto a consulta está pendente. Mudanças de filtros reiniciam a página na próxima pesquisa.

Na criação, apenas `inicio`, `fim` e `recursosIds` seguem para `reservas.criar`. `confirmarCriacao` valida id, identidade da sessão, instantes, conjunto de recursos e coerência status/restrita antes de mostrar sucesso. A tela apresenta o status do servidor e não afirma entrega de notificação. Resposta inválida ou falha de rede pode ocorrer após persistência: orientar conferir o resultado, sem replay automático. Após sucesso, a ação “Fazer outra solicitação” exige nova pesquisa/seleção.

Os mocks continuam exclusivamente nos testes de navegador. `npm run preview` não cria sessão nem simula GETs/POSTs; operação real usa Spring e provedores integrados. [Story original](../stories/marcos-3.md) e [evidências históricas](../testes/marcos-3-resultados.md) cobrem pesquisa/criação; listagem/edição/cancelamento constam do complemento abaixo, após entrega real dos GETs/Q9.

## Consulta, edição e cancelamento — complemento da Marcos-3

`pages/minhas-reservas.html`, rótulo **Reservas**, está disponível aos três perfis. `consulta-reservas.js` consome somente os [GETs contratados](reservas-consulta-contrato.md), valida projeções/envelope e reutiliza `reservas.js` para escrita. Filtros: status opcional, início/fim juntos por sobreposição, recursoId, página e tamanho; identidade/escopo vêm da sessão e do servidor. Interface não repagina uma coleção global.

Toda edição/cancelamento começa por detalhe autorizado completo, com ID conferido. Dono edita SOLICITADA ou APROVADA comum; dono/Administrador cancelam SOLICITADA/APROVADA. Responsável autorizado a ler não herda ações do dono. Aprovação/rejeição continuam na fila própria. A regra de edição é o comportamento PROPOSTO já implementado no domínio; não se amplia nem se atribui ratificação coletiva.

PATCH envia somente inicio/fim/recursosIds completos. Cada data não editada usa literalmente seu ISO original, preservando segundos e até nove casas; datas editadas são convertidas de São Paulo. Todos os recursos originais permanecem selecionados entre buscas/páginas; disponibilidade ocupada pela própria reserva não os remove. Inclusões novas exigem ativo/disponível e não podem alterar a necessidade de aprovação. O servidor revalida conflitos ignorando a própria reserva. Não há parâmetro fictício de exclusão na pesquisa.

Cancelamento usa POST sem corpo e confirmação identificada; mantém histórico. Resposta de cada escrita precisa coincidir com alvo, dono, recursos, restrição, estado e instantes (comparação mantém nanossegundos). Resultado incerto/conflito invalida checkbox e bloqueia outra escrita até novo GET de detalhe bem-sucedido. Escrita confirmada seguida de falha de atualização mantém sucesso e aviso de leitura, sem replay. Campos/textos, CSRF, sessão, referência de suporte, guard e foco seguem os módulos compartilhados.

[Story](../stories/marcos-3-consulta-edicao.md), [regressão final 81/278 e E2E real 8/0](../testes/marcos-3-consulta-edicao-resultados.md). Smoke geral 16/0/0 separado; revisão visual deste incremento e checks remotos ainda pendentes. Datas/intervalos e transporte usam comparador preciso compartilhado; pesquisa de recursos em intervalo menor que 1ms conserva o limite anterior documentado no relatório.

## Cliente de fila e decisão — Marcos-4

`pages/aprovacoes.html` oferece fila, detalhes, aprovação e rejeição com motivo. A navegação oferece o link somente a RESPONSAVEL; acesso direto por Solicitante/Administrador mostra acesso negado sem consultar a fila. É uma guarda visual do cliente: autorização real continua obrigatória no servidor.

O GET segue a [especificação de fila aceita por Marcos](reservas-leitura-contrato.md), entregue no backend pelos PRs #26/#27 e validada com [10 cenários reais Q9/fila](../testes/marcos-integracao-q9-1-pr27-resultados.md). `criarAprovacoes(usuario)` fornece `listar(filtros)` e `decidir(pendente,status,motivo)`. Esse cliente específico não implementa a consulta geral/detalhe do complemento acima. O servidor exige vínculo com todos os recursos, comportamento aceito por Marcos, com ratificação coletiva e processo de vínculos ainda separados. Os filtros são período por sobreposição (início/fim juntos), recursoId e paginação; status é fixo SOLICITADA e a ordem inicio/id é do servidor. Não há filtro local de uma coleção completa.

```js
import { criarAprovacoes } from '/js/aprovacoes.js';
import { intervaloDoFormulario } from '/js/datas.js';

const cliente = criarAprovacoes(usuarioValidadoPorMe);
// O quarto argumento permite vários dias apenas no filtro de consulta.
const periodo = intervaloDoFormulario('2026-11-10T08:00', '2026-11-13T18:00', false, false);
const pagina = await cliente.listar({ ...periodo, recursoId: 103, pagina: 0, tamanho: 20 });
```

O cliente valida o envelope e a projeção mínima antes de mostrar qualquer item: SOLICITADA/restrita, datas, solicitante coerente e recursos identificados correspondentes aos IDs, incluindo patrimônio do material. A projeção é copiada por lista explícita de campos; dados extras, como email do solicitante, não passam para a interface. Detalhes vêm da própria fila, sem GET fictício por id. Os filtros invalidam detalhes/resultados e respostas atrasadas são descartadas.

A decisão usa os POSTs de `reservas.js`; aprovar não envia corpo e rejeitar envia somente motivo aparado/não vazio. A confirmação valida id, solicitante, instantes, conjunto de recursos e status esperado. Nenhum clique repetido gera replay. Depois do POST confirmado, a tela recarrega a página e, se ela esvaziar, consulta uma página anterior válida. Falha nessa leitura mantém a confirmação da decisão e apresenta o problema de consulta separadamente.

Erros de rede/resposta inválida após escrita e 409 invalidam detalhes antigos e pedem conferir/atualizar a fila. Outros erros recuperáveis preservam o motivo. Não há expiração automática de pendência, aprovação herdada pelo Administrador ou novas regras de conflito. API controlada continua somente em testes; preview não cria fila/sessão falsa e as flags do backend permanecem desligadas. [Story](../stories/marcos-4.md) e [resultados/limites](../testes/marcos-4-resultados.md).

## Administração de recursos — Marcos-5

`pages/gestao-recursos.html` reúne cadastros, bloqueios e expediente para ADMINISTRADOR. O perfil é validado por `auth.me` antes de revelar a área ou consultar dados administrativos. A navegação oferece o link apenas a esse perfil; o servidor continua responsável pela autorização real.

`administracao-recursos.js` reutiliza `api.js` e a pesquisa de `recursos.js`. Oferece obter, salvar (POST/PUT), desativar, bloqueios, bloquear, cancelarBloqueio, expediente e salvarExpediente. Os corpos usam listas explícitas de campos do item18; identidade e envelopes não são enviados. Edição depende do GET de recurso, preserva todos os campos do tipo e impede mudar tipo. Desativação lógica exige confirmação e resposta 204; conflito mantém dados e estado anterior.

Competências são linhas de texto convertidas para array; lista vazia é válida e a confirmação aceita a normalização do servidor. Condição de material é texto livre, conforme DadosRecurso. GETs e paginação vêm do servidor, incluindo os inativos visíveis ao Administrador; não se inventa filtro ativo.

Bloqueios usam recurso_id/inicio_utc/fim_utc/status, com datas contendo offset. O formulário converte em São Paulo e aceita vários dias. Cancelamento identifica o bloqueio e exige confirmação. Uma escrita confirmada seguida de falha na atualização da lista não é repetida automaticamente.

Expediente é uma lista completa de janelas LocalTime: não são datas UTC. O editor mantém dias e precisão dos horários, permite múltiplas janelas, verifica sobreposição e pede confirmação para substituir tudo. Lista vazia fecha o funcionamento. Sem GET válido, o formulário de substituição permanece oculto. O backend revalida conflitos com reservas.

As ações da área são serializadas enquanto houver requisição pendente, evitando troca de alvo durante leitura ou gravação. Guard por formulário, CSRF dinâmico, mensagens textContent e referência de suporte seguem os módulos existentes. Falhas recuperáveis preservam os campos; rede/resposta incoerente orientam consultar o estado antes de reenviar.

Não inclui movimentações, consultas de reservas nem fila. Q9 e Marcos-4 continuam independentes deste recorte. Não foram alterados Java, configuração, dependências npm ou flags. A validação usa API interceptada exclusivamente nos testes; integração real permanece pendente. [Story](../stories/marcos-5.md) e [resultados](../testes/marcos-5-resultados.md).

## Movimentações — complemento da etapa 5

`pages/movimentacoes.html` consulta retiradas abertas para RESPONSAVEL e ADMINISTRADOR. Somente RESPONSAVEL recebe formulários de retirada/devolução. O perfil de `auth.me` é conferido antes de qualquer consulta de dados. A sessão, navegação, CSRF e erros seguem os módulos compartilhados; a guarda visual não substitui a segurança do servidor.

`movimentacoes.js` usa GET /api/movimentacoes?abertas=true e valida o array simples, sem inventar filtros/paginação. Este recorte não consulta histórico completo. Instantes `Z` ou com offset são aceitos e exibidos em São Paulo. O par devolvidoEm/devolvidoPor deve estar nulo nas abertas e preenchido nas devolvidas. A lista recusa duplicatas/inconsistências; falha de atualização preserva a última lista confirmada com aviso.

Para retirada, o usuário informa o número da reserva do comprovante, pesquisa MATERIAL por patrimônio, pagina pelo servidor e escolhe explicitamente a unidade. Seleção/página/patrimônio/número da reserva invalidam confirmações anteriores. O POST /api/movimentacoes/retiradas envia somente reservaId e recursoId; o servidor valida vínculo, reserva APROVADA/EM_USO, horário, material ativo e ocupações. A pesquisa não comprova essas condições. Não foi criado GET de reservas nem seletor de reservas sem contrato/Q9.

As pendências consultam GET /api/recursos/{id} para identificação legível em pequenos lotes, sem bloquear a operação. Falha, cadastro inacessível ou material inativo não apagam a pendência nem impedem a devolução: o número do material permanece como referência. Respostas antigas de identificação/pesquisa não contaminam consultas posteriores.

O backend mantém atrasoSegundos zero nas retiradas abertas. A interface identifica prazo ultrapassado pelo relógio do navegador como estimativa e mantém a retirada aberta. Não libera o material pela passagem do prazo. Após devolução, o atraso final exibido vem exclusivamente da resposta da API.

Devolução exige confirmação identificando movimentação, reserva e material, e envia POST /api/movimentacoes/{id}/devolucao sem corpo. O retorno idempotente pode registrar outro operador; a UI mostra devolvidoPor da resposta e não atribui falsamente a ação ao usuário atual. Escrita confirmada seguida de falha de GET mantém a confirmação da escrita e o aviso de atualização, sem repetir POST nem prometer nova disponibilidade/notificação.

As operações usam um guard por formulário e bloqueio da área durante requisições para impedir envios simultâneos/troca de contexto. Campos e pendências são preservados em falhas recuperáveis. Mocks continuam somente nos testes; não houve alteração de Java, application.yml, flags ou dependências. A administração/PR 20 segue separada na branch anterior. [Story de movimentações](../stories/marcos-5-movimentacoes.md) e [evidências e limites](../testes/marcos-5-movimentacoes-resultados.md).
