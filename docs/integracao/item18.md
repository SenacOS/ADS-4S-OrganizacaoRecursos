# Executar e integrar o item 18

Pré-requisitos: JDK 21, Maven 3.9+, Docker com motor Linux ativo.

Na raiz, defina DB_PASSWORD e MYSQL_ROOT_PASSWORD no ambiente e execute `docker compose up -d --wait`. Não há credenciais fixas. Em backend, defina DB_USER=recursos, DB_PASSWORD e, se necessário, DB_URL; execute `mvn spring-boot:run`. Spring não carrega `.env` automaticamente; exporte as variáveis do processo. `compose.yml` atende apenas ao banco local, porta 127.0.0.1:3306. Flyway cria o esquema e Hibernate valida os mapeamentos.

`mvn test`: testes unitários/HTTP com doubles. `mvn verify`: também integrações MySQL em Testcontainers, sem skip automático quando Docker não existe. A configuração de testes fixa API Docker 1.44 para compatibilidade com Docker 29; não desabilita TLS do motor. No Windows, se necessário exporte DOCKER_HOST=npipe:////./pipe/dockerDesktopLinuxEngine. Relatórios: target/surefire-reports, target/failsafe-reports e target/site/jacoco/index.html. Não usar resultados de testes com doubles como comprovação de segurança, auditoria persistente ou entrega de notificações.

A aplicação inicia com rotas desligadas. Para integrá-las, fornecer AtorAutenticadoProvider por sessão e filtros CSRF/autorização, EventosDominioPort transacional (inclusive evento/notificação de devolução), AuditoriaPort e NotificacaoPort. Somente depois habilitar recursos.api.enabled, movimentacoes.api.enabled e reservas.api.enabled. A ausência desses provedores deve impedir o uso dos serviços, nunca ser substituída por no-op em produção.

Limites: frontend, usuários/perfis/login, auditoria/notificações reais, CI/Sonar e API completa de relatórios pertencem aos demais módulos. Consultas de recursos carregam candidatos e ocupações em lote e filtram antes de paginar; para bases grandes, substituir por projeção SQL equivalente, mantendo os testes e o detector como referência. Não se presume SLA numérico.

NPM lint/typecheck/test do AGENTS pertencem ao scaffold AIOX; não há package.json na raiz. Os gates aplicáveis ao backend são Maven e testes MySQL. A base AIOX foi preservada.
