# Complemento real de fechamento — etapas 1 a 5

**Formato de integridade atualizado em13/11/2026:** os três JSONs históricos sinalizados pelo Sonar agora usam `versaoFormato:2` e `artefatos:[{arquivo,algoritmo,digest}]`. São os mesmos35pares SHA256 de cada original5537163; demais campos/resultados permaneceram idênticos. [Equivalência e correções](marcos-qualitygate-1-resultados.md). Os hashes antigos dos auxiliares continuam identificando a execução original, não a implementação corrigida de13/11. Novas reexecuções/hashes têm provas próprias no relatório da correção.

**Aceite posterior:** Marcos aprovou a revisão das evidências e da sequência de entrega em12/11/2026. [Registro e alcance](marcos-fechamento-e2e-1-aceite-2026-11-12.md). Sem alteração de produto/auxiliares ou nova execução; as menções abaixo a aceite do autor pendente são históricas. Commit/publicação/revisão da equipe/checks/merge continuam separados.

Execução em **12/11/2026**, Windows, branch **test/marcos-fechamento-e2e**, criada sobre **0775715d5a769d726e5cc63dc1b4125747084ff8** após confirmação do push de Marcos. Helpers/documentação deste incremento ainda sem commit. Produto, configuração, dependências e testes da regressão frontend permanecem inalterados. [Story](../stories/marcos-fechamento-e2e-1.md).

## Escopo e ambiente

Chrome instalado headless, Spring/JAR e MySQL reais, sem interceptação de API, substituição de autenticação, alteração de relógio ou gravação SQL de preparação. SQL usado apenas para SELECTs restritos aos IDs/recursos exclusivos da rodada. Recursos e reservas são criados por HTTP autorizado; dados anteriores preservados. O expediente existente é consultado, sem sobrescrevê-lo neste complemento.

Instância principal em `127.0.0.1:18080`, base isolada em `127.0.0.1:13307`, JDK21.0.13+9 e MySQL8.4.13. Segunda instância do **mesmo JAR** em `127.0.0.1:18081`, timeout **1m**, cookie próprio `QS_FECHAMENTO_SESSION`, contextos exclusivos e worker desligado. Flags/configuração somente no processo; sem modificar application.yml, Java, migrações, serviços Windows ou PATH persistente. Estado/logs/PID/CreationDate da temporária são privados e separados do controle principal.

`node --check` dos dois auxiliares e execução real são os gates deste incremento. O build anterior **81 unitários/278 navegador** foi preservado por hashes, sem repetir a suíte por mudança somente em auxiliares/documentação. O JAR já empacotado foi reutilizado: **32 fontes estáticas servidas** conferidas por SHA256 em ambas as instâncias, além do hash do JAR e dos helpers. Nenhum novo package, clean verify, Testcontainers ou check remoto é atribuído a esta rodada.

## Cenários da rodada final

**11 PASS / 0 FAIL**, execução final **19:51:26–19:52:44 UTC** (16:51:26–16:52:44 de São Paulo). Chrome **157.0.8103.78**. Consultar [JSON final](marcos-fechamento-e2e-1/resultados-final.json) para estados, tempos e evidências de cada caso, e [manifesto dos auxiliares](marcos-fechamento-e2e-1/arvore-testada.json) para a árvore ainda sem commit. A contagem não é meta de cobertura global.

