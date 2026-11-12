# Item 18.1 - Persistência e locks RF05/RF06

Estado: Ready for Review; validado localmente, revisão e CI da equipe pendentes.

## Aceite
- [x] Código e contratos conforme decisões do plano aprovado.
- [x] Casos automatizados identificados na RTM.
- [x] Validação final registrada em docs/testes/item18-resultados.md (182 testes, sem falhas).
- [x] File list atualizada.
- [ ] Revisão de outro integrante e CI (dependência da equipe).

## Pendências de integração com reservas

- [x] CT19 no MySQL com duas a seis edições concorrentes, troca em ordem oposta, edição contra criação e disputa por um recurso novo.
- [x] Adaptador MySQL da fila de aprovação aprovado pelos sete cenários do contrato e pelo teste das projeções.
- [x] Proposta da porta de leitura do RF12 registrada para revisão do Silva.
- [x] Validação e lista de arquivos do complemento registradas em `docs/testes/item18-resultados.md`.

## Integração da fila com a Q9

- [x] Conectar o GET da fila ao adaptador MySQL do PR #22, com o escopo da Q9.
- [x] Confirmar listagem, detalhe, projeções e total após a autorização no SQL.
- [x] Documentar o vínculo da V6 e validar a integração HTTP com MySQL.

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

### Arquivos do complemento de reservas

- `backend/pom.xml` — correção da declaração XML.
- `backend/src/main/java/br/senac/recursos/reserva/infraestrutura/ReservaFilaMysql.java`
- `backend/src/main/resources/db/migration/V5__indice_fila_aprovacao.sql`
- `backend/src/test/java/br/senac/recursos/item18/Item18MysqlIT.java`
- `backend/src/test/java/br/senac/recursos/reserva/aplicacao/ReservaFilaMysqlIT.java`
- `docs/integracao/dependencias-e-revisores.md`
- `docs/integracao/proposta-porta-leitura-rf12.md`
- `docs/integracao/revisao-contrato-fila-rf07.md`
- `docs/testes/item18-resultados.md`

### Arquivos da integração com a Q9

- `backend/src/main/java/br/senac/recursos/config/Item18Config.java`
- `backend/src/main/java/br/senac/recursos/reserva/api/ReservaApiMapper.java`
- `backend/src/main/java/br/senac/recursos/reserva/api/ReservaLeituraController.java`
- `backend/src/main/java/br/senac/recursos/reserva/infraestrutura/ReservaAcessoMysql.java`
- `backend/src/main/java/br/senac/recursos/reserva/infraestrutura/ReservaConsultaMysql.java`
- `backend/src/main/java/br/senac/recursos/reserva/infraestrutura/ReservaFilaMysql.java`
- `backend/src/test/java/br/senac/recursos/reserva/api/ReservaLeituraSegurancaTest.java`
- `backend/src/test/java/br/senac/recursos/reserva/infraestrutura/ReservaQ9MysqlIT.java`
- `docs/api/reservas-leitura-contrato.md`
- `docs/seguranca/q9-autorizacao-reservas.md`
- `docs/testes/item18-resultados.md`

Integração de segurança/auditoria/notificação: contratos implementados, provedores reais fora deste item.
