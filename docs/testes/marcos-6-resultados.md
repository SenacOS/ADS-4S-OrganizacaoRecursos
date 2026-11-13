# Marcos-6 — resultados do incremento controlado

**13/11/2026 — cliente/tela implementados; revisão visual aprovada por Marcos.** Branch `feature/marcos-6-relatorios`, base `c4279b6c596c61d48ca7098a38812fc68c54412d`. Registro preparado para o commit/push expressamente autorizados pelo autor. Este registro pertence à [story Marcos-6](../stories/marcos-6.md) e ao [plano da etapa 6](../planejamento/marcos-etapa-6-plano-de-acao.md), separado do PR documental #38.

## Escopo efetivamente implementado

- Cliente nativo para o DTO/GET **candidatos** da [proposta mínima controlada](../api/relatorios-utilizacao-proposta.md), com sessão same-origin pelo cliente comum; GET não busca CSRF.
- Página `/pages/relatorios-utilizacao.html`, autenticada, sem adicionar link ao menu ou presumir política de acesso RF12. Período obrigatório em São Paulo, inclusive multidia, recurso opcional e consulta explícita.
- Resumo por reserva, total de Duration e alocação por recurso distintos; conflitos como contagem de eventos. Duration H/M/S não negativa até nove frações, preservada no DTO e formatada com BigInt sem arredondamento/float/ciclo de24h.
- Validação de eco por instante/ID, estados fixos, contagens/IDs seguros, recursos únicos, filtro e invariantes do DTO completo. Rejeita inconsistência em vez de fabricar relatório vazio. Cada reserva considerada contribui ao menos1ns ao total.
- Inicial/carregando/sucesso/vazio/erro, consulta única em andamento, filtros preservados, resultado anterior invalidado ao editar e resposta/erro antigos descartados. Sessão/logout, mensagem/referência de suporte, texto literal, foco/teclado e layout desktop/mobile reutilizam os padrões existentes.
- Facilitador **exclusivamente de testes/prévia**, `tests/browser/relatorios-utilizacao-preview.mjs`: loopback `127.0.0.1:4174`, identidade e dados fictícios, aviso explícito **Dados simulados**, sem banco/credenciais. Não é importado pelo produto. A página do Spring não tem fallback de dados fictícios.

## Execuções

| Verificação | Resultado / origem |
|---|---|
| Focal inicial do cliente | 14/14 unitários aprovados. Primeira tentativa limitada pelo sandbox (`spawn EPERM`); reexecução com permissão para processos filhos aprovada. |
| Focal inicial de navegador | 56/56 aprovados:28cenários em desktop e celular, Chrome, timezone do navegador Asia/Tokyo. |
| Primeiro build completo | Lint/typecheck aprovados,95unitários e334navegador aprovados. |
| Ajustes da revisão | Fronteira2reservas/1ns recusada,2ns aceita em novo teste; exemplos de apresentação e rótulo de total documental alinhados com Architect. Facilitador reproduzível incluído. |
| Build final após ajustes | **PASS:** `npm.cmd run build` com Chrome: lint/typecheck sem erros, **96/96 unitários e334/334 navegador** (0falhas,0flaky,0skipped). A última execução inclui15unitários/56navegador RF12; não somar com as execuções anteriores. |
| Capturas da prévia | Dois viewports, sem erros JavaScript e sem overflow horizontal; sessão/dados simulados identificados. Não é aceite visual do autor. |
| QA independente AIOX QA | **PASS técnico local**, sem achados bloqueantes restantes; três observações P3 corrigidas/conferidas. Fonte: QA Results da story, com conferência dos logs/contagens/hashes e capturas; não é reexecução das suítes pelo revisor. Apto à revisão visual humana. |
| E2E RF12 real | Não executado: serviço agregador/DTO/HTTP e autorização RF12 indisponíveis na base. |
| CodeRabbit local | Indisponível: comando local ausente e WSL não instalado, conferido nesta máquina. Não declarar aprovação. QA independente tem registro próprio na story. |

O erro de typecheck inicial foi somente a anotação do retorno obrigatório de `intervaloDoFormulario`, ajustada antes dos testes de navegador. Não houve alteração do helper compartilhado. Não somar contagens de execuções repetidas como se fossem cobertura diferente. O build completo inclui as novas suítes e a regressão anterior das etapas1a5; as contagens finais devem ser as da última execução.

