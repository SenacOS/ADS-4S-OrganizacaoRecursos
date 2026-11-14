# Item 18.4 - Movimentações e evidências RF09

Estado: Ready for Review; validado localmente, revisão e CI da equipe pendentes.

## Aceite
- [x] Código e contratos conforme decisões do plano aprovado.
- [x] Casos automatizados identificados na RTM.
- [x] Validação final registrada em docs/testes/item18-resultados.md (182 testes, sem falhas).
- [x] File list atualizada.
- [ ] Revisão de outro integrante e CI (dependência da equipe).

## File list
- `backend/src/main/java/br/senac/recursos/movimentacao/api/MovimentacaoController.java`
- `backend/src/main/java/br/senac/recursos/movimentacao/aplicacao/MovimentacaoService.java`
- `backend/src/main/java/br/senac/recursos/movimentacao/dominio/Movimentacao.java`
- `backend/src/main/java/br/senac/recursos/movimentacao/infraestrutura/MovimentacaoMysql.java`
- `backend/src/test/java/br/senac/recursos/item18/Item18MysqlIT.java`
- `docs/testes/item18-bdd.feature`

Integração de segurança/auditoria/notificação: contratos implementados, provedores reais fora deste item.
