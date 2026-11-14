# Changelog — Organização de Recursos

**Situação em 14/11/2026:** PR #50 integrado; CI do PR aprovada. A execução da `main` no commit `5e9b9ea` ocorreu, mas terminou com falha de autorização do SonarCloud (`Not authorized or project not found`). A release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) foi publicada; a CI verde e o Quality Gate do SHA da tag não estão comprovados. Clone limpo independente ainda não foi realizado (limitação do ambiente de verificação); o projeto usa `mvn` instalado, não `./mvnw`.


Histórico resumido do conteúdo integrado. **Release candidate publicado; a validação integral do SHA marcado continua pendente.0.0-rc1` é o nome planejado, não uma tag criada.

## [v1.0.0-rc1] — release publicada em 14/11/2026 (evidências históricas de 13/11)

**Referência histórica de 13/11:** [main `548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/548f8b0b95980a3e292f271b9676105473822ead), resultado do [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).

### Recursos incluídos no snapshot

- RF01: sessão Spring Security, CSRF, perfis e autorização por escopo Q9.
- RF02–RF03 e RF08: gestão, pesquisa e disponibilidade de salas, professores e materiais, manutenção e expediente.
- RF04–RF07: criação, edição, cancelamento, conflitos, locks ordenados, fila de aprovação e proteção Q1/Q3/Q5/Q8.
- RF09–RF11: movimentações, auditoria transacional e notificações por outbox com demonstração simulada.
- RF12–RF14: relatórios de utilização, frontend responsivo, contratos HTTP, ADRs e documentação de fluxos.

### Evidências disponíveis (não equivalentes a release certificado)

- [CI do PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976): 287 testes Surefire + 79 Failsafe, JaCoCo 92,58% de linhas / 76,39% de branches, quatro cenários JMeter aprovados. O **scanner Maven SonarCloud falhou**, portanto o workflow inteiro terminou com failure.
- [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47): integração `develop` → `main` com aprovação independente, **sem CI própria de main observada**.
- [RTM](docs/RTM.md), [diagramas de sequência](docs/arquitetura/sequencia-reserva.md), [relatórios de qualidade](docs/qualidade/relatorio-evidencias.md), [índice em preparação](docs/evidencias/README.md).

### Limitações de validação da release publicada

Sem CI verde da `main` ligada ao SHA de release; clone limpo e `mvn -f backend/pom.xml clean verify` não reproduzidos de forma independente; scanner Sonar com erro; diagramas de contexto/componentes não identificados; assinatura/decisão coletiva não registrada. RF11 validada no modo simulado, sem comprovar envio externo.

### Política de versão

A release `v1.0.0-rc1` já foi publicada; conferir SHA e tipo da tag, vincular evidências e obter decisão da equipe antes de atestar aceite final. Se houver correção após publicar, usar `v1.0.0-rc2`. **Nunca mover ou sobrescrever tags publicadas.**
