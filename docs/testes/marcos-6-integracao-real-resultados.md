# Marcos-6 — integração HTTP real RF12 — 13/11/2026

O frontend foi conciliado com o endpoint do PR #41 e validado com Spring/MySQL/Chrome reais: **13 cenários aprovados, zero falhas**. O menu oferece Relatórios somente ao Administrador. A regressão completa passou com **97 unitários frontend e 346 execuções de navegador**; o package Java passou com **277 testes unitários/HTTP**. [Aceite do autor confirmado](marcos-6-integracao-real-aceite-2026-11-13.md), sem ajustes solicitados; revisão independente/equipe, commit e entrega remota continuam pendentes.

[Story](../stories/marcos-6-integracao-real.md), [roteiro de revisão humana](marcos-6-integracao-real-verificacao.md), [resultados reais](marcos-6-integracao-real/resultados.json), [inventário](marcos-6-integracao-real/inventario.json), [gates](marcos-6-integracao-real/gates-resumo.txt) e [estatísticas do navegador](marcos-6-integracao-real/navegador-resumo.json).

## Base e preservação

Branch **`feature/marcos-6-integracao-real`**, criada limpa da develop **`806562688f9b359475d59441a1a1e75738f0cd28`**, que contém #38/#40/#41. As 55 alterações antigas foram copiadas por bytes e conferidas por SHA-256, junto dos patches/index/metadados. O merge antigo foi abortado; as 49 alterações autorais restantes ficaram no stash `f8604623dd5391a8a5ae3eefb48f8715440ed4a4`, conferido sem reaplicação. Os seis arquivos do merge antigo já estavam integrados à develop. Demais worktrees e dados privados preservados.

Inventário privado da preservação: `.aiox-core/local/retomada-rf12-backup.json`; backup em `.aiox-core/local/backups/retomada-develop-rf12-2026-11-13T22-14-05-509Z`. A cópia original mantém os bytes; a conferência do stash explicitou 17 conversões LF/CRLF. Nenhum commit/push, exclusão de dados, reset de branch ou aplicação de stash foi executado para iniciar este recorte.

## Mudança de produto

- Cliente passa da rota candidata `/api/relatorios/utilizacao` para **`GET /api/reservas/relatorio-utilizacao`**, entregue no #41. Query e DTO do #39 preservados; sem fallback para outra rota ou dados fictícios.
- Link Relatórios somente no menu/cartão do Administrador. A guarda existente continua recusando outros perfis pela URL direta; o backend autoriza cada requisição pela sessão.
- Aviso de integração pendente removido da página real. A prévia local continua mostrando **Dados simulados** e usa a mesma rota somente em seu servidor de teste.
- Não houve mudança autoral em Java, SQL, migrações, segurança Spring, dependências ou configuração persistente. Acesso ADMIN permanece provisório conforme o serviço da equipe.

## Ambiente e execução

Java Temurin21.0.13+9, Maven3.9.16, MySQL8.4.13 portátil, Node24.22.2, npm11.19.1, Playwright1.65.0 e Chrome157.0.8103.51. Spring em `127.0.0.1:18080`, MySQL isolado em `127.0.0.1:13307`, base `qs_marcos_e2e`, Flyway V1–V6 e worker de notificações desligado. JAR anterior preservado antes de encerrar os processos próprios por identidade; banco/dados anteriores conservados. JAR novo SHA-256 **`793e1081e1461e22f8244b7a61358b037906df9604fd3d142f4d22646b03f80f`**.

A configuração privada de ferramentas desta máquina recebeu os caminhos explícitos de Git/PowerShell exigidos pelos auxiliares atuais. A versão anterior foi copiada; não houve alteração do PATH ou instalação global. A primeira conferência CIM na sandbox foi negada; a identidade foi conferida com a permissão de execução apropriada, sem contornar os asserts do controlador.

| Comando / camada | Resultado |
|---|---|
| `npm.cmd run build`, `PLAYWRIGHT_CHANNEL=chrome` | Lint/typecheck aprovados, **97 unitários e 346 navegador**, zero falhas/ignorados/flaky/retries; exit0. API controlada nesta regressão. |
| Maven `package -DskipITs`, Java21/cache próprio | **277 unitários/HTTP**, zero falhas/erros/ignorados; BUILD SUCCESS/exit0. Sem Testcontainers ou gate JaCoCo de verify local. |
| `node tests/e2e-local/validar-relatorios.cjs` | **13 PASS/0 FAIL**, `concluido=true`, exit0. Spring/MySQL/Chrome reais, sem interceptação. |
| `node --check` do auxiliar e da prévia | Aprovado. |
| Prévia simulada, HTTP local | Aviso explícito, rota canônica e exemplo60min/três recursos conferidos; processo próprio encerrado. Não é E2E real. |

