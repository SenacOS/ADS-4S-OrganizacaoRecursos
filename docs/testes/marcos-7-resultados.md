# Marcos-7 — regressão integrada e compatibilidade Q5 — 13/11/2026

O incremento foi validado localmente sobre develop **b73c501**: cancelamento administrativo compatível com Q5, **287 testes Java**, **100 unitários frontend/350 navegador** e sete suítes reais aprovadas. O [plano de ação](../planejamento/marcos-plano-de-acao.md) agora registra a etapa6 entregue pelo #42 e a etapa7 em revisão local. [Story](../stories/marcos-7.md), [matriz RF/CT](marcos-7-matriz-evidencias.md) e [roteiro humano](marcos-7-verificacao.md).

**Aceite do autor confirmado em13/11/2026: “revisão aprovada”. Commit/push/PR posteriormente autorizados por Marcos na mesma data, após conferir o checklist.** [Registro do aceite](marcos-7-verificacao.md#aceite-do-autor--13112026). Revisão técnica assistida pelo mesmo executor, sem atribuir independência. A etapa7 global e a entrega final não foram declaradas concluídas.

Os registros de “sem novo commit/push” nas seções seguintes descrevem os checkpoints de validação anteriores ao envio autorizado. A revisão/integração da equipe e a CI do novo PR continuam distintas do encerramento local aceito.

## Base e preservação

Branch `test/marcos-7-validacao-integrada`, criada da develop `b73c501536a275cdc89101cc7130c7b481e52396`, que contém os merges #42 (`11a3a56`) e #43/Q5. #42 aprovado por jovemOG-Dev antes do merge; [confirmação remota e CI](marcos-7/ci-equipe.json). A edição manual de dois espaços no cabeçalho do plano1a5 foi copiada/conferida e preservada na troca; permanece fora da File List autoral. Branches/worktrees, stashes e backups anteriores mantidos.

JAR anterior da etapa6 preservado em `.aiox-core/local/etapa7-backend-anterior.jar`; dump privado antes da V7 em `.aiox-core/local/e2e/antes-v7-etapa7.sql`. Processos próprios identificados antes de encerrar/reiniciar. Flyway aplicou V7 da equipe, acrescentando `motivo_cancelamento`, sem apagar dados anteriores. Não houve alteração autoral Java/SQL/migrações/configuração Spring/dependências/workflows.

Após o aceite, [PR #44 documental conferido e incorporado](marcos-7-pr44-revisao.md): a própria branch avançou por fast-forward para `7d5480b`, preservando os44arquivos locais por backup/restauração. RTM/contrato conciliados, históricos mantidos e README/relatório atualizados para distinguir o snapshot anterior do ajuste Q5 local. Nenhum código/teste executável mudou; as provas abaixo mantêm sua base/origem e seus hashes, sem nova execução atribuída a essa conferência.

JAR atual SHA-256 **`afe76ecce37678bc92350988081f5e5a73e36e1bca234831e6b16221bb3d88b4`**. Spring `127.0.0.1:18080`, MySQL8.4.13 isolado `127.0.0.1:13307`, V1–V7, Java21/Maven3.9.16 portáteis, Node24.22.2/Playwright1.65/Chrome157. Principal com worker desligado; demonstração RF11 em banco/processo exclusivos, gateway simulado real e URL vazia. Sem envio externo ou alteração do relógio.

## Implementação Q5

- Administrador em reserva de terceiro recebe campo rotulado de justificativa, máximo500, texto não branco e confirmação após digitar/alterar. Só `{motivo}` é enviado; papel/identidade vêm da sessão. Sem duplo envio/replay automático.
- Dono, inclusive Administrador dono, mantém cancelamento sem justificativa/corpo. Guardas de perfil/estado, tratamento de erro incerto e confirmação do alvo/status preservados.
- Motivo de cancelamento não é motivo de decisão. O DTO atual não expõe o campo novo; a tela não inventa histórico/exibição desse valor. Persistência, estado, auditoria e outbox conferidos por SELECT nos cenários reais.
- Fixtures administrativas passam a informar a justificativa; asserções de migrações passam a V1–V7. O auxiliar de consulta escolhe o próximo dia de São Paulo às09h, mantendo microssegundos e os três intervalos no mesmo dia, em vez de depender da hora da execução.
- A suíte de fechamento aceita `--manifesto-frontend=docs/testes/marcos-7/regressao-frontend.json`:58fontes do build final comparadas estritamente. O manifesto histórico não foi reescrito; fontes servidas pelo JAR continuam conferidas por bytes/SHA-256 em ambas as instâncias.

## Resultados atuais

| Comando / camada | Resultado e limite |
|---|---|
| `npm.cmd run build`, Chrome instalado | Lint/typecheck aprovados; **100 unitários/350 navegador**,0falhas/ignorados/flaky/retries; exit0 e encerramento normal. APIs controladas nessa regressão. |
| Maven `package -DskipITs`, Java21/cache próprio | **287 unitários/HTTP**,0falhas/erros/ignorados; BUILD SUCCESS/exit0. Sem Testcontainers/JaCoCo verify local. |
| `validar.cjs` | **16 PASS/0 FAIL/0 BLOQUEADO**, smoke real: sessão/perfis, recursos, disponibilidade, cadastros, bloqueios, expediente, reservas e trilhas. |
| `validar-cancelamento.cjs` | **8/0 reais**: V7/fontes, quatro negativas400, perfil indevido403, limite500 persistido, donos sem corpo, UI desktop/mobile com um POST e trilhas, massa para aceite. |
| `validar-q9.cjs` | **12/0 reais**, Q9/fila, vínculos/revogação, Q1/Q3 e revalidação Q8 nos cenários do auxiliar. |
| `validar-consulta-reservas.cjs` | **8/0 reais**, lista/detalhe, PATCH/precisão, restrições, cancelamentos do dono e administrativo com justificativa, móvel/persistência. |
| `validar-fechamento.cjs --manifesto-frontend=docs/testes/marcos-7/regressao-frontend.json` | **11/0 reais**,36fontes servidas/58do build, sessão/CSRF/expiração65s, pesquisa, disputa201/409, estado externo/editor e retirada/devolução com atraso real. Instância temporária encerrada e principal preservado. |
| `validar-relatorios.cjs` | **13/0 reais**, RF12 com V7 e fixture administrativa atualizada; totais/vínculos/truncamento/vazio/conflitos/perfis/UI e leituras sem escrita. |
| `demonstrar-fechamento.cjs` | **8/0**, operação de vínculos e RF11 com worker/gateway simulado reais em base/processo exclusivos. Não é recebimento externo ou implantação. |

[Inventário de fontes/JAR/origens](marcos-7/inventario.json), [manifesto do build](marcos-7/regressao-frontend.json), [gates](marcos-7/gates-resumo.txt), [estatísticas do navegador](marcos-7/navegador-resumo.json). As contagens têm camadas/massas próprias; não somar como cobertura global nem reatribuir execuções anteriores à nova base.

Resultados reais: [smoke](marcos-7/smoke-resultados.json), [Q5](marcos-7/cancelamento-resultados.json), [Q9](marcos-7/q9-resultados.json), [consulta](marcos-7/consulta-resultados.json), [fechamento](marcos-7/fechamento-resultados.json), [RF12](marcos-7/relatorios-resultados.json) e [demonstração](marcos-7/demonstracao-resultados.json). Horários são UTC; a data de trabalho/revisão é13/11 em São Paulo.

## Tentativas preservadas e defeito

**FE-007:** a entrega Q5/#43 tornou obrigatória a justificativa administrativa, enquanto a UI/cliente não a ofereciam/enviavam. Os três novos testes focais registraram **1PASS/2FAIL** antes da correção; depois passaram3/3, incluídos no build100/350. [Resumo e digest do log](marcos-7/q5-red-resumo.json). Sem falha funcional restante demonstrada nesse recorte.

A primeira execução da consulta terminou **6PASS/1FAIL**: a fixture antiga tentou cancelar reserva alheia sem preencher o novo campo e esperou sucesso, enquanto a UI bloqueou corretamente o envio. [Tentativa original projetada, erro e hashes preservados](marcos-7/consulta-tentativa-q5.json). Ajustada somente essa preparação; nova massa passou8/0. O código do produto e o manifesto do build não mudaram após os gates; não se repetiu toda a regressão sem necessidade.

## CI compartilhada e revisão

[Jobs/logs sanitizados e fontes](marcos-7/ci-equipe.json): PR42 com277unitários/73MySQL e PR43 com287unitários/79MySQL, zero falhas/erros/ignorados; JaCoCo e job JMeter aprovados. O segundo inclui6testes `ReservaCancelamentoMysqlIT`, além de Q8/Q9/RF12/auditoria/outbox. São execuções de merges de teste dos heads sobre8065626, não CI nova do frontend da etapa7; Java do checkout b73c501 corresponde ao head do #43.

As duas execuções terminaram failure no scanner Maven, com mensagem de autorização/projeto não encontrado. A causa específica não foi determinada e nenhuma configuração foi alterada para contornar o check. Sucesso do job JMeter não foi convertido em métricas/limiares não inspecionados. CodeRabbit local segue indisponível, sem PASS presumido.

Revisão assistida conferiu escopo Q5, donos/perfis, fonte/JAR, limite de texto, envio/ausência de replay, persistência/trilhas, isolamento e tentativa parcial. Capturas reais inspecionadas: [Q5 desktop](marcos-7/q5-desktop.png), [Q5 celular](marcos-7/q5-mobile.png), [RF12 desktop](marcos-7/rf12-desktop.png), [RF12 celular](marcos-7/rf12-mobile.png). A inspeção automática não constitui aceite humano ou revisão independente. Marcos posteriormente informou “revisão aprovada”; [aceite próprio registrado no roteiro](marcos-7-verificacao.md#aceite-do-autor--13112026).

Massa Q5 preservada para o aceite: reserva37, de terceiro, recurso88; reserva38, do Administrador, recurso89. Ambas APROVADA no preparo final, com período15/11/2026,00h–01h de São Paulo. Não cancelar novamente as reservas dos cenários automatizados nem apresentar seus prints como aceite do autor.

## Limites e continuidade

Cobertura delimita os caminhos registrados, sem certificar todas as combinações/transições/corridas, WCAG integral, carga geral, controles de produção ou envio externo. Segurança e concorrência têm provas HTTP/SQL e CI próprias na matriz; mocks e botão desabilitado não as substituem. Credenciais/logs/dumps/ferramentas e dados privados não são publicados.

Plano, RTM/README e contratos atualizados. Etapas1–6 continuam entregues. O incremento7 fica Ready for Review com aceite do autor registrado, aguardando revisão da equipe e o ciclo de commit/publicação quando solicitado; etapa8 e checks compartilhados mantêm seus critérios.
