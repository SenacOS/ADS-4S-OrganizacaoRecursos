# Integração após merge do PR #27 — 12/11/2026

Marcos informou o merge; conferência GitHub confirmou [PR #27 mesclado](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/27), develop `4cea1772ce499ad51cb42d0563790ff1e2ca3ed3`, às 14:42:02 de São Paulo. A branch local continua `feature/marcos-integracao-q9`, HEAD `8c21a43`, agora com merge **sem commit** de `4cea177`. Nenhum novo commit, push ou PR criado pelo assistente.

## Preservação e atualização

Antes de refazer a incorporação pendente do #26, foram copiados e conferidos por SHA256 os 17 arquivos autorais, além de snapshot do índice/MERGE_HEAD, em `.aiox-core/local/backups/marcos-q9-pr27-c6e27bf5`. O merge anterior foi abortado e os hashes dos arquivos locais conferidos novamente. Apenas `reservas-leitura-contrato.md`, que também mudou no #27, precisou ser recuperado temporariamente da base para permitir o novo merge; sua versão autoral ficou no backup. A versão do PR foi preservada e recebeu referência às novas evidências. Demais arquivos locais foram mantidos.

Novo merge sem conflitos, sem rebase ou reescrita de commits publicados. O backend incorporado é o da equipe; nenhuma implementação Java/migração ou configuração de produto foi alterada localmente. O #27 conecta o GET da fila ao caso de uso/adaptador do #22 e centraliza o predicado Q9, mantendo rotas/DTO e exigência de todos os vínculos.

## Execuções reais

**10 PASS, 0 FAIL** no auxiliar Q9, rodada final às 14:59:46–14:59:50 de São Paulo. [JSON](marcos-integracao-q9-1-pr27/q9-resultados.json), [captura da fila](marcos-integracao-q9-1-pr27/fila-real.png).

- Mantidos os oito cenários anteriores: fontes/V6, escopo dos Solicitantes, paginação/total, Administrador sem decisão, ausência de vínculo, parâmetros inválidos, vínculos parciais/completos, fila real com aprovação/rejeição/motivo e aprovação multi-recurso.
- Nova página 99, tamanho 1, da fila: itens vazios e total autorizado 1 preservado.
- Revogação exclusivamente do par Responsável/recurso novo da rodada: fila desse recurso passa a total 0, detalhes retornam 404 e aprovação retorna 403. O dono continua vendo a reserva SOLICITADA e o Administrador mantém a consulta. A escrita negada não muda o estado.

A restrição SQL anterior de ID/código exclusivo/perfil foi mantida tanto na concessão quanto na revogação. Nenhum vínculo antigo foi removido. A [rodada preliminar 10/0](marcos-integracao-q9-1-pr27/q9-preliminar.json), anterior à asserção explícita da decisão 403 pós-revogação sugerida pelo QA, foi preservada. A rodada final executa essa asserção e registra o hash do auxiliar correspondente.

Smoke dos fluxos existentes também repetido com o JAR novo: **16 PASS, 0 FAIL, 1 BLOQUEADO**, às 14:58. [JSON](marcos-integracao-q9-1-pr27/smoke-resultados.json). O bloqueio continua sendo a interface geral ainda ausente para listar/reabrir/editar/cancelar reservas. Não se refere à disponibilidade dos GETs nem à fila/Q9, que foram exercitados. Contagens por rodada não se somam.

Ambas as execuções usam Chrome headless, Spring e MySQL reais, sem interceptação. Captura automatizada e testes não constituem novo aceite visual humano de Marcos. Os [resultados anteriores do #26](marcos-integracao-q9-1-resultados.md) permanecem históricos e não foram substituídos.

## Ambiente e gates

Package Java21/Maven portátil: **99 fontes, BUILD SUCCESS, 7,540 s**; testes Maven omitidos explicitamente. [Extrato](marcos-integracao-q9-1-pr27/empacotamento.txt). Serviços estavam parados e foram iniciados pelo controle próprio; identidade MySQL, V1–V6 e fontes efetivamente servidas foram conferidas. Dados anteriores preservados, flags apenas runtime e worker desligado.

Os seis hashes de produto/testes frontend do build **72 unitários/240 navegador** continuam iguais; não houve mudança nesses arquivos nem na configuração frontend. A regressão isolada foi reutilizada nessa extensão, com nova prova real de compatibilidade. Auxiliar alterado passou em `node --check` e execução real. Credenciais, cookies, banco, logs brutos e JAR permanecem ignorados.

Na [CI pós-merge de 4cea177](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43272193505), job `131371325275`, passaram **244 unitários/HTTP, 57 integrações MySQL e cobertura**. JMeter passou. O scanner Maven falhou depois com `Not authorized or project not found`; testes aprovados não equivalem ao scanner aprovado. Esses testes são remotos, não executados localmente pelo package acima.

## Fechamento deste incremento

Q9/fila revalidadas na nova base. Posteriormente Marcos informou **“está aprovado. pode fazer o commit”** após a revisão preparada no Chrome; [aceite global e autorização local](marcos-integracao-q9-1-aceite-visual-2026-11-12.md). Continuam pendentes revisão de outro integrante, ratificação coletiva multi-recurso, processo administrativo dos vínculos e Sonar/CodeRabbit, além da interface geral e cenários restantes. Próximo recorte: listagem e carregamento para edição/cancelamento. Esta solicitação autoriza commit local; publicação remota separada. As referências anteriores a merge sem commit identificam a árvore usada nas execuções e não são reescritas como testes de um SHA inexistente àquela altura.
