# RF10 — Auditoria de mudanças (implementação)


**Atualização em 13/11/2026:** este arquivo preserva o registro técnico original da implementação de RF10. As seções de dependências e evidências abaixo descrevem o contexto do incremento inicial e não devem ser interpretadas como checklist atual de integração. A suíte backend foi executada na CI do PR #43, com Maven, MySQL/Testcontainers e gates JaCoCo concluídos com sucesso ([execução 43525712520](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43525712520)). Consulte também a [RTM vigente](../RTM.md).

**Limite operacional ainda aberto:** o serviço não expõe operações de alteração ou exclusão da auditoria, mas a proteção contra SQL privilegiado depende de uma conta de runtime separada, com grants limitados, distinta da conta de migração. A validação dessa separação no ambiente operacional ainda precisa de evidência própria.


## Arquitetura
- Persistência MySQL em V3__auditoria.sql, tabela destinada a registros append-only e índices por entidade/ID e correlação.
- AuditoriaJdbc implementa duas portas já usadas no domínio:
  - AuditoriaPort para ReservaService (criação, edição, aprovação, rejeição, cancelamento e transições).
  - EventosDominioPort para RecursoService e MovimentacaoService (cadastro, manutenção, expediente, retirada/devolução).
- Cada registro guarda atorId, entidade/ID, acao, snapshots antes/depois, momento UTC e correlacaoId.
- O registro acontece com @Transactional(MANDATORY) na mesma transação da alteração, sem REQUIRES_NEW.
  Em rollback ou operação inválida, a trilha daquela operação também é revertida.
- Antes/depois passam por lista branca (AuditoriaResumo); valores livres e credenciais não são persistidos.
  Quando não há campos seguros reconhecidos, o valor é [detalhes omitidos].
- O serviço expõe apenas registro (INSERT) e consulta (SELECT), sem rota HTTP de escrita ou exclusão.
  A migração não cria triggers: MySQL com binary logging pode exigir privilégio SUPER (erro 1419).
  Para impedir UPDATE/DELETE até por SQL em produção, configurar uma **conta de runtime separada**,
  com somente INSERT e SELECT sobre `auditoria`, e conta privilegiada distinta para migrações.
  Com a conta atual compartilhada entre aplicação e Flyway, imutabilidade no banco contra acesso SQL privilegiado **não é garantida**.
  O identificador do ator não possui FK propositalmente, para preservar o histórico após desativação/exclusão de usuário.
- GET /api/auditoria/{entidade}/{entidadeId}: exclusivo do papel ADMINISTRADOR, via SecurityConfig.
  Não retorna dados brutos além dos resumos seguros.

## Dependências / ordem das migrações — registro histórico do PR inicial
V1__item18.sql (recursos e usuários) -> V2__perfil_usuarios.sql (RF01) -> V3__auditoria.sql (RF10).
Este PR começa baseado na branch feat/session-aauth para evitar versão V2 colidente ou fora de ordem.
Após integrar o PR #8, retargetar este PR para develop.

## Escopo dos testes — referência técnica do incremento original
- AuditoriaMysqlIT: persistência após commit, trilha de criação/conclusão, rollback, privacidade,
  append-only via serviços, privacidade e transação obrigatória.
- AuditoriaControllerTest: 401 anônimo; 403 solicitante; 200 administrador.
- Item18MysqlIT: fixtures @Primary preservam testes do módulo enquanto o provedor real existe.
- Executar: mvn -f backend/pom.xml clean verify (Java 21, Docker disponível).
- Relatórios: backend/target/surefire-reports, backend/target/failsafe-reports,
  backend/target/site/jacoco/index.html.

## Pendências remanescentes / limites operacionais

- **Privilégios SQL da auditoria:** provisionar e validar, no ambiente operacional, a conta de runtime com privilégios limitados a `INSERT` e `SELECT` em `auditoria`, mantendo a conta de migração separada. A conta compartilhada atual não garante imutabilidade contra uma conexão SQL privilegiada.
- **Abrangência da auditoria de usuários:** a documentação de segurança já registra `UsuarioAuditoriaMysqlIT` e `AuditoriaResumoTest` para a criação de usuário. Qualquer ampliação para outras mudanças sensíveis de RF01 deve ser decidida contra o escopo oficial e registrada com evidência, não presumida como requisito adicional já aprovado.
