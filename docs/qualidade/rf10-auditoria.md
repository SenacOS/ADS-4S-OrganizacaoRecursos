# RF10 — Auditoria de mudanças (implementação)

## Arquitetura
- Persistência MySQL em V3__auditoria.sql, tabela append-only auditoria, índices por entidade/ID e correlação.
- AuditoriaJdbc implementa duas portas já usadas no domínio:
  - AuditoriaPort para ReservaService (criação, edição, aprovação, rejeição, cancelamento e transições).
  - EventosDominioPort para RecursoService e MovimentacaoService (cadastro, manutenção, expediente, retirada/devolução).
- Cada registro guarda atorId, entidade/ID, acao, snapshots antes/depois, momento UTC e correlacaoId.
- O registro acontece com @Transactional(MANDATORY) na mesma transação da alteração, sem REQUIRES_NEW.
  Em rollback ou operação inválida, a trilha daquela operação também é revertida.
- Antes/depois passam por lista branca (AuditoriaResumo); valores livres e credenciais não são persistidos.
  Quando não há campos seguros reconhecidos, o valor é [detalhes omitidos].
- O próprio banco proíbe UPDATE e DELETE por triggers; nenhuma rota HTTP de escrita é exposta.
  O identificador do ator não possui FK propositalmente, para que o histórico sobreviva à desativação/exclusão de usuário.
- GET /api/auditoria/{entidade}/{entidadeId}: exclusivo do papel ADMINISTRADOR, via SecurityConfig.
  Não retorna dados brutos além dos resumos seguros.

## Dependências / ordem das migrações
V1__item18.sql (recursos e usuários) -> V2__perfil_usuarios.sql (RF01) -> V3__auditoria.sql (RF10).
Este PR começa baseado na branch feat/session-aauth para evitar versão V2 colidente ou fora de ordem.
Após integrar o PR #8, retargetar este PR para develop.

## Evidências / testes a executar
- AuditoriaMysqlIT: persistência após commit, trilha de criação/conclusão, rollback, privacidade,
  impedimento SQL de UPDATE/DELETE e transação obrigatória.
- AuditoriaControllerTest: 401 anônimo; 403 solicitante; 200 administrador.
- Item18MysqlIT: fixtures @Primary preservam testes do módulo enquanto o provedor real existe.
- Executar: mvn -f backend/pom.xml clean verify (Java 21, Docker disponível).
- Relatórios: backend/target/surefire-reports, backend/target/failsafe-reports,
  backend/target/site/jacoco/index.html.

## Pendente para aceite final
- Validar com MySQL/Testcontainers no ambiente local ou CI (esta implementação ainda não foi executada aqui).
- Revisão por colega e merge após CI verde.
- Complementar evidências de auditoria de mudanças sensíveis de usuários caso o time inclua RF01 nesta trilha.
