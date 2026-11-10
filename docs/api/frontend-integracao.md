# Consumo da API pelo frontend

Estado: IMPLEMENTAÇÃO INICIAL. Escopo: clientes de escrita e autenticação, sem telas ou integração real.
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

401/NAO_AUTENTICADO redireciona para `/login.html` (tela do próximo incremento); 401/CREDENCIAIS_INVALIDAS continua no formulário de login.
Erros expõem `status`, `codigo`, `message`, `correlationId`; apresentarErro separa mensagem da referência de suporte.
409 não é sucesso: apresentar a mensagem e manter o formulário para correção. Não fazer retry automático, inclusive para TENTE_NOVAMENTE.
O cliente aceita `correlationId` opcional em `api.requisitar`, validando o padrão do contrato.

## Testes e limites

Node 24+ e `npm ci` são ferramentas de desenvolvimento; Spring continua servindo os módulos ES sem build/Node no produto.
Execute na raiz: `npm run lint`, `npm run typecheck`, `npm test`; `npm run build` agrega as verificações e não compila a interface.
ESLint verifica o JS; TypeScript verifica JSDoc com checkJs/noEmit; node:test usa fetch/formulários controlados em testes isolados.

A autenticação ainda está em branch separada e reservas estão desligadas. Não há GET de reservas/detalhes nem cliente inventado para eles. Fila e formulário de edição dependem desses contratos. Nenhum resultado de teste isolado comprova segurança do servidor, cookie real, corrida no banco ou E2E.
