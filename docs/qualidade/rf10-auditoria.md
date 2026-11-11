# RF10 — Auditoria de mudanças (implementação)

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

## Dependências / ordem das migrações
V1__item18.sql (recursos e usuários) -> V2__perfil_usuarios.sql (RF01) -> V3__auditoria.sql (RF10).
Este PR começa baseado na branch feat/session-aauth para evitar versão V2 colidente ou fora de ordem.
Após integrar o PR #8, retargetar este PR para develop.

## Evidências / testes a executar
- AuditoriaMysqlIT: persistência após commit, trilha de criação/conclusão, rollback, privacidade,
  append-only via serviços, privacidade e transação obrigatória.
- AuditoriaControllerTest: 401 anônimo; 403 solicitante; 200 administrador.
- Item18MysqlIT: fixtures @Primary preservam testes do módulo enquanto o provedor real existe.
- Executar: mvn -f backend/pom.xml clean verify (Java 21, Docker disponível).
- Relatórios: backend/target/surefire-reports, backend/target/failsafe-reports,
  backend/target/site/jacoco/index.html.

## Pendente para aceite final
- Validar com MySQL/Testcontainers no ambiente local ou CI (esta implementação ainda não foi executada aqui).
- Revisão por colega e merge após CI verde.
- Para reforçar imutabilidade contra alterações SQL diretas, adotar conta runtime com grants limitados; documentar a conta no deploy sem credenciais no repositório.
- Complementar evidências de auditoria de mudanças sensíveis de usuários caso o time inclua RF01 nesta trilha.