A suíte frontend terminou as 346 execuções, mas aguardou o encerramento do servidor estático no Windows. Cadeia de pais, comando e CreationDate foram conferidos; `Stop-Process` falhou e o Node encerrou somente o servidor confirmado. O comando então concluiu com exit0 e produziu o JSON final. A duração registrada **603,6s** inclui essa espera, sem mudança de testes, produto ou configuração para aprovar o build. Não é medida de desempenho.

A primeira invocação do inspetor da prévia enviou texto Unicode como ASCII pelo pipe PowerShell e falhou na comparação do aviso. A codificação foi corrigida para UTF-8; a repetição passou, sem alteração do produto. A rodada RF12 real passou na primeira execução completa; não houve tentativa funcional falha ocultada.

## Massa e provas reais

Rodada privada `.aiox-core/local/e2e/relatorios/2026-11-13T22-27-16-165Z`, entre **22:27:16 e22:27:27 UTC**, ou **19:27:16–19:27:27 de13/11 em São Paulo**. Uma janela futura de duas horas, dentro do expediente real e sem reservas anteriores, foi selecionada por leitura. Recursos novos **71–77**, reservas **26–29** e conflito **7** foram criados exclusivamente por HTTP autorizado; SQL de inspeção permaneceu SELECT. Nenhum horário/estado persistido foi adulterado para preparar a massa.

| Cenário | Evidência |
|---|---|
| Fontes/JAR | 12 fontes estáticas servidas correspondem aos SHA-256 atuais; 24 artefatos identificam fontes/auxiliares/Java/JAR. V1–V6 conferidas. |
| Sessão e perfil HTTP | 401 anônimo; 403 Solicitante/Responsável mesmo forjando papel/ID na query. Identidade vem da sessão. |
| Erros | Dez requisições inválidas respondem400/REQUISICAO_INVALIDA com mensagem/referência, sem alterar as contagens de persistência. |
| Total e alocação | Três reservas válidas, 3.718.000.000µs no SQL: **61min totais**, alocações **60/60/60/0/0**, cuja soma180min não substitui o total por reserva. |
| Filtro multirrecurso | Recurso71 seleciona uma reserva60min e mantém os recursos71/72/73, cada um60min. |
| Recorte | Consulta parcial retorna15min por reserva/recurso; reserva que termina exatamente no início da consulta fica excluída. |
| Truncamento | Reserva59s conserva contagem1 e0min; duas reservas59s dão total1min com grupos0min/0min. |
| Estados/vazio | Padrão exclui CANCELADA. Consulta HTTP explícita desse estado retorna sua reserva60min; recurso77 sem reservas retorna vazio legítimo. Não foi criado seletor de estados na tela. |
| Conflitos | Evento7 é selecionado pelo momento, mesmo com intervalo tentado em outra data. Início incluído/fim excluído conferidos na precisão de microssegundos; resposta sem solicitanteId. Zero reservas e um conflito coexistem. |
| URL e menu | Outros perfis sem link, formulário oculto e zero consultas, inclusive submit programático. |
| UI desktop/mobile | Menu real, total/filtro/zero/vazio/conflito, uma consulta por ação, GET sem cabeçalho CSRF, logout/redirecionamento e ausência de overflow/erros JS; navegador em Asia/Tokyo e formulário em São Paulo. |
| Preservação | GETs não alteram contagens de reservas/auditoria/outbox/conflitos após a massa; ambiente principal pronto e dados mantidos. |

Capturas reais inspecionadas pelo agente: [desktop](marcos-6-integracao-real/desktop-relatorio.png) e [celular](marcos-6-integracao-real/mobile-relatorio.png). São evidências automatizadas, sem constituir aceite visual humano.

## Revisão assistida e limites

Conferidos rota/DTO, navegação por papel, ausência de dados fictícios no produto, escopo da fixture, fronteiras de datas, sanitização e integridade das fontes/evidências. Nenhum novo defeito demonstrado no recorte examinado. A revisão é do mesmo executor, **sem independência atribuída**; CodeRabbit local continua indisponível e nenhuma análise/check remoto novo foi executado.

As contagens97/346 atuais não se somam às97/346 do outro computador; esta é uma nova execução na árvore identificada. Os13cenários reais são outra camada e não certificam todos os estados/corridas, carga, produção ou envio externo de notificações. O teste do proxy/transação incluído nos277testes Java usa o gerenciador registrador próprio; não se declara nova prova de concorrência/isolamento MySQL a partir desse teste.

Etapas1–5 permanecem encerradas e seus registros não foram reabertos. Este incremento foi aceito por Marcos após o roteiro humano e está pronto para revisão independente/equipe e entrega; **a etapa6 não foi marcada globalmente Done**. Commit, push/PR e verificações da entrega só seguem pelo fluxo autorizado de cada incremento.
