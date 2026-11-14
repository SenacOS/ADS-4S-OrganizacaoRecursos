# CHANGELOG — Organização de Recursos

## [Não lançado] — preparação do v1.0.0-rc1 — 13/11/2026

**Estado:** candidato em preparação; **não há tag publicada ou CI verde da main** confirmadas nesta avaliação. A versão funcional analisada foi a `main` em `548f8b0b95980a3e292f271b9676105473822ead`, integrada pelo [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).

### Funcionalidades presentes na árvore integrada

- RF01: autenticação por sessão, autorização por papéis e proteção CSRF.
- RF02/RF03: cadastro e pesquisa de salas, professores e materiais, filtros de disponibilidade.
- RF04–RF08: criação, edição, cancelamento, aprovação/rejeição, consistência de reservas, manutenção e expediente.
- RF09: retirada e devolução de materiais.
- RF10: auditoria de operações relevantes.
- RF11: notificações baseadas em outbox transacional, com execução simulada documentada.
- RF12: relatórios de utilização e conflitos evitados.
- RF13/RF14: frontend HTML/CSS/JS responsivo, integração de API e documentação.
- Ajustes Q1, Q3, Q5, Q8 e Q9 incorporados segundo o histórico de PRs e `docs/RTM.md`.

### Qualidade e documentação

- Suítes JUnit/Spring, Testcontainers/MySQL, Playwright e quatro cenários JMeter;
- JaCoCo e workflow GitHub Actions;
- Dossiês e matrizes existentes em `docs/qualidade/`, `docs/testes/`, `docs/RTM.md`;
- Novo pacote documental proposto: `docs/entrega/checklist.md`, `docs/evidencias/README.md`, `docs/decisao-qualidade.md`, `docs/relatorio-qualidade.md`, `docs/performance/resultado-01.md` e `docs/defeitos/README.md`.

### Pendências para publicar a versão

- Comprovar clone limpo, execução da aplicação e testes; o repositório ainda não possui Maven Wrapper;
- CI totalmente verde em `main`, incluindo solução para falha do scanner Sonar;
- Validar artefatos de testes e carga no **mesmo SHA** a ser marcado;
- Revisão/aceite formal do grupo e criação posterior de tag anotada `v1.0.0-rc1`.

**Não tratar este changelog como confirmação de release publicado.** Se for preciso corrigir algo depois de publicar `v1.0.0-rc1`, criar uma nova tag `v1.0.0-rc2`, sem mover a anterior.