| Cenário | Camada / prova |
|---|---|
| Fontes e regressão anterior | SHA256 dos arquivos servidos e fontes/testes do manifesto anterior; produto preservado. |
| Login inválido e CSRF real | Formulário móvel, Enter, 401 CREDENCIAIS_INVALIDAS, mensagem/referência; autenticação externa no mesmo BrowserContext rotaciona token real; formulário com token anterior recebe403; só nova ação explícita renova e entra204. Não altera fetch/cabeçalhos nem inventa resposta. |
| Instância temporária | Porta inicialmente livre, loopback/cookie/nome exclusivos, executável/JAR/CreationDate conferidos e fontes correspondentes. |
| Inatividade de sessão | Mais de65s sem chamadas do contexto autenticado, sem logout/limpeza de cookies; cookie mantido até nova requisição. GET me no mesmo contexto retorna401/NAO_AUTENTICADO; reload da UI recebe401 e redireciona ao login com mensagem de expiração. |
| Massa e expediente | 21 materiais de prefixo exclusivo, criados pela API; expediente real consultado. |
| Disputa de criação | Duas sessões independentes com CSRF próprio enviam simultaneamente o mesmo recurso/intervalo: um201 e um409/RECURSO_INDISPONIVEL; SELECT mostra uma única reserva/associação ocupante. Prova HTTP+SQL, não dois cliques de UIs ou carga geral. |
| Pesquisa real | Filtro de período/patrimônio e páginas20/1, vazio por prefixo exclusivo inexistente, recurso ocupado indisponível e checkbox desabilitado; viewport390×844 sem overflow. |
| Estado alterado após GET | Dono abre editor, Administrador cancela pela API, duplo clique de salvar produz só umPATCH403; mensagem/correlationId, confirmação invalidada, reconsulta CANCELADA e editor oculto; SQL confere estado. Foco ao abrir e viewport1366×900 observados. |
| Movimentação com atraso | Retirada pela UI antes do fim, espera real até ultrapassar prazo, pendência continua aberta, estimativa do navegador; Administrador consulta sem ações e POST de devolução403 não muda registro. Responsável devolve, API retorna atraso positivo/operador e SQL confirma; pendência sai das abertas. Foco da confirmação e viewport390×844 observados. |
| JavaScript | Nenhum pageerror nos contextos acompanhados. Não equivale a toda combinação de navegadores/dispositivos. |
| Encerramento | Somente Java temporário encerrado após validar identidade; porta18081 livre, bytes de state.json principal preservados e principal HTTP/MySQL pronto. |

Capturas finais: [login/CSRF móvel](marcos-fechamento-e2e-1/login-csrf-mobile.png), [sessão expirada](marcos-fechamento-e2e-1/sessao-expirada.png), [pesquisa móvel](marcos-fechamento-e2e-1/pesquisa-real-mobile.png), [estado concorrente](marcos-fechamento-e2e-1/estado-concorrente.png), [prazo ultrapassado](marcos-fechamento-e2e-1/prazo-ultrapassado-mobile.png) e [devolução atrasada](marcos-fechamento-e2e-1/devolucao-atrasada-mobile.png). Captura automatizada não é novo aceite visual de Marcos.

Na rodada final foram criados recursos #93–#113; reserva concorrente #94 e reserva de movimentação #95. A movimentação #11 permaneceu aberta depois do fim16:52:04.456(-03:00) e foi devolvida16:52:07.454647, com **atraso final2s** e operador3 confirmados por API/SQL. A inatividade medida foi **65.296ms**; a porta18081 ficou livre no encerramento e a principal permaneceu pronta. IDs são da massa local, não fixtures para reutilização em outra máquina.

## Tentativas preservadas

1. **19:46:37 UTC — INCOMPLETA.** Primeiro cenário PASS gravado; após login inválido, seletor do botão esperava nome acessível antigo, enquanto a página restaurava o rótulo como Entrar↗. A espera de resposta rejeitou enquanto o clique ainda aguardava e interrompeu o registro final. Corrigidos seletor estável do submit e tratamento imediato da promise no auxiliar. Não havia instância temporária nem massa de recursos criada. [JSON parcial e observação](marcos-fechamento-e2e-1/tentativa-incompleta.json). Não é uma rodada aprovada nem um defeito funcional demonstrado do produto.
2. **19:48:00 UTC — 9 PASS / 1 FAIL.** Servidor retornou401 após a inatividade, mas o Chrome descartou o corpo durante redirecionamento e `response.json()` falhou com Network.getResponseBody. Encerramento da temporária e preservação do principal passaram. [Resultado integral](marcos-fechamento-e2e-1/tentativa-coleta.json). Ajustada coleta: ler código do erro por p.request no mesmo contexto após a espera, depois provar401/redirecionamento da UI sem pedir corpo descartado. Assert de cookie passou a booleano para nunca imprimir valores numa falha. Nenhuma mudança de produto.
3. **Rodada final:** incorpora essas correções e comprovação de um únicoPATCH após duplo clique; massas próprias, sem replay das escritas anteriores. Tempos, contagens e hashes ficam no JSON final.

