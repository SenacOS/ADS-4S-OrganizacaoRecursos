# Aceite visual — correções e integração local de Marcos

Em **12/11/2026**, após a preparação da revisão no Chrome, Marcos informou: **“revisão visual aprovada”**. Nenhum ajuste foi solicitado nessa confirmação.

Branch `fix/marcos-qualidade-frontend`, base develop `da5881bcb65dcf048678b784ed14ae3013feabc2`, com correções ainda não commitadas. Aceite relacionado aos incrementos [Marcos-qualidade-1](../stories/marcos-qualidade-1.md), [Marcos-integracao-datas-1](../stories/marcos-integracao-datas-1.md) e [Marcos-e2e-1](../stories/marcos-e2e-1.md).

## Ambiente e roteiro apresentados

Spring e MySQL reais, instância isolada local, dados fictícios, frontend em `http://127.0.0.1:18080`. Os serviços estavam parados e foram reiniciados pelo controle próprio, preservando os dados. Três janelas do Chrome foram abertas com sessões separadas e autenticadas, sem interceptação de API.

| Perfil | Preparação e roteiro |
|---|---|
| Responsável | Reserva #9 APROVADA, material #20, patrimônio `REV-RET-d657528b`, período de 13:33 a 15:33 de São Paulo. Escolher material, conferir/confirmar retirada, consultar pendência e registrar devolução, conferindo mensagens e datas. |
| Administrador | Editor do docente #18 aberto. Reordenar competências, salvar e conferir confirmação; observar também os horários de funcionamento. |
| Solicitante | Pesquisa preenchida com material #21, patrimônio `REV-NOVA-d657528b`, disponível para nova solicitação. Selecionar, solicitar e conferir estado APROVADA. |

Os IDs são referências desta revisão, não dados fixos para outra execução. O roteiro incluiu disposição das telas, botões e mensagens. Marcos deu aceite global; não descreveu separadamente a execução de cada item, viewport ou caminho de erro. Não se atribui ao aceite uma cobertura maior que a informada.

O auxiliar específico da revisão e seu estado permanecem ignorados em `.aiox-core/local/e2e/`; nenhuma credencial, sessão ou código de demonstração foi acrescentado ao produto.

## Evidências e limites

A regressão anterior continua válida: lint/typecheck, **72 unitários e 240 testes de navegador** aprovados. O smoke real e sua reexecução pelo autor têm **16 PASS, 0 FAIL e 1 BLOQUEADO**, com hashes preservados. [Regressão e FE-004](marcos-integracao-datas-1-resultados.md), [execuções reais](marcos-e2e-local-2026-11-12-resultados.md).

Este registro altera somente documentação, sem nova suíte, alteração de produto ou parecer de QA. O aceite do autor é separado da revisão assistida QA já registrada e da revisão de outro integrante ainda necessária. GETs de reservas/fila, autorização Q9, cenários integrados restantes, CodeRabbit e Sonar continuam pendentes conforme o [plano](../planejamento/marcos-fechamento-etapas-1-a-5.md).

Incremento local com **aceite visual do autor registrado**, mantendo as stories Ready for Review. Nenhum commit, push, PR ou encerramento integral das etapas 1 a 5 é inferido desta aprovação. O commit aguarda solicitação de Marcos.
