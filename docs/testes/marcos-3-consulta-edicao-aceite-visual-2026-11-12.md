# Aceite visual — consulta, edição e cancelamento de reservas

Em **12/11/2026**, Marcos informou: **“os testes funcionaram. está aprovado e podemos commitar”**, após a revisão preparada no Chrome com Spring/MySQL reais no ambiente isolado.

Branch `feature/marcos-reservas-consulta`, criada sobre `f9c4912`, com develop `4cea177` e os PRs #26/#27 incorporados. O aceite autoriza o commit local deste incremento e de suas evidências. Push, criação de PR e merge remoto seguem separados.

## Preparação e roteiro apresentados

Sete arquivos servidos pelo JAR conferidos com a fonte por SHA256. Criados cinco recursos e 22 reservas fictícias exclusivas (#70 a #91), preservando registros anteriores. O recurso #67 permite consultar 21 reservas e experimentar a paginação. A #70 contém sala #67, material #68 e docente #69; material adicional #70 foi preparado para inclusão. A #91 é restrita/SOLICITADA, em outro recurso. Vínculos do Responsável limitados à massa nova, após conferir IDs, códigos e perfil.

Três janelas separadas foram abertas já autenticadas:

- Solicitante: paginação, detalhe da #70, identificação/período/recursos, edição de fim e inclusão de material, confirmação e cancelamento mantendo histórico.
- Responsável: consulta da #70 e ausência das ações do dono; atualização do detalhe depois do cancelamento.
- Administrador: consulta da #71, cancelamento autorizado e ausência de edição de reserva alheia.

Também foi orientada conferência de mensagens, organização e largura móvel. Marcos deu aceite global, sem ajuste solicitado. Não detalhou individualmente todos os passos, viewports ou caminhos de erro; essas execuções não são presumidas. Uma consulta complementar somente de leitura encontrou #70 CANCELADA e #71 APROVADA, com os horários persistidos; não se atribui o cancelamento administrativo da #71 à revisão humana. Esse cenário já tem prova automatizada real em outra massa.

## Evidências e condição do incremento

[Build final 81 unitários/278 navegador, E2E real 8/0 e smoke 16/0/0](marcos-3-consulta-edicao-resultados.md), com [manifesto da árvore testada](marcos-3-consulta-edicao/arvore-testada.json) e [PASS técnico independente na story](../stories/marcos-3-consulta-edicao.md#qa-results). Este aceite acrescenta somente documentação; não houve mudança de produto/testes nem nova suíte por rotina.

Preparação, estado, credenciais e massa local permanecem ignorados em `.aiox-core/local/e2e/`; nenhum segredo integra o commit. As evidências anteriores conservam a identificação da árvore ainda sem commit no momento da execução. O commit que inclui este registro identifica a entrega local autorizada, sem atribuir retroativamente os testes a um SHA que ainda não existia.

Mantém-se **Ready for Review**. Aceite do autor e QA assistido não substituem revisão de outro integrante, checks/CodeRabbit/Sonar, ratificação coletiva, processo administrativo dos vínculos ou cenários restantes da matriz integrada. O incremento não declara todas as etapas 1–5 entregues à develop.
