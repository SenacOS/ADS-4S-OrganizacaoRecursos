# Relatório de qualidade — consolidação preliminar (10/11/2026)

Projeto: Organização de Recursos · Senac ADS 2026.2
Responsabilidade transversal: segurança, auditoria, notificações, CI, testes,
performance, RTM, análise de riscos e evidências.

**Estado: preliminar, não é aceite final do projeto.** Este documento distingue
evidências locais observadas de tarefas planejadas e de resultados ausentes.

## 1. Execuções comprovadas até agora

| Data (America/Sao_Paulo) | Branch/escopo | Comando/evidência observada | Resultado |
|---|---|---|---|
| 09/11/2026 | Item18 do Fausto, antes do RF01 | `docs/testes/item18-resultados.md`: 167 testes unitários/API, 15 de integração MySQL/Testcontainers, Java 21, JaCoCo 90,81% linhas e 75,0% branches | Aprovado **naquela versão**; não representa o build atual |
| 10/11/2026 | PR #8 / RF01 | `mvn -f backend/pom.xml clean verify` informado pela equipe | BUILD SUCCESS local após correções de segurança, cobertura atendida |
| 10/11/2026 | PR #9 / RF10 | `mvn -f backend/pom.xml clean verify` informado pela equipe após remoção das triggers que exigiam SUPER | BUILD SUCCESS local, incluindo integração MySQL |
| 10/11/2026 22:17 | PR #10 / RF11, commit 8bc0efc | `mvn -f backend/pom.xml clean verify`; 90 classes analisadas pelo JaCoCo, `All coverage checks have been met` | BUILD SUCCESS local; limites de 80% LINE e 70% BRANCH atendidos |

Não há percentuais **atuais exatos** de JaCoCo anexados aqui. A execução local
ocorreu com Java 27 compilando para `--release 21` (conforme log), portanto
a CI do PR #11 ja validou a **execucao efetiva em Java 21**, run 42944280415.

## 2. Evidência esperada do novo PR de qualidade

