# Testes de segurança complementares — RF01, RF07, CT14/CT17/CT18

## Suítes adicionadas
- `SegurancaComplementarTest`: usa o filtro Spring Security **real**, o
  `SpringSecurityAtorProvider` real e a regra de ownership no objeto Reserva.
  Somente a persistência/serviço são simulados via Mockito.
  Cobertura: 401 anônimo; 403 sem CSRF para POST/PATCH; perfil Responsável
  exclusivamente para aprovação; corpo de requisição não escolhe ator/papel;
  tentativa de cancelamento por outro Solicitante (IDOR) negada; dono/admin podem
  cancelar; correlationId inválido não é refletido no erro.
- `LoginMysqlIT`: usa Spring Boot + MySQL real via Testcontainers, popula
  usuários com hash BCrypt e verifica login válido, senha errada e usuário
  desativado. Testa `/api/auth/me` com sessão obtida do login.
- Suítes anteriores `SecurityConfigTest`, `SpringSecurityAtorProviderTest`,
  `ReservaDominioTest`, `ReservaControllerTest` complementam os casos.

## Como executar
```bash
mvn -f backend/pom.xml -Dtest=SegurancaComplementarTest,SecurityConfigTest test
mvn -f backend/pom.xml -Dit.test=LoginMysqlIT verify
mvn -f backend/pom.xml clean verify
```

**Docker ativo** para `LoginMysqlIT`. No último comando, o JaCoCo verifica
mínimo de 80% LINE e 70% BRANCH no bundle.

## Limites e próximos casos
- O teste de IDOR usa a regra **real do domínio** por trás de um serviço
  mockado, não um endpoint de leitura de reservas com banco real.
- `GET /api/reservas/{id}` não está implementado no contrato atual.
  Assim, **IDOR de consulta** permanece pendente até o endpoint existir.
- A anotação `@AutoConfigureMockMvc(addFilters=false)` nos antigos testes
  `ReservaControllerTest` desativa filtros intencionalmente: não usá-los como
  evidência de CSRF/autorização real. A suíte complementar os ativa.
- Configuração de cookie `Secure` e `SameSite` precisa ser conferida em HTTPS
  no deploy, além das sessões de desenvolvimento; nenhum teste local HTTP
  prova comportamento do navegador em produção.
- Expor apenas API de teste local; não usar credenciais de usuários reais.
- Os testes novos **foram executados na CI do PR #11**: SegurancaComplementarTest (7) e LoginMysqlIT (3), 0 falhas no [run 42944280415](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42944280415). XML disponível no artefato quality-evidence.

## Testes complementares do PR #12 (executados na CI)

- `LoginMysqlIT.logoutComCsrfInvalidaSessaoRealEImpedeAcesso`: CT17 com login no MySQL, CSRF, invalidação real da `MockHttpSession` e 401 após logout.
- `GatewayNotificacaoWireMockTest.timeoutNoGatewayEhFalhaDeEntregaSemExporRespostaInterna`: servidor atrasa 6s; cliente HTTP tem timeout de 5s; erro tratado, sem resposta interna.
- `UsuarioAuditoriaMysqlIT` e `AuditoriaResumoTest`: auditoria de criação de usuário no mesmo commit, com ator e correlação, sem nome, e-mail ou senha no histórico.
- `application.yml`: cookie `HttpOnly` e `SameSite=Lax`. Para HTTPS habilitar `SESSION_COOKIE_SECURE=true`; não confundir testes HTTP locais com validação de cookie real em HTTPS.

**Resultado confirmado:** [GitHub Actions 42949100353](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42949100353), 240 testes aprovados, sem falhas; 91,53% linhas e 73,18% branches. Os testes HTTP locais não comprovam flags Secure em HTTPS real.

## RF01 — complementar de integracao HTTP/MySQL (PR #18)

- `ReservaIdorSessaoMysqlIT`: login real no MySQL, obtenção de CSRF por sessao, PATCH em reserva persistida; alteracao pelo solicitante estranho e pelo administrador deve dar 403, sem atualizar reserva/auditoria/notificacoes; dono deve editar e gerar trilha.
- `SecurityConfigTest`: os POSTs `/inicio`, `/conclusao` e `/nao-comparecimento` exigem Responsavel ou Administrador na URL, alem do dominio.
- RF10: `AuditoriaPrivilegiosMysqlIT` usa conta SQL restrita em MySQL descartavel. Nao substitui os grants em producao.

**Resultado comprovado no PR #18:** [CI 43046498091](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43046498091), 247 testes aprovados (210 unitarios/API e 37 integracoes), 91,63% linhas e 73,39% branches. O MySQL limitado foi testado em conteiner isolado; para o ambiente real os grants ainda dependem do administrador do banco.
