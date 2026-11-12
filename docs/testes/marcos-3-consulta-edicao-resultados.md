# Marcos-3 — consulta, edição e cancelamento: resultados

**Aceite posterior:** Marcos confirmou que os testes funcionaram, aprovou a revisão visual e autorizou commit local em 12/11/2026. [Registro e limites](marcos-3-consulta-edicao-aceite-visual-2026-11-12.md). Código/testes mantidos pelos hashes; sem nova suíte para esse registro documental. Os estados abaixo descrevem o momento da execução anterior ao aceite/commit; publicação, revisão da equipe e checks continuam separados.

Em **12/11/2026**, implementação local na branch `feature/marcos-reservas-consulta`, criada sobre **f9c4912e3be513798cc16db3b021e58ffde7aed6** após Marcos informar o push da integração Q9. Essa base contém develop `4cea177` e os PRs #26/#27. O fetch inicial não revelou nova atualização. Código deste incremento **ainda sem commit**, identificado pelo [manifesto SHA256](marcos-3-consulta-edicao/arvore-testada.json). Aceite visual de Marcos, commit, publicação, revisão da equipe e checks do incremento ainda pendentes.

## Comportamento entregue

A navegação dos três perfis oferece **Reservas**, em `/pages/minhas-reservas.html`. Lista usa filtros contratados, paginação e escopo do servidor; detalhe completo autorizado precede qualquer ação. Solicitante consulta suas reservas; Responsável consulta dentro dos vínculos Q9; Administrador consulta todas. Consulta não concede escrita.

Edição exige dono em SOLICITADA ou APROVADA comum, conforme domínio atual. Envia inicio/fim/recursosIds juntos; mantém todos os recursos e o ISO original de cada data não alterada, inclusive microssegundos/nanossegundos. Leitura/editor/transporte comparam os instantes com precisão, inclusive intervalos menores que 1ms. Recursos originais sobrevivem à pesquisa e à disponibilidade ocupada pela própria reserva; novos precisam estar ativos/disponíveis e não podem mudar a necessidade de aprovação. Cancelamento exige dono ou Administrador em SOLICITADA/APROVADA, confirmação e resposta CANCELADA coerente; usa POST sem corpo e preserva histórico. A política de edição ainda aparece como PROPOSTO no backend; consumo do comportamento observado não significa ratificação coletiva.

Rede/resposta incoerente e conflitos invalidam confirmação e exigem novo detalhe antes de outra tentativa explícita. Uma escrita confirmada permanece confirmada se sua leitura posterior falhar. Guard, sessão, CSRF dinâmico, textos seguros, foco e layout usam os padrões existentes. Não houve alteração de Java, SQL do produto, configuração, dependências ou flags persistentes.

## Regressão controlada

Comando: `$env:PLAYWRIGHT_CHANNEL = 'chrome'; npm.cmd run build`. Node **26.13.0**, npm **11.20.0**, Chrome **157.0.8103.78**, Windows; uma worker, retries zero. Inclui lint, checkJs/typecheck, unitários e navegador. Desktop 1366×900 e móvel 390×844; cenários novos usam fuso Asia/Tokyo para verificar conversão operacional São Paulo. API controlada somente nessas suítes.

| Rodada | Lint/typecheck | Unitários | Navegador | Observação |
|---|---|---:|---:|---|
| Primeira | PASS | 80 PASS | 274 PASS | Não cobria inclusão de novo recurso restrito em reserva comum; QA identificou FE-005 depois. |
| Após correção FE-005 | PASS | 80 PASS | 276 PASS | Rodada intermediária preservada; QA apontou depois a fronteira submilissegundo FE-006. |
| Final após FE-006 | PASS | 81 PASS | 278 PASS | Zero falhas, ignorados, flaky ou retries; 19 cenários novos em duas viewports. |

As contagens são da árvore completa e não se somam. [Log inicial](marcos-3-consulta-edicao/build-primeira-rodada.txt), [JSON inicial](marcos-3-consulta-edicao/navegador-primeira-rodada.json), [log intermediário](marcos-3-consulta-edicao/build-intermediario.txt), [JSON intermediário](marcos-3-consulta-edicao/navegador-intermediario.json), [log final](marcos-3-consulta-edicao/build-final.txt), [JSON final](marcos-3-consulta-edicao/navegador-final.json). Originais privados preservados; logs publicados convertidos de UTF-16 para UTF-8/LF, JSON de navegador projetado para casos/resultados sem caminhos pessoais.

Nove novos unitários cobrem projeções/IDs/estados, filtros antes do HTTP, escopo próprio, envelope/total, detalhe divergente, permissões, ISO original, intervalo submilissegundo e confirmação exata da escrita. Navegador cobre lista, filtros, paginação/vazio/falhas, detalhe antes das ações, restrições por perfil/estado, seleção completa entre páginas e substituição, disponibilidade, precisão temporal, escrita incerta/reconsulta e confirmação perdida, duplo envio, sessão, texto literal, teclado/foco e limites móveis. Regressão de navegação ajustada para o novo destino.

