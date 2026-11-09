# ADR-001 — Monólito modular, frontend estático e Maven

**Estado: APROVADO** · Decisões: D01, D02, D03 (build)

## Contexto
O projeto é acadêmico, com equipe de 4 pessoas, e é avaliado por qualidade demonstrável. Java 21 e Spring Boot 3.x são obrigatórios.

## Decisão
- Uma única aplicação Spring Boot 3.x (Java 21), organizada em módulos por domínio: `usuario`, `seguranca`, `recurso`, `reserva`, `movimentacao`, `auditoria`, `notificacao`, `relatorio`, `shared`.
- Frontend em HTML5, CSS3 e JavaScript puro (módulos ES), **servido pelo próprio Spring Boot** em `backend/src/main/resources/static/`. Essa pasta é a fonte única; não existe pasta `frontend/` separada.
- Build com Maven, projeto único em `backend/`.
- Módulos conversam por serviços; `reserva` é o único dono da regra de sobreposição.

## Alternativas descartadas
- Microsserviços: complexidade de infraestrutura sem ganho para o escopo.
- SPA com Node/React: contraria D02 e acrescenta toolchain.
- Pasta `frontend/` com cópia no build: duas fontes de verdade.

## Consequências
Deploy único e testes mais simples. Exige disciplina de fronteiras entre pacotes (revisão em PR).