[Artefato de evidências](marcos-6-evidencias.json): versão/base, contagens extraídas do log/JSON Playwright, hashes SHA-256 dos sete arquivos de código/teste e das quatro capturas, além dos hashes dos relatórios locais. Navegador final iniciado em `2026-11-13T19:16:02.364Z`, duração193,434s. Logs brutos locais ignorados: `.aiox-core/local/marcos-6/build-final.log` e `test-results/frontend/results.json`. As evidências públicas não contêm credenciais/cookies.

Autoavaliação DoD do incremento: requisitos do cliente, validação/erros, estrutura nativa, testes/gates, File List e documentação conferidos; nenhuma dependência nova. Inspeção das capturas feita pelo agente e revisão visual aprovada por Marcos. CodeRabbit permanece indisponível; integração real e revisão/entrega por PR seguem separadas. A story não está Done; Ready for Review delimita o incremento controlado. QA independente registra seu próprio parecer na story.

## O que os testes demonstram

Os unitários cobrem precisão até nanos, durações grandes e malformadas, projeção exclusiva dos filtros/DTO, período por instante, exemplo1reserva/3recursos, vazio com conflitos positivos, filtro/linhas exclusivas, contagens/estados/IDs e invariantes. A validação do cliente não substitui autorização no servidor.

Os testes de navegador interceptam **toda** a API: não fazem login HTTP Spring real. Verificam consulta explícita, offset de São Paulo em navegador de Tóquio, multidia, envios repetidos, respostas/erros antigos, filtros alterados/limpos, duração/zeros, DTO incoerente, erros400/403/404/409/503/rede, sessão401, logout/CSRF, texto seguro, teclado/foco e viewport. Exercitar erro409 é teste do tratamento comum, não criação de regra de negócio de relatório.

A tela recebe somente o agregado de conflitos; não recebe instantes/intervalos de tentativas para recalculá-los. Os exemplos de recorte/momento na fixture manual são didáticos e não provam o cálculo ou a seleção SQL reais. O #37 e os testes Java anteriores conservam seu escopo original.

## Prévia e evidências visuais

Seguir o [roteiro manual](marcos-6-verificacao.txt). Iniciar `node tests/browser/relatorios-utilizacao-preview.mjs` e abrir `http://127.0.0.1:4174/pages/relatorios-utilizacao.html`. Não há login real nessa prévia. Cenário fictício:17/11/2026,10h–11h,1reserva com recursos1/2/3 e1evento de conflito às10h30 no recurso2. Não derivar permissão RF12 do perfil fictício Administrador.

- [Desktop inicial](evidencias/marcos-6/desktop-inicial.png) e [resultado](evidencias/marcos-6/desktop-resultado.png).
- [Celular inicial](evidencias/marcos-6/mobile-inicial.png) e [resultado](evidencias/marcos-6/mobile-resultado.png).

As capturas são da prévia identificada, não do backend. Inspeção do agente conferiu formulário, cards e tabela sem corte lateral. Marcos aprovou a revisão no chat em13/11/2026: **“vamos deixar do jeito que está por enquanto. revisão aprovada, vamos seguir para o commit e push”**. Formato de data mantido; nenhum ajuste de código após esse aceite. Documentos e campo de aceite do artefato atualizados, preservando os hashes das fontes/capturas testadas e as contagens96/334.

## Pendências para concluir

1. Publicar o commit/push autorizado do incremento controlado; abertura de PR, revisão da equipe e integração seguem passos próprios.
2. Backend entregar serviço agregador, DTO/HTTP e política de perfis/escopo RF12. Ratificar ou conciliar diferenças em relação ao candidato.
3. Validar no Spring/MySQL isolados, sem interceptações: totais/recorte/multirrecurso, projeção autorizada, conflitos por ocorrência e perfis permitidos/negados; registrar versões e comparação com domínio/dados conhecidos.

RF12 continua parcial até essa integração. Nenhum endpoint backend, migração, política nova por perfil, CSV, gráfico, caixa RF11 ou confirmação de entrega de notificações foi acrescentado. A indisponibilidade compartilhada do scanner Maven não é tratada como novo bloqueio de implementação de Marcos, conforme orientação anterior; nenhum resultado de CI remota foi produzido por este build local.