**FE-005 (P2)**: na revisão assistida, o editor inicialmente oferecia um recurso novo restrito para reserva comum. Servidor recusaria a mudança de necessidade de aprovação. A correção impede essa seleção e explica o caminho de nova solicitação; preserva originais. Acrescentado cenário nas duas viewports. O primeiro sucesso não é apresentado como prova dessa correção. [Registro do defeito](../qualidade/defeitos-frontend.md#fe-005--editor-oferecia-recurso-restrito-para-reserva-comum).

**FE-006 (P3)**: a comparação com Date.parse recusava intervalo válido dentro do mesmo milissegundo. Comparador de até nove casas extraído para datas.js e reutilizado no novo leitor/filtros/editor e no transporte reservas.js; unitário e browser atravessam consulta e PATCH de `.123001` a `.123002`. [Registro](../qualidade/defeitos-frontend.md#fe-006--intervalo-submilissegundo-válido-recusado-como-vazio). A pesquisa compartilhada de recursos conserva seu limite anterior para intervalo menor que 1ms: não oferece novas inclusões nesse período; originais podem ser preservados/salvos e o cancelamento permanece disponível. Não se declara essa busca de duração mínima coberta pelo ajuste.

## Spring, Chrome e MySQL reais

JDK **21.0.13+9**, Maven **3.9.16**, MySQL **8.4.13**, base isolada em loopback 13307, Spring em `http://127.0.0.1:18080`, V1–V6. JAR reempacotado após a correção do produto, com **testes Maven omitidos** (`-Dmaven.test.skip=true -DskipITs package`); não é `clean verify` nem nova execução de Testcontainers. Não há Docker neste ambiente. Ferramentas, senhas, cookies, configurações e logs brutos permanecem ignorados.

`node tests/e2e-local/validar-consulta-reservas.cjs`: **8 PASS / 0 FAIL**, sem interceptação ou sessão simulada. Rodada final **19:00:19 UTC / 16:00:19 -03:00**, após novo package da correção FE-006. Sete arquivos servidos pelo JAR conferidos com a fonte por SHA256, incluindo datas.js e reservas.js. Cria três recursos e duas reservas fictícias exclusivas, com período futuro e expediente real; vínculos de Responsável inseridos somente para os recursos criados, após conferir código esperado, ID e perfil. Consulta SQL de persistência não altera dados. Não exclui reservas nem dados antigos.

1. Arquivos efetivamente servidos correspondem à fonte.
2. Lista/detalhe do dono e PATCH completo sem alterar datas preservam seis casas decimais reais.
3. Conflito real 409 mantém a reserva e exige reconsulta/checkbox novo antes de outra escrita.
4. Alterar apenas início e incluir um material mantém fim original e todos os recursos anteriores.
5. Responsável com todos os vínculos consulta sem receber ações do dono.
6. Dono cancela, confirma CANCELADA e mantém o histórico.
7. Administrador cancela reserva alheia, sem obter edição.
8. Detalhe em 390×844 sem overflow, persistência das duas reservas CANCELADA e zero erros JavaScript observados na página acompanhada.

[JSON final](marcos-3-consulta-edicao/e2e-final.json), [edição desktop](marcos-3-consulta-edicao/edicao-real.png), [cancelamento desktop](marcos-3-consulta-edicao/cancelamento-real.png), [detalhe móvel](marcos-3-consulta-edicao/reservas-mobile.png). Primeira rodada real passou 8/0 e foi [preservada](marcos-3-consulta-edicao/e2e-primeira-rodada.json); o QA pediu reforço na validação do código ecoado antes do SQL de fixture e o auxiliar foi [reexecutado 8/0](marcos-3-consulta-edicao/e2e-intermediario.json) após esse ajuste, sem alterar produto entre essas duas rodadas. Terceira rodada corresponde ao novo comparador FE-006 e JAR atualizado. O cenário submilissegundo é controlado no browser, não foi atribuído ao E2E de reservas com uma hora de duração.

`node tests/e2e-local/validar.cjs`: **16 PASS / 0 FAIL / 0 BLOQUEADO**, às **19:00:28 UTC**, repetido após alteração dos auxiliares compartilhados do produto. [JSON do smoke](marcos-3-consulta-edicao/smoke-real.json). Rodada anterior 18:52:19 UTC também 16/0/0, original privado preservado. Retirado apenas o bloqueio documental de interface geral ausente; seus oito cenários continuam pertencendo ao auxiliar específico. Zero bloqueios desse smoke não significa matriz integrada inteira concluída. Q9/fila mantêm a evidência anterior 10/0; não foram somadas ou reexecutadas por rotina nesta rodada.

## Reprodução e limites

Preparar o [ambiente isolado](../integracao/marcos-e2e-local.md), conferir estado, reempacotar/reiniciar o JAR se a fonte mudar e executar os dois auxiliares acima. Repetições criam novas massas e preservam as anteriores; rodar longe da virada do dia. `npm run preview` não autentica nem simula backend.

Marcos ainda precisa revisar visualmente este incremento. Revisão assistida QA será registrada na [story](../stories/marcos-3-consulta-edicao.md#qa-results); não substitui outro integrante, CodeRabbit ou CI. Não se declara encerrada a matriz de timeout de sessão, corridas reais, todos os estados/prazos, notificações externas e todas as combinações de permissões. Worker de notificação permanece desligado no ambiente isolado; outbox/auditoria do smoke são persistidas, sem prova de entrega externa.

A regra de todos os vínculos foi aceita por Marcos para consumo; ratificação coletiva e processo de manutenção dos vínculos permanecem com a equipe. O scanner Maven da CI de `4cea177` falhou por autorização/projeto depois dos testes Java/MySQL/cobertura aprovados; não há novo resultado remoto desta implementação. [Plano e próximos checkpoints](../planejamento/marcos-fechamento-etapas-1-a-5.md).
