# Marcos-e2e-1 — Ambiente local isolado e validação dos fluxos disponíveis

## Status

Ready for Review

Marcos autorizou em **12/11/2026**: “Precisamos preparar o ambiente local”, para testar com backend real. Base de referência: develop `da5881b`; branch atual `fix/marcos-qualidade-frontend`, com a correção da story de qualidade ainda sem commit. Registrar a árvore e os hashes efetivamente usados, sem inventar um novo commit nem atribuir alterações não versionadas ao SHA base. Commit/push somente quando Marcos solicitar; esta story não autoriza publicação ou alteração de PR.

## Story

Como responsável pelo frontend, quero preparar ferramentas, banco e aplicação em ambiente local isolado e executar os fluxos já contratados contra o backend real, para identificar incompatibilidades e produzir evidências reproduzíveis de integração.

Responsável: Marcos Boé. Preparação AIOX SM; execução técnica AIOX Dev. RF01, RF02, RF03, RF04, RF08, RF09, RF13 e RF14 nos cenários efetivamente executados. Não declara esses requisitos completos nem encerra todas as etapas 1 a 5.

## Fontes e limites

- [Plano de fechamento, passo 7: ambiente e E2E real](../planejamento/marcos-fechamento-etapas-1-a-5.md#11-passo-7--testes-integrados-com-backend-real).
- [Contrato atual de autenticação e escrita de reservas](../api/reservas-contrato.md).
- [Item18: recursos, expediente, manutenção e movimentações](../api/item18.md).
- [Consumo pelo frontend](../api/frontend-integracao.md).
- [Q9 comunicada como política](../api/reservas-politica-leitura-q9.md) e [especificação da fila](../api/reservas-leitura-contrato.md): não equivalem a endpoints HTTP disponíveis.
- [Administração](marcos-5.md), [movimentações](marcos-5-movimentacoes.md), [fila](marcos-4.md) e [qualidade em andamento](marcos-qualidade-1.md).
- Arquivos existentes: `.gitignore` ignora `.aiox-core/local/`; `backend/pom.xml` requer Java 21; `application.yml` define conexão MySQL/Flyway e flags desligadas; `BootstrapAdminLocal` já permite bootstrap do Administrador no perfil local com variáveis; `UsuarioAdminController` fornece cadastro administrativo real. Classes de segurança, auditoria e notificação devem ser conferidas antes da execução.

Marcos confirmou em 12/11 que não recebeu contratos novos: GETs de fila, listagem e detalhe e sua aplicação Q9 continuam com a equipe. Esses fluxos não serão simulados como E2E nesta story. Relatórios e funcionalidades novas ficam fora.

## Critérios de aceitação

1. Preparar distribuições portáteis em `.aiox-core/local/`, sem instalação global: Temurin **21.0.13+9**, Maven **3.9.16** e MySQL **8.4.13 ZIP**, versões selecionadas para esta preparação. Usar fontes oficiais e conferir hashes publicados antes de usar os binários; registrar URL, versão e hash no inventário sanitizado. Downloads já iniciados pelo agente principal não são prova de instalação validada. Confirmar os executáveis efetivamente usados com sua saída de versão.
2. Ferramentas, caches, credenciais, configurações privadas, dados MySQL, logs brutos e estado de processos ficam exclusivamente sob `.aiox-core/local/`, ignorado. Para reprodução, são permitidos os auxiliares genéricos versionados `tests/e2e-local/controle.cjs` e `tests/e2e-local/validar.cjs`, sem credenciais ou valores de configuração privada. O controle inicia/para somente processos próprios em loopback, valida a identidade do processo e da instância antes de parar e não apaga dados. A validação lê configuração privada local, usa dados fictícios únicos, faz HTTP/navegador reais sem interceptação e registra somente os fluxos efetivamente exercitados ou bloqueados. Não alterar PATH/JAVA_HOME persistentes, serviços do Windows, registros, instalação existente ou dependências do produto. Variáveis da sessão podem apontar para os executáveis locais sem reaproveitar nomes de sistema para outro propósito. Não versionar senhas, cookies, CSRF, tokens, arquivos de banco ou dumps com dados sensíveis.
3. Criar instância e base MySQL próprias em diretório local novo, com nome identificável de teste e portas livres verificadas. Não inicializar, limpar, migrar ou reutilizar banco preexistente. Vincular banco e HTTP a loopback, conferir os endereços de escuta e registrar somente os processos/PIDs próprios. A limpeza/encerramento atua nesses processos identificados; não encerrar processos de terceiros nem apagar dados existentes.
4. Construir e iniciar o backend existente com JDK21/Maven locais, mantendo Java, pom, migrações e `application.yml` intactos. Usar conexão/configuração externa local com credenciais exclusivas do banco isolado. Registrar os comandos reais de build/execução, logs sanitizados e estado das migrações Flyway; conferir o schema real quando disponível, sem substituir migrações por tabelas inventadas. Falha concreta de build, migração ou bootstrap é registrada com diagnóstico antes de alegar aplicação executável.
5. Habilitar flags de recursos/reservas/movimentações **somente em runtime do ambiente local**, depois de conferir provedores reais presentes de sessão, auditoria/eventos, notificações e serviços requeridos. Manter os padrões versionados desligados. Não usar provedores vazios, autenticação falsa, substituição de beans ou mocks para fazer o backend subir. Se faltar integração real, registrar o fluxo bloqueado em vez de contornar a ausência.
6. Preparar dados descartáveis dos três perfis com os mecanismos existentes, preferindo bootstrap local real e cadastro administrativo autorizado; não criar endpoint ou alteração de backend para semear dados. Senhas ficam apenas em configuração/arquivos locais ignorados. Registrar identificadores de teste necessários de forma sanitizada, sem publicar credenciais. Não presumir IDs, vínculos ou massa de fixtures como dados reais.
7. Executar uma verificação real de autenticação com ADMINISTRADOR, SOLICITANTE e RESPONSAVEL: CSRF obtido do servidor, login form-urlencoded, cookie de sessão, GET me e logout. Conferir respostas e comportamentos relevantes de 401/403/CSRF nos cenários executados, sem inferir segurança completa a partir de navegação visual. Login inválido continua erro de credenciais; sessão encerrada não é sucesso de operação de domínio.
8. Quando os serviços reais estiverem disponíveis, executar os fluxos contratados de recursos/expediente, pesquisa, criação de reserva e movimentações. Administrador prepara recursos e expediente; Solicitante consulta/cria; Responsável registra retirada/devolução com reserva elegível. Usar datas compatíveis com relógio real, America/Sao_Paulo, expediente e intervalo exigido para retirada, sem mudar o relógio do produto para imitar fixtures. Registrar status, IDs e resultado real de cada operação, incluindo falhas recuperáveis e negativas por perfil pertinentes. Administração de recursos não dá ao Administrador escrita de movimentações ou aprovação por inferência.
9. Cenários identificados como E2E usam navegador e frontend servido pelo próprio Spring Boot, na mesma origem da API, sem interceptação de requisições, `route.fulfill`, API falsa, storage de sessão injetado ou servidor de preview que emule backend. Verificações HTTP e consultas SQL auxiliares podem compor smoke/diagnóstico, mas devem ser identificadas como tais; não apresentar teste de API como fluxo de navegador concluído. Auxiliar local ignorado pode automatizar setup/smoke com requisições reais, sem acrescentar dependências de produto.
10. GETs de fila/lista/detalhe de reservas permanecem fora da prova disponível. Não criar rotas, retornar dados de teste como backend nem presumir ratificação de DTOs/Q9. Diferenciar a escrita de criação já contratada da navegação de edição/cancelamento que depende de leitura; usar o resultado real da criação quando necessário aos cenários contratados de movimentação, sem anunciar uma tela de consulta inexistente. A entrega registra o que aguarda Silva/Fausto/Débora e as condições para E2E futuro desses fluxos.
11. Registrar o SHA base, branch e estado não versionado usado, com inventário/hash dos arquivos relevantes realmente executados e do artefato/backend/auxiliar quando pertinente. Evidências descrevem data/hora, versões, portas, massa local, comandos, resultados, arquivos de log e limites. Senhas, cookies e tokens são removidos das evidências publicáveis. Não criar commit para obter um SHA de teste sem a solicitação de Marcos.
12. Distinguir explicitamente compilação, testes Maven, smoke HTTP, verificações SQL/migrações e E2E de navegador realmente executados. Docker/Testcontainers não são presumidos disponíveis: ausência de Docker não vira aprovação, não exige alteração de suíte/dependências e não pode ser ocultada por `skip`. Se testes forem excluídos ou houver somente build/execução, registrar o comando e o alcance exatos. Não atribuir metas JaCoCo, Sonar/CI, auditoria, carga ou concorrência ao smoke local.
13. Criar documentação reproduzível de setup, configuração local, execução, verificação e encerramento; produzir relatório em `docs/testes/marcos-e2e-local-2026-11-12-resultados.md` e instruções em `docs/integracao/marcos-e2e-local.md`. Atualizar checklist/File List e demais referências somente conforme trabalho efetivo. Conferir gates proporcionais aos scripts/documentos alterados e os exigidos pelo projeto (`npm run lint`, `npm run typecheck`, `npm test`/build quando aplicável), registrando resultados reais; reutilizar evidência anterior apenas quando os arquivos verificados não mudaram e essa correspondência estiver identificada.
14. Não alterar a correção/story de qualidade, backend, configuração de produção, dependências ou workflows para resolver o ambiente. Defeitos encontrados recebem passos reproduzíveis, gravidade/impacto e encaminhamento ao dono. Integração/revisão externas e GETs ausentes continuam pendentes mesmo com smoke parcial aprovado. Nenhuma publicação ou commit/push é executado sem pedido de Marcos.

## Tasks / Subtasks

- [x] Conferir a árvore de origem, pendências não commitadas e inventário inicial (AC 11).
- [x] Validar fontes/hashes e preparar JDK21, Maven e MySQL portáteis locais (AC 1–2).
- [x] Inicializar banco isolado e credenciais locais; confirmar loopback, portas e processos próprios (AC 3).
- [x] Construir/iniciar backend existente e conferir migrações/provedores reais com configuração local (AC 4–5).
- [x] Preparar os três perfis e dados de recursos/expediente adequados ao relógio real (AC 6–8).
- [x] Executar smoke real de autenticação/perfis e fluxos contratados disponíveis, registrando a camada verificada (AC 7–10, 12).
- [x] Executar navegador real sem API interceptada onde disponível e registrar o que não pôde ser exercitado (AC 9–10).
- [x] Produzir inventário/hashes, logs sanitizados, instruções de reprodução/encerramento e limites (AC 11–13).
- [x] Executar verificações proporcionais/exigidas e atualizar checklist/File List sem alegar suíte não executada (AC 12–13).
- [x] Preparar handoff dos bloqueios/defeitos e manter pendências de leitura/integração explícitas, sem envio externo (AC 10, 14).
- [x] Receber solicitação de Marcos e incluir o incremento no commit local de 12/11/2026.
- [ ] Publicar por push somente após autorização correspondente; este commit não publica alterações.
- [x] Registrar aceite visual do autor em 12/11/2026 para o roteiro preparado com três perfis e backend real.

## Dev Notes

O runtime é local e descartável, não uma nova arquitetura de implantação. A resposta de Marcos autoriza preparar instalação, documentação e validação locais. O código genérico de controle e validação pode ser versionado somente em `tests/e2e-local/controle.cjs` e `tests/e2e-local/validar.cjs`; lê a configuração privada de `.aiox-core/local/`, sem incorporar credenciais, diretórios privados da máquina ou valores específicos do ambiente. Ferramentas, banco, caches, configurações, credenciais, logs brutos e registros de processos permanecem na pasta ignorada. Não inserir auxiliares/configuração em `src/`, alterar application.yml/backend/dependências/workflows nem tornar o ferramental obrigatório em produção. Variáveis de conexão existentes são DB_URL, DB_USER e DB_PASSWORD; o bootstrap local recebe as propriedades já suportadas pelo código. Senhas geradas não devem aparecer em argumentos/logs publicáveis ou comandos copiados para a documentação; usar nomes de variáveis ou placeholders na reprodução.

O controle deve verificar a propriedade da instância por informações locais e identidade atual do processo, não apenas confiar em PID salvo, porta ocupada ou nome genérico do executável. Em caso de divergência, recusar encerramento e informar o conflito; não parar banco/aplicação de terceiros nem remover o diretório de dados. A validação cria dados fictícios com identificação única e relata separadamente HTTP, navegador, SQL e bloqueios, preservando logs brutos localmente e publicando somente evidências sanitizadas.

Gates proporcionais dos dois auxiliares: `node --check tests/e2e-local/controle.cjs`, `node --check tests/e2e-local/validar.cjs` e execução real documentada de controle/validação contra o ambiente isolado. Sintaxe válida não substitui prova de inicialização, identificação/encerramento seguro ou integração real. Se depois da regressão aprovada de 70 unitários e 238 execuções de navegador mudarem somente auxiliares/docs, registrar essa correspondência de arquivos/árvore e não repetir a regressão completa do frontend sem motivo novo. Se código/configuração do frontend mudar, a evidência anterior não cobre essa mudança e as verificações pertinentes precisam ser reavaliadas. Esses gates não autorizam publicação nem commit.

Spring Boot deve servir os próprios arquivos estáticos; testes com API interceptada já existentes continuam úteis como regressão de frontend, mas seu resultado é separado da execução real. A fila/listagem/detalhe não pode ser preenchida artificialmente para melhorar a demonstração. Banco local real permite conferir migrações e estado persistido, mas não substitui automaticamente a suíte MySQL/Testcontainers do projeto nem prova segurança/concorrência de todos os caminhos.

Sem contrato de leitura novo recebido, a validação desta story se limita aos fluxos disponíveis e aos erros observados. Recurso restrito pode ser criado para conferir SOLICITADA quando contratualmente suportado; isso não torna a fila navegável nem encerra a etapa de aprovação. Notificação confirmada como pendente não equivale a envio externo realizado; não enviar mensagens reais a terceiros.

## Validação de preparação

Checklist `story-draft-checklist`: objetivo, autorização, fontes, escopo técnico, isolamento, critérios testáveis e limites conferidos. O contrato de autenticação está na seção correspondente de `reservas-contrato.md`; não há arquivo separado `autenticacao-contrato.md` neste checkout. O registro de trabalho não commitado é condição explícita de rastreabilidade. Preparação AIOX SM não equivale a validação QA ou confirmação de instalação/serviço já executando.

## CodeRabbit Integration

Tipo principal: Integração/ambiente local; secundário: documentação. Execução @dev; revisão independente @qa quando houver evidências. Focos: isolamento do banco/processos, uso de provedores reais, credenciais fora do versionamento, rastreabilidade da árvore, ausência de mocks em cenários reais e relato exato dos limites. Gates locais proporcionais e do projeto; CodeRabbit quando disponível, com resultado/indisponibilidade registrado. Nenhuma análise Sonar, alteração de CI ou publicação está implícita. Self-healing @dev light, até 2 iterações/15 minutos para CRITICAL; HIGH documentado.

## Dev Agent Record

### Completion Notes

Marcos solicitou o commit local em 12/11/2026 após reexecutar o smoke e aprovar a revisão visual. Ambiente privado permanece ignorado; somente auxiliares genéricos e evidências sanitizadas acompanham o commit. O SHA resultante fica no histórico Git, sem alterar os registros originais dos testes da árvore antes do commit.

Ambiente preparado com ferramentas portáteis verificadas, MySQL novo em loopback e Spring real. Flyway V1–V5, três perfis e dados fictícios exclusivos; flags somente runtime, worker de notificação desligado. Auxiliares genéricos versionáveis não contêm credenciais e controlam somente a instância identificada.

Controle `status`, `parar`, `iniciar` e reempacotamento executados; dados preservados. `node --check` em ambos os auxiliares aprovado. Dois packages Maven aprovados, com testes explicitamente omitidos; não equivalem a clean verify. Build frontend final 72/240 aprovado na story de datas.

Smoke final: 16 PASS/0 FAIL/1 BLOQUEADO, Chrome/Spring/MySQL sem interceptação. As duas primeiras rodadas ficaram preservadas: erro de seletor do auxiliar, FE-004 real e expectativa de URL de logout do auxiliar. FE-004 foi corrigido na story própria e repetido com JAR atualizado; fonte servida conferida por hash. [Resultado e limites](../testes/marcos-e2e-local-2026-11-12-resultados.md), [guia](../integracao/marcos-e2e-local.md).

Reexecução do autor recebida em 12/11/2026: status/iniciar confirmaram ambiente pronto; validar passou com 16 PASS/0 FAIL/1 BLOQUEADO às 13:19 de São Paulo. JSON original preservado como `resultados-marcos.json`, com nove hashes conferidos e sem credenciais privadas. Não se infere aceite visual ou autorização de commit; sem nova suíte pelo assistente ou mudança de produto.

Após abrir três janelas do Chrome com backend real, Marcos informou “revisão visual aprovada”. Roteiro preparado de retirada/devolução, competências/expediente e criação de reserva; [aceite e limites](../testes/marcos-qualidade-aceite-visual-2026-11-12.md). Confirmação global do autor, sem presumir execução individual de todos os cenários. Sem nova suíte ou alteração de produto para este registro.

DoD local: escopo autorizado/limites [x]; organização/segredos/sem mudança de dependências ou backend [x]; verificações proporcionais e smoke [x]; documentação/arquivos [x]; aceite visual do autor [x]. Administração completa [ ]: aguarda commit solicitado, revisão de outro integrante e checks remotos. Não há cobertura local Maven nova. GETs/Q9 e matriz E2E completa não estão entregues; etapas 1–5 não encerradas.

### Agent Model Used

Codex: preparação AIOX SM, execução AIOX Dev e revisão assistida independente AIOX QA.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-12 | Marcos autorizou preparar ambiente local real; story Ready for Dev para ferramentas/banco isolados, fluxos já contratados e evidências da árvore ainda sem commit. |
| 2026-11-12 | Ambiente/controle preparados, packages e smoke real executados, FE-004 corrigido em story própria e evidências sanitizadas preservadas. Incremento local Ready for Review; sem commit/publicação. |
| 2026-11-12 | Reexecução do autor 16 PASS/0 FAIL/1 BLOQUEADO registrada, JSON preservado e hashes conferidos; sem novo aceite visual ou commit. |
| 2026-11-12 | Aceite visual global do autor após roteiro no Chrome com backend real; registro documental, sem nova suíte ou commit/publicação. |
| 2026-11-12 | Commit local solicitado por Marcos para o incremento aprovado; configuração privada/banco/ferramentas fora do versionamento e push separado. |

### File List

Arquivos efetivamente criados/alterados, incluindo referências compartilhadas:

- `docs/stories/marcos-e2e-1.md`
- `tests/e2e-local/controle.cjs`
- `tests/e2e-local/validar.cjs`
- `docs/integracao/marcos-e2e-local.md`
- `docs/testes/marcos-e2e-local-2026-11-12-resultados.md`
- `docs/testes/marcos-qualidade-aceite-visual-2026-11-12.md`
- `docs/testes/marcos-e2e-local-2026-11-12/resultados.json`
- `docs/testes/marcos-e2e-local-2026-11-12/resultados-marcos.json`
- `docs/testes/marcos-e2e-local-2026-11-12/primeira-rodada.json`
- `docs/testes/marcos-e2e-local-2026-11-12/segunda-rodada.json`
- `docs/testes/marcos-e2e-local-2026-11-12/movimentacao-final.json`
- `docs/testes/marcos-e2e-local-2026-11-12/inventario.json`
- `docs/testes/marcos-e2e-local-2026-11-12/empacotamento.txt`
- `docs/testes/marcos-e2e-local-2026-11-12/reserva-comum.png`
- `docs/testes/marcos-e2e-local-2026-11-12/retirada-real.png`
- `docs/testes/marcos-e2e-local-2026-11-12/devolucao-real.png`
- `docs/integracao/marcos-pendencias-2026-11-12.md`
- `docs/planejamento/marcos-fechamento-etapas-1-a-5.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/RTM.md`

Artefatos locais necessários, **ignorados e não destinados ao commit**: distribuições e hashes de download, configuração privada, caches, diretório de dados MySQL, eventuais auxiliares específicos da máquina, estado de processos, logs brutos e credenciais sob `.aiox-core/local/`. Os dois auxiliares genéricos listados acima são a exceção versionável e não carregam esses valores. Inventariar caminhos/tipos sem publicar segredos ou arquivos de banco.

## QA Results

**PASS técnico local — AIOX QA (Quinn), revisão assistida independente em 12/11/2026.** Revisados os auxiliares, inventário, empacotamento, relatórios/JSONs sanitizados, guia e fechamento documental. A revisão não reexecutou serviços/suítes nem acessou credenciais privadas.

O controle verifica UUID/datadir/porta do MySQL e executável/JAR/CreationDate do Java antes de encerrar processos; não apaga dados. A configuração privada, ferramentas, banco e JAR estão ignorados pelo Git. O validador usa HTTP/Chrome reais, login por formulário e CSRF dinâmico, sem interceptação de API. Os hashes dos dois auxiliares e dos arquivos de produto/testes conferem com a [rodada final de 16 PASS/0 FAIL/1 BLOQUEADO](../testes/marcos-e2e-local-2026-11-12-resultados.md); a fonte servida também foi conferida por SHA256. As tentativas anteriores e os testes Maven explicitamente omitidos estão documentados separadamente.

O bloqueio funcional das leituras GET 405 está preservado, sem aprovação falsa de fila/lista/detalhe/Q9. Outbox PENDENTE não equivale a envio externo. Matriz E2E completa, concorrência/atraso e demais cenários integrados discriminados no relatório, revisão humana, CodeRabbit e Sonar continuam pendentes. O PASS se limita ao ambiente e aos cenários disponíveis deste incremento; mantém Ready for Review, sem declarar entrega integrada, Done ou encerramento das etapas 1–5. Commit/publicação aguardam solicitação de Marcos.
