# Testes de segurança complementares — RF01, RF07, CT14/CT17/CT18

## Suítes adicionadas
- \`SegurancaComplementarTest\`: usa o filtro Spring Security **real**, o
  \`SpringSecurityAtorProvider\` real e a regra de ownership no objeto Reserva.
  Somente a persistência/serviço são simulados via Mockito.
  Cobertura: 401 anônimo; 403 sem CSRF para POST/PATCH; perfil Responsável
  exclusivamente para aprovação; corpo de requisição não escolhe ator/papel;
  tentativa de cancelamento por outro Solicitante (IDOR) negada; dono/admin podem
  cancelar; correlationId inválido não é refletido no erro.
- \`LoginMysqlIT\`: usa Spring Boot + MySQL real via Testcontainers, popula
  usuários com hash BCrypt e verifica login válido, senha errada e usuário
  desativado. Testa \`/api/auth/me\` com sessão obtida do login.
- Suítes anteriores \`SecurityConfigTest\`, \`SpringSecurityAtorProviderTest\`,
  \`ReservaDominioTest\`, \`ReservaControllerTest\` complementam os casos.

## Como executar
\`\`\`bash
mvn -f backend/pom.xml -Dtest=SegurancaComplementarTest,SecurityConfigTest test
mvn -f backend/pom.xml -Dit.test=LoginMysqlIT verify
mvn -f backend/pom.xml clean verify
\`\`\`

**Docker ativo** para \`LoginMysqlIT\`. No último comando, o JaCoCo verifica
mínimo de 80% LINE e 70% BRANCH no bundle.

## Limites e próximos casos
- O teste de IDOR usa a regra **real do domínio** por trás de um serviço
  mockado, não um endpoint de leitura de reservas com banco real.
- \`GET /api/reservas/{id}\` não está implementado no contrato atual.
  Assim, **IDOR de consulta** permanece pendente até o endpoint existir.
- A anotação \`@AutoConfigureMockMvc(addFilters=false)\` nos antigos testes
  \`ReservaControllerTest\` desativa filtros intencionalmente: não usá-los como
  evidência de CSRF/autorização real. A suíte complementar os ativa.
- Configuração de cookie \`Secure\` e \`SameSite\` precisa ser conferida em HTTPS
  no deploy, além das sessões de desenvolvimento; nenhum teste local HTTP
  prova comportamento do navegador em produção.
- Expor apenas API de teste local; não usar credenciais de usuários reais.
- Os testes novos ainda **não foram executados** no momento da autoria desta
  documentação; atualizar status só após salvar XML/CI.