| Entrega | Arquivo(s) | Resultado atualmente verificável |
|---|---|---|
| Segurança 401/403/CSRF/ownership | `SegurancaComplementarTest`, `LoginMysqlIT`, `docs/qualidade/seguranca.md` | Suítes aprovadas na CI Java21 (7 testes MVC + 3 MySQL) |
| CI e cobertura | `.github/workflows/ci.yml`, Surefire, Failsafe, JaCoCo | [Execução PR #11 em 10/11](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42940260477): Maven/Testcontainers/JaCoCo **passaram**; job geral falhou apenas na checagem de credenciais SonarCloud. Workflow ajustado para pular Sonar pendente e preservar checks obrigatórios; nova execução deve ser verificada. |
| SonarCloud | `.github/workflows/ci.yml`, `docs/qualidade/sonarcloud.md` | **Pendente de acesso de administrador da organização SenacOS**. Etapa opcional até configuração; não significa Quality Gate verde. |
| JMeter | Quatro planos `.jmx`, CSV, script `rodar_local.py` e guia | **4 cenários aprovados na CI**, JTL/HTML/resultado.json arquivados (run 42945127066) |
| RTM completa | `docs/RTM.md` | RF01–RF14 vinculados; lacunas marcadas |
| E2E / UX | Testes de Marcos e evidências de tela | Aguardando execução/integração do frontend |
| ATAM / aceite | Registro abaixo | Análise preliminar, validação coletiva pendente |

## 3. Registro de defeitos e correções

| ID | Defeito | Evidência / causa | Ação e estado |
|---|---|---|---|
| DEF-01 | Conflito POM ao integrar MySQL + segurança | PR #8, `backend/pom.xml`; dependências divergentes | Resolvido localmente e publicado no PR #8 |
| DEF-02 | Quatro respostas HTTP erradas em `Item18ApiTest` | Interceptação nova por autenticação/CSRF, esperado 200/404/409 virou 401/403 | Testes adaptados à segurança, build local aprovado |
| DEF-03 | Teste antigo exigia ausência de provedor de ator | `Item18MysqlIT` incompatível com RF01 | Teste corrigido, build local aprovado |
| DEF-04 | Falha Flyway MySQL 1419 ao criar triggers | Log RF10: binary logging e falta de privilégio SUPER | Triggers retiradas da V3; restrição de grants SQL ainda pendente para ambiente real |
| DEF-05 | Falha de compilação WireMock (`options()`) | PR #10, `GatewayNotificacaoWireMockTest.java` | Configurador de WireMock qualificado, build local aprovado |
| DEF-06 | PR #7 de CI em conflito e sem SonarCloud | Verificar PR #7 antes do merge | **Parcial**: PR #11 traz CI integrada e teste Maven verde no run 42940260477; Sonar depende de administrador, PR #7 ainda precisa ser conciliado |
| DEF-07 | Consulta de reservas e IDOR GET sem endpoint | API de reservas atual tem apenas escritas | **Aberto**: definir porta GET e teste integrado com Silva/Marcos |
| DEF-08 | Ausência de dados JMeter e dashboard Sonar | JMeter executado na CI, Sonar pendente | **Parcialmente fechado**: 4 cenarios JMeter aprovados, Sonar aguarda admin |

## 4. Análise ATAM preliminar (trade-offs, não substitui revisão coletiva)

| Cenário | Atributo | Decisão | Benefício | Risco/trade-off | Verificação |
|---|---|---|---|---|---|
| Duas reservas mesmo horário | Consistência | Lock `FOR UPDATE` e READ_COMMITTED | Evita dupla reserva | Contenção e timeouts | Item18MysqlIT + JMeter disputa |
| Falha na entrega de notificação | Disponibilidade | Outbox transacional + retry | Não desfaz a reserva | Pode entregar mais de uma vez | NotificacaoMysqlIT + WireMock |
| Mudança auditável com rollback | Auditabilidade | Auditoria na mesma transação | Não cria trilhas órfãs | Rollback também elimina a tentativa malsucedida; acessos SQL elevados podem alterar histórico sem grants | AuditoriaMysqlIT + permissões de banco |
| Sessão HTTP/CSRF | Segurança | Cookie HttpOnly, autenticação Spring, CSRF | Evita papel vindo do cliente | Configurar Secure/SameSite em HTTPS; renovar sessão corretamente | SecurityConfigTest, LoginMysqlIT, revisão de deploy |
| CI obrigatória por PR | Manutenibilidade | Maven+Testcontainers+JaCoCo+Sonar | Regressões visíveis antes do merge | Exige segredos Sonar e runner Docker | GitHub Actions e Quality Gate |

**Decisão de aceite proposta:** **NÃO APROVADO PARA ENTREGA FINAL AINDA**.
A CI validou testes Java21, seguranca e JMeter em banco isolado. SonarCloud,
E2E, revisao por colegas e merges ainda impedem o aceite final. Na revisão final, anexar links reais e registrar a decisão
da equipe, não atribuir aceite retroativamente.

## 5. Checklist para fechar evidências sem falsificar resultados

- [ ] Java 21 real, Docker e `mvn -f backend/pom.xml clean verify` no PR de qualidade.
- [ ] Arquivar XML Surefire/Failsafe, `target/site/jacoco/index.html` e XML.
- [ ] Criar projeto SonarCloud, configurar token/variáveis e arquivar URL do gate.
- [x] JMeter: 4 cenarios executados com MySQL isolado; JTL/HTML/JSON no artefato do run 42945127066.
- [ ] Relacionar cada caso executado à RTM, defeito ou risco.
- [ ] Rever API de consultas/ownership e contrato com os responsáveis.
- [ ] Validar E2E, TDD RED/GREEN/REFACTOR com seus respectivos autores.
- [ ] Integrar PR #8 → #9 → #10 → PR de qualidade; revisão externa e CI verde.

## 6. Resultado verificado: carga no GitHub Actions (10/11/2026, São Paulo)

Fonte: [run 42945127066](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42945127066), artefato jmeter-evidence.

| Cenario | Amostras HTTP | p95 do endpoint | Resultado |
|---|---|---:|---|
| Consulta de recursos | 50 × 200 | 6,0 ms | Aprovado |
| Disputa mesma reserva | 1 × 201; 7 × 409; somente 1 reserva ativa no MySQL | 123,0 ms | Aprovado |
| Recursos distintos | 5 × 201; uma reserva em cada recurso 101–105 | 41,2 ms | Aprovado |
| Manutencao × reserva | Reserva: 1 × 201 e 4 × 409; manutencao: 1 × 409 | 32,0 ms (reserva) | Aprovado |

Carga pequena, em runner compartilhado com banco descartavel; nao constitui SLA de producao.
Detalhes: [evidencias de carga](jmeter/evidencias-2026-11-10.md).
