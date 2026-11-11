# Pendências que exigem participação do grupo

Fonte: Guia Técnico Definitivo, seções 13, 20, 21 e 22 (páginas 19, 24 e 25).
Data: 10/11/2026. Este arquivo complementa o PDF de encaminhamento para a equipe.

## Administrador da organização SenacOS (a confirmar)
- Importar o repositório no SonarCloud; cadastrar `SONAR_TOKEN` (secret), `SONAR_ORGANIZATION` e `SONAR_PROJECT_KEY` (variables).
- Fornecer URL da análise SonarCloud e resultado do Quality Gate. Sem isto, o Sonar permanece PENDENTE.

## Gabriel Silva Gomes — reservas
- Revisar ownership e aprovação restrita (somente RESPONSAVEL), incluindo RF04/RF07 e integração com RF01/RF10/RF11.
- Confirmar cobertura de edição concorrente CT19 e proposta de consulta/IDOR em GET de reserva, endpoint ainda não implementado.
- Entregar revisão do contrato e evidências de regras de negócio e concorrência.

## Gabriel Rodrigues Fausto — banco e movimentações
- Revisar migrações V1–V4, testes de locks, rollback e RF09 com a API final.
- Definir com quem administra o banco uma conta de runtime com `SELECT`/`INSERT` na tabela `auditoria`, sem grants globais `UPDATE`/`DELETE` sobre ela. A conta de migração Flyway deve ser separada.
- Apresentar SQL de privilégios e testes de integração sem divulgar credenciais.

## Marcos Boé — frontend e E2E
- Integrar login, sessão, CSRF, autorização, 401/403/409 e comportamento de navegação.
- Demonstrar fluxos de login, busca, reservas, aprovação/rejeição, cancelamento, retirada e devolução com evidências E2E.
- Revisar RF13/RF14 e validar flags Secure/SameSite do cookie em HTTPS no deploy.

## Todos — revisão e aceite
- Revisar e integrar na ordem PR #8 → #9 → #10 → #11 → #12, atualizando bases para `develop` após cada merge e rodando CI novamente.
- Conciliar ou encerrar PR #7 antigo de CI (em conflito) para não manter workflows duplicados.
- Consolidar E2E, TDD/BDD, RF12, contratos, ATAM, registro de defeitos e decisão de aceite coletiva.

## Evidências já disponíveis
- CI PR #11: https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42945777138
- 205 testes unitários/API e 31 integrações; JaCoCo 90,88% linhas, 73,46% branches.
- JMeter quatro cenários aprovados; a aplicação e MySQL de teste foram descartáveis.
- SonarCloud NÃO executado. PR #12 precisa de execução própria.

PR de fechamento: https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/12
