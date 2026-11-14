# Marcos-7 — roteiro humano Q5 e acabamento

[Resultados/matriz](marcos-7-resultados.md), [massa exata](marcos-7/cancelamento-resultados.json). O novo recorte está validado tecnicamente e foi aceito por Marcos em13/11/2026, conforme registro abaixo. As etapas1–6 conservam seus aceites próprios.

1. Conferir a raiz na branch **`test/marcos-7-validacao-integrada`**. Executar `node tests/e2e-local/controle.cjs status` e abrir `http://127.0.0.1:18080/login.html`. Usar a conta fictícia **admin** do arquivo privado `.aiox-core/local/e2e/credentials.json`; não compartilhar senha/arquivo nem usar conta real.
2. Abrir **Reservas**. Filtrar **ID do recurso88**, consultar e abrir **reserva37**, de outro solicitante. O período preparado é15/11/2026,00h–01h de São Paulo.
3. Conferir campo **Justificativa do cancelamento**, limite500 e ajuda. Marcar confirmação e tentar sem texto: deve bloquear. Texto somente com espaços também não deve cancelar. Conferir que o estado continua APROVADA.
4. Digitar um motivo legível, marcar a confirmação depois de digitar e cancelar. Esperar confirmação, estado CANCELADA, histórico mantido e ações de cancelamento ocultas. O campo novo não aparece como histórico persistido na resposta porque o DTO não o expõe.
5. Filtrar **recurso89**, abrir **reserva38**, do próprio Administrador. Não deve exigir nem mostrar justificativa. Confirmar e cancelar sem texto; esperar CANCELADA.
6. Conferir navegação/menu, labels, foco/Tab, mensagens, referência quando houver erro do servidor e layout desktop/celular sem rolagem horizontal. Trocar para Solicitante/Responsável conforme necessário para revisar os escopos; nenhuma justificativa concede permissão de cancelar reserva alheia.
7. Confirmar que Relatórios continua acessível somente ao Administrador e que logout/sessão funcionam. Não repetir o aceite completo do RF12 só para preencher contagem; seus testes reais atuais estão relacionados na matriz.

- [x] Q5 em reserva de terceiro: exigência/limite/confirmação/resultado aceitos pelo autor.
- [x] Administrador dono: cancelamento sem motivo aceito pelo autor.
- [x] Navegação, mensagens, teclado e layout do incremento aprovados pelo autor.

Se as reservas37/38 já tiverem sido usadas, não tentar cancelar novamente: executar `node tests/e2e-local/validar-cancelamento.cjs` para nova massa e consultar os IDs em `massa`/`paraAceite` da nova rodada privada, preservando os resultados anteriores. Não apagar nem alterar estados/datas diretamente no banco.

## Aceite do autor — 13/11/2026

Marcos informou **“revisão aprovada”** e pediu conferir o último PR de reservas do Silva antes do envio. A confirmação é registrada como aceite do incremento/roteiro pelo autor, sem nova saída de terminal, execução automatizada ou revisão independente atribuídas a essa mensagem. Não houve ajuste funcional solicitado.

[PR #44 conferido e documentação conciliada](marcos-7-pr44-revisao.md). O incremento mantém `Ready for Review`; publicação, CI e revisão da equipe têm registros próprios. Commit/push/PR somente por solicitação própria.
