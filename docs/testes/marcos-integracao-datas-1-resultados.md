# FE-004 — correção validada no cliente e no ambiente real

12/11/2026. Base develop `da5881b`, branch `fix/marcos-qualidade-frontend`, alterações **não commitadas**. [Story](../stories/marcos-integracao-datas-1.md).

A primeira execução real gravou uma retirada (HTTP 201), mas a interface recusou a confirmação e as pendências. `DatasConfig` serializa `Instant` com `OffsetDateTime.toString()`; o prazo real veio `2026-11-12T13:08-03:00`. O validador do cliente exigia segundos e classificava a resposta válida como incerta. A retirada persistida não foi repetida ou apagada para melhorar o resultado.

`dataComOffset` agora aceita segundos opcionais, mantendo a fração vinculada aos segundos e exigindo offset. Mantém validação de calendário, hora e instante finito. O formato enviado pelos formulários, DTOs, estados, regras de identidade e guard de operação incerta foram preservados. Backend e contratos não mudaram.

## Regressões executadas

Os dois testes unitários novos foram executados antes da correção: falharam pela recusa da precisão de minuto e por `RESPOSTA_INVALIDA`. [Saída RED](marcos-integracao-datas-1-red.txt). A primeira tentativa dentro do sandbox nem iniciou os subprocessos (`spawn EPERM`); foi repetida fora dessa restrição antes da mudança. Não confundir essa limitação ambiental com o defeito reproduzido.

Após a correção:

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
npm.cmd run build
```

**Exit 0:** lint/typecheck aprovados, **72 unitários e 240 execuções de navegador**, 120 por viewport, zero falhas, ignorados ou flaky/retries. Navegador: 157,546 s. [Log](marcos-integracao-datas-1-verificacao.txt), [estatísticas e hashes](marcos-integracao-datas-1.json). A rodada inclui os dois testes administrativos da story de qualidade; as contagens são cumulativas, não somáveis às execuções anteriores.

As novas verificações exercitam DTO/consulta/retirada/devolução, equivalência de instantes, limites inválidos e confirmação na interface com prazo em minutos e retirada com fração. A regressão de navegador usa API controlada e permanece identificada como frontend isolado.

## Repetição real

O JAR foi reempacotado com Java21/Maven locais (**testes Maven omitidos explicitamente**) e o processo próprio foi reiniciado. O hash de `datas.js` efetivamente servido pelo Spring confere com a fonte `4aa2ca0259b58e808e15c7c9eca3b3f3048e506c3fdb6a84ead658635a2a5cd7`.

Na rodada real final de 12:32:44–12:32:52 de São Paulo, retirada e devolução pelo Responsável foram confirmadas no Chrome e persistidas no MySQL: movimentação #3, reserva #5, operador #3, atraso 0. Pendências com prazo em minutos também foram renderizadas, inclusive a retirada antiga que havia revelado o defeito. [Resultado completo](marcos-e2e-local-2026-11-12-resultados.md) e [JSON da rodada](marcos-e2e-local-2026-11-12/resultados.json).

A [consulta HTTP complementar](marcos-e2e-local-2026-11-12/movimentacao-final.json), sem repetir a escrita, confirmou `retiradoEm: 2026-11-12T12:32:50.925809-03:00`, `fimPrevisto: 2026-11-12T13:15-03:00` e `devolvidoEm: 2026-11-12T12:32:51.188390-03:00`. A reprodução após a correção inclui, portanto, o formato real em minutos.

O smoke real aprovou 16 cenários, zero falhas e um bloqueio explícito de leituras de reservas ausentes. Isso não comprova fila/Q9, reabertura da edição, concorrência, atraso final após o prazo ou todos os cenários integrados do plano. A análise Sonar/CodeRabbit e a revisão humana da equipe permanecem separadas.
