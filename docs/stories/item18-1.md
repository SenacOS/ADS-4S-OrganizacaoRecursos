# Item 18.1 - Persistência e locks RF05/RF06

Estado: Ready for Review; validado localmente, revisão e CI da equipe pendentes.

## Aceite
- [x] Código e contratos conforme decisões do plano aprovado.
- [x] Casos automatizados identificados na RTM.
- [x] Validação final registrada em docs/testes/item18-resultados.md (182 testes, sem falhas).
- [x] File list atualizada.
- [ ] Revisão de outro integrante e CI (dependência da equipe).

## File list
- `backend/pom.xml`
- `backend/src/main/java/br/senac/recursos/config/Item18Config.java`
- `backend/src/main/java/br/senac/recursos/recurso/infraestrutura/Banco.java`
- `backend/src/main/java/br/senac/recursos/recurso/infraestrutura/ExpedienteMysql.java`
- `backend/src/main/java/br/senac/recursos/recurso/infraestrutura/OcupacoesMysql.java`
- `backend/src/main/java/br/senac/recursos/recurso/infraestrutura/RecursosMysql.java`
- `backend/src/main/java/br/senac/recursos/reserva/aplicacao/ReservaService.java`
- `backend/src/main/java/br/senac/recursos/reserva/infraestrutura/ConflitosMysql.java`
- `backend/src/main/java/br/senac/recursos/reserva/infraestrutura/ReservaEntidade.java`
- `backend/src/main/java/br/senac/recursos/reserva/infraestrutura/ReservaMysql.java`
- `backend/src/main/java/br/senac/recursos/reserva/infraestrutura/ReservaTransacional.java`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/db/migration/V1__item18.sql`
- `backend/src/test/java/br/senac/recursos/reserva/aplicacao/ReservaServiceTest.java`
- `backend/src/test/resources/docker-java.properties`
- `compose.yml`
- `docs/arquitetura/item18-persistencia.md`
- `docs/integracao/rollback-item18.sql`

Integração de segurança/auditoria/notificação: contratos implementados, provedores reais fora deste item.
