# Changelog — Organização de Recursos

Histórico resumido do conteúdo integrado. **Pré-release ainda não publicado**: `v1.0.0-rc1` é o nome planejado, não uma tag criada.

## [Unreleased] — candidato a `v1.0.0-rc1` (13/11/2026)

**Referência:** [main `548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/548f8b0b95980a3e292f271b9676105473822ead), resultado do [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).

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

### Limitações antes da primeira tag

Sem CI verde da `main` ligada ao SHA de release; sem clone limpo e `./mvnw -B verify` comprovados; scanner Sonar com erro; diagramas de contexto/componentes não identificados; assinatura/decisão coletiva não registrada. RF11 validada no modo simulado, sem comprovar envio externo.

### Política de versão

Após corrigir os bloqueadores, criar `v1.0.0-rc1` **anotada** sobre o SHA aprovado, publicar evidências do mesmo SHA e obter decisão da equipe. Se houver correção após publicar, usar `v1.0.0-rc2`. **Nunca mover ou sobrescrever tags publicadas.**
