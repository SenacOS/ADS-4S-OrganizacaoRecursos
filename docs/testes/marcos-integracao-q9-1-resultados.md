# Integração Q9 e fila real — 12/11/2026

**Histórico do PR #26:** este relatório registra a validação em `3f2a9a3`. Posteriormente o PR #27 foi mesclado em `4cea177` e revalidado; consultar [resultado posterior](marcos-integracao-q9-1-pr27-resultados.md). A seção abaixo que descreve #27 aberto é a conferência daquele momento, superada pelo novo merge confirmado.

Branch `feature/marcos-integracao-q9`, HEAD `8c21a43` (qualidade/datas, push confirmado) com merge **sem commit** da develop `3f2a9a3` (PR #26). Nenhum conflito. A identidade Git local continua Marcos Boé. Nenhum novo commit, push, PR ou mensagem à equipe nesta execução.

## Resultado efetivo

**8 cenários Q9 aprovados, zero falhas**, em Chrome headless/Spring/MySQL reais, sem interceptação. [JSON original final](marcos-integracao-q9-1/q9-resultados.json) e [captura da fila](marcos-integracao-q9-1/fila-real.png).

1. Flyway V1–V6 e hashes dos módulos servidos iguais às fontes.
2. Solicitante: total/paginação somente das próprias reservas, detalhe completo autorizado e 404 para reserva de outro Solicitante.
3. Administrador: consulta todas as reservas da massa e recebe 403 ao aprovar.
4. Responsável sem vínculo: fila vazia e detalhe 404; decisão 403. Parâmetros inválidos 400 e consulta sem sessão 401.
5. Vínculo parcial: reserva com dois recursos continua invisível/404; decisão 403 e estado SOLICITADA preservado.
6. Vínculo completo: detalhe e fila passam a incluir a reserva multi-recurso.
7. UI existente: identificação mínima/recursos, filtro real, aprovação confirmada e remoção da fila; rejeição em branco impedida, motivo preenchido persistido, sem erro JavaScript.
8. Aprovação multi-recurso por HTTP após o vínculo completo, seguida de leitura APROVADA com os dois recursos. A negativa com vínculo parcial foi conferida antes.

Após revisão assistida QA, a segunda página também teve solicitante/ausência de ID alheio verificados explicitamente. A [rodada preliminar 7/0](marcos-integracao-q9-1/q9-preliminar.json) foi preservada; a versão final acima passou 8/0, sem alterar produto ou política.

O script `validar-q9.cjs` verifica código/ID dos recursos exclusivos da rodada e perfil ativo do Responsável antes de inserir vínculos. Usa somente a instância isolada identificada; não concede acesso global, altera vínculo antigo ou cria endpoint de concessão. Senha do segundo Solicitante, cookies e configurações ficam ignorados. Duas rodadas preliminares também passaram (7/0), antes dos ajustes de sanitização/proveniência; originais privados preservados. A rodada publicada corresponde ao hash da versão final do auxiliar, que funciona com ou sem merge em andamento.

O smoke atualizado também passou: **16 PASS/0 FAIL/1 BLOQUEADO**; [JSON](marcos-integracao-q9-1/smoke-resultados.json). Agora reconhece V6 e GETs disponíveis. O bloqueio registrado é a **interface geral ainda ausente** para listar/reabrir/editar/cancelar reservas; não afirma mais ausência de GETs ou impossibilidade de testar Q9/fila. As contagens de rodadas/suítes não se somam.

## Build, base e evidências anteriores

Package com JDK21/Maven portáteis: 99 fontes, `BUILD SUCCESS`, 7,453 s. Testes Maven **explicitamente omitidos**; [extrato](marcos-integracao-q9-1/empacotamento.txt). V6 aplicada somente ao MySQL local identificado, dados preservados, flags runtime e worker desligado. A preparação encontrou MySQL parado com Java ainda ativo; recuperou a instância própria para validar identidades e executar o encerramento/empacotamento/reinício. Sem mudança em configurações globais ou produto.

Os seis arquivos de produto/testes do [build 72 unitários/240 navegador](marcos-integracao-datas-1.json) mantiveram os mesmos hashes. Nenhum cliente/tela/configuração frontend precisou mudar; essa regressão não foi repetida. Os dois auxiliares alterados passaram em `node --check` e execução real. Backend Java/migração/testes novos são os importados do PR #26, sem ajuste autoral local.

Na [CI da nova develop](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43263833919), job `131341944542`, passaram **243 unitários/HTTP, 56 integrações MySQL e cobertura**; o scanner falhou depois com `Not authorized or project not found`. JMeter passou. Esses resultados são remotos, distintos do package/smoke local; remediação Sonar continua pendente.

## Contrato e próximos passos

### Complemento anunciado: PR #27 ainda aberto

Conferido em 12/11/2026: [PR #27](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/27), head `7fe9fe0`, base develop `3f2a9a3`, aberto e ainda não mesclado. Complementa o #26: encaminha a fila do Responsável para `ConsultarFilaAprovacao`/adaptador do PR #22, compartilha o predicado SQL Q9 entre fila/lista/detalhe e acrescenta testes de projeção, total em página vazia e revogação do vínculo. Mantém rotas, DTO e exigência de vínculo com todos os recursos.

A [CI do #27](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43266907364), job `131352774739`, aprovou 244 unitários/HTTP, 57 integrações e cobertura; o scanner Maven falhou depois por `Not authorized or project not found`. O check separado SonarCloud Code Analysis passou, assim como JMeter; isso não equivale ao workflow completo aprovado. A recomendação automática de revisão não é aprovação humana.

Não foi incorporado ao merge local nem executado neste ambiente por esta conferência. Os 8/0 e 16/0/1 deste relatório correspondem ao #26. Quando o #27 chegar à base de integração, preservar o trabalho local, conciliar o documento de contrato também alterado por ele e repetir os cenários reais com o JAR correspondente. O novo PR não exige recriar a interface; seu backend complementar precisa de validação própria após integração.

[Contrato conferido das consultas](../api/reservas-consulta-contrato.md). Marcos aceitou consumir a exigência de todos os vínculos; não se presume ratificação de Silva/Fausto. O processo administrativo de manter os vínculos e confirmação coletiva continuam com a equipe.

Os GETs/404/projeções/vínculos básicos foram entregues pelo PR #26 e exercitados. O próximo recorte implementará listagem e carregamento para edição/cancelamento pela interface. Não estão concluídos: matriz E2E completa, concorrência em todos os estados, expiração, paginação visual com mais de 20 solicitações, revisão humana deste incremento e remediação de Sonar/CodeRabbit. Aceite visual anterior não é automaticamente aceite da fila agora integrada. Commit do merge/auxiliares/documentação somente quando Marcos solicitar.