## Matriz de fechamento e limites

| Área do plano | Evidência disponível | O que permanece separado |
|---|---|---|
| Acesso/CSRF/sessão | Smoke16/0/0 anterior + login inválido/CSRF/UI/timeout deste complemento | Mais combinações de navegador/dispositivo e políticas de implantação. |
| Pesquisa e disponibilidade | Smoke anterior, regressão controlada e páginas/vazio/ocupado reais deste complemento | Carga e todas as combinações de filtros/regras de expediente. |
| Criação comum/restrita | Smoke anterior16/0/0; disputa real deste complemento | Corridas de edição/aprovação/manutenção, deadlocks e carga geral. |
| Consulta/Q9 e fila | [Q9/fila10/0](marcos-integracao-q9-1-pr27-resultados.md): escopos, vínculos parciais/completos, revogação, fila, decisão/motivo e paginação | Ratificação coletiva e processo administrativo dos vínculos. |
| Edição/cancelamento | [Interface real8/0](marcos-3-consulta-edicao-resultados.md), aceite de Marcos e estado alterado/403/reconsulta deste complemento | Todas as transições e cenários de rede/resultado incerto integrados; há prova controlada anterior dos últimos. |
| Administração | Smoke anterior16/0/0: tipos, competências, bloqueios/desativação e expediente | Revisão/checks/entrega dos ajustes pendentes; demais combinações não executadas. |
| Movimentação | Smoke anterior + prazo ultrapassado, atraso da API/persistência, Administrador leitura/403 neste complemento | Outras corridas/estados e todas as exceções de material/manutenção. |
| Erros e uso | Mensagens/referências reais, envio único, teclado/foco e viewports indicados acima; regressão controlada81/278 | Não se induziu falha real de rede após commit; sem proxy de falhas ou sabotagem de serviços. |
| Auditoria/notificação | Smoke anterior conferiu persistência de auditoria/outbox | Worker/envio externo desligados; entrega de notificação não comprovada aqui. |

As contagens de suítes/rodadas não se somam para declarar cobertura total. O complemento trata lacunas específicas da matriz, não certifica todos os RFs/NFRs ou toda concorrência do backend. QA independente, eventual revisão visual dos resultados, revisão de outro integrante, checks/CodeRabbit/Sonar, PRs e merge à develop permanecem distintos. Nenhuma mensagem externa ou publicação executada.

## Reprodução

Conferir o [guia local](../integracao/marcos-e2e-local.md), Node/dependências e o JAR correspondente à fonte. Porta18081 precisa estar livre e a instância principal pronta. Executar longe da virada do dia, com expediente compatível com os intervalos da rodada:

```powershell
node tests/e2e-local/controle.cjs status
node --check tests/e2e-local/sessao-temporaria.cjs
node --check tests/e2e-local/validar-fechamento.cjs
node tests/e2e-local/validar-fechamento.cjs
```

O auxiliar tem esperas curtas com progresso e tenta encerrar sua instância no finally, inclusive após falha. Resultados/logs brutos ficam em `.aiox-core/local/e2e/fechamento/<data>/`; guardar tentativas antes de repetir. Se houver interrupção externa que impeça finally, conferir o registro privado de PID/CreationDate/executável/JAR/nome/porta antes de encerrar exclusivamente esse processo; nunca usar kill genérico ou sobrescrever o estado do controle principal. Senhas, cookies, configuração e logs da aplicação não são evidências públicas.
