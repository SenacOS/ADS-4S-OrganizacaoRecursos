# Evidências do item 18

Execução local em 09/11/2026: `mvn verify`, exit code 0. Java Temurin 21.0.13+9, Spring Boot 3.5.7, MySQL 8.4 em Testcontainers 1.21.3, Docker Desktop 29.4.0 (API 1.44).

- Unitários/HTTP: 167; falhas 0, erros 0, ignorados 0.
- Integração MySQL: 15; falhas 0, erros 0, ignorados 0.
- JaCoCo: linhas 90.81%; branches 75.0%, sem excluir código de produção da cobertura.
- Detalhes reproduzíveis: `backend/target/surefire-reports`, `backend/target/failsafe-reports`, `backend/target/site/jacoco/index.html`; resumo persistido em item18-resultados.json.

As integrações verificam migração vazia, constraints/FKs, rollback após falha de auditoria de teste, duplicidade de patrimônio, filtros/competências, expediente, manutenção, bloqueios, retirada/devolução, atraso e concorrência com conexões independentes. Corridas abrangem sala/professor/material, conjunto em ordem oposta, manutenção/reserva, duas retiradas e duas devoluções. Há prova de paralelismo de recursos distintos e da UNIQUE de retirada aberta mesmo com INSERT direto. O teste de inicialização abre um contexto real sem provedores externos, confirma APIs desligadas e recusa obtenção do serviço sem auditoria.

Não há evidência de autenticação/CSRF, auditoria/notificação reais, execução em CI, SonarCloud ou revisão por colega. As fixtures de teste não são distribuídas em produção. Os relatórios medem os testes existentes mais os novos, não a aplicação completa de todos os integrantes. BDD de dupla retirada está descrito em item18-bdd.feature e ligado às asserções JUnit; não se declara TDD retroativo RED/GREEN/REFACTOR.

A preparação foi local: JDK 21 e Maven portáteis em diretório temporário, Docker Desktop iniciado; não houve instalação global, push ou publicação.
