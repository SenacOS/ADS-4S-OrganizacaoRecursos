# Configuração SonarCloud — trabalho ainda condicionado a conta e credenciais

Foi adicionado `.github/workflows/ci.yml` com JDK 21, Maven `clean verify`,
Testcontainers (Docker do runner), JaCoCo, upload de relatórios e SonarScanner
for Maven. O scan exige um Quality Gate bem-sucedido
(`sonar.qualitygate.wait=true`).

**Pendente de configuração por alguém com acesso ao GitHub e SonarCloud:**

1. Criar/conectar o projeto **SenacOS/ADS-4S-OrganizacaoRecursos** no SonarCloud
   (SonarQube Cloud), obter os valores reais de Organization Key e Project Key.
2. Em GitHub → Settings → Secrets and variables → Actions, configurar:
   - **Secret** `SONAR_TOKEN`, emitido no SonarCloud;
   - **Variables** `SONAR_ORGANIZATION` e `SONAR_PROJECT_KEY`, chaves
     fornecidas pelo painel do projeto.
3. Conferir permissões de integração do SonarCloud com o repositório. Segredos
   não ficam disponíveis em PRs de forks não confiáveis; não altere isso expondo
   token em comentários, arquivos ou logs.
4. Executar workflow e anexar URL do painel (apenas após criá-lo), URL da
   análise e resultado do Quality Gate ao relatório de evidências.

**Comportamento temporario sem admin:** se alguma variavel ou token faltar, o
workflow **registra aviso e marca SonarCloud como PENDENTE no resumo da CI**;
o scanner nao executa, mas os testes Java/MySQL e os limites de JaCoCo
permanecem obrigatorios. CI verde nesse caso **nao significa** Sonar Quality Gate
aprovado. Assim que as credenciais existirem, o scan passa a rodar e o Quality
Gate passa a ser exigido para o aceite. JaCoCo nao substitui SonarCloud.

O arquivo `backend/target/site/jacoco/jacoco.xml` é consumido pelo scanner.
A análise executa depois do `mvn clean verify` no mesmo job.

### Relação com o PR #7
O PR #7 contém workflow antigo (Java21/Maven/JaCoCo), sem análise SonarCloud
e atualmente em conflito com `develop`. Este PR de qualidade propõe uma versão
integrada de `.github/workflows/ci.yml`. **Não fazer merge de duas versões
sem reconciliar**; após integrar as funcionalidades, manter apenas um workflow
com testes, cobertura, upload e SonarCloud.

### Limites conhecidos
Sem SONAR_TOKEN e chaves reais não é possível executar análise autenticada,
medir bugs/vulnerabilidades nem afirmar Quality Gate verde. Também não se deve
inventar nota, URL de projeto, cobertura percentual ou resultado de CI.
