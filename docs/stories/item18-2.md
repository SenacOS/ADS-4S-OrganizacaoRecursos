# Item 18.2 - Recursos e pesquisa RF02/RF03

Estado: Ready for Review; validado localmente, revisão e CI da equipe pendentes.

## Aceite
- [x] Código e contratos conforme decisões do plano aprovado.
- [x] Casos automatizados identificados na RTM.
- [x] Validação final registrada em docs/testes/item18-resultados.md (182 testes, sem falhas).
- [x] File list atualizada.
- [ ] Revisão de outro integrante e CI (dependência da equipe).

## File list
- `backend/src/main/java/br/senac/recursos/config/DatasConfig.java`
- `backend/src/main/java/br/senac/recursos/recurso/api/RecursoController.java`
- `backend/src/main/java/br/senac/recursos/recurso/aplicacao/FiltroRecursos.java`
- `backend/src/main/java/br/senac/recursos/recurso/aplicacao/RecursoService.java`
- `backend/src/main/java/br/senac/recursos/recurso/dominio/DadosRecurso.java`
- `backend/src/main/java/br/senac/recursos/recurso/dominio/Recurso.java`
- `backend/src/main/java/br/senac/recursos/recurso/dominio/TipoRecurso.java`
- `backend/src/main/java/br/senac/recursos/recurso/infraestrutura/CadastroMysql.java`
- `backend/src/main/java/br/senac/recursos/reserva/api/ReservaExceptionHandler.java`
- `backend/src/main/java/br/senac/recursos/shared/ErroDominio.java`
- `backend/src/main/java/br/senac/recursos/shared/EventosDominioPort.java`
- `backend/src/main/java/br/senac/recursos/shared/Pagina.java`
- `backend/src/main/java/br/senac/recursos/shared/Permissoes.java`
- `backend/src/test/java/br/senac/recursos/item18/Item18ApiTest.java`

Integração de segurança/auditoria/notificação: contratos implementados, provedores reais fora deste item.
