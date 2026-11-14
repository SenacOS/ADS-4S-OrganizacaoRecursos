# Configuração SonarCloud — trabalho ainda condicionado a conta e credenciais

## Estado conferido — PR45 — 13/11/2026

O [bot Sonar no PR45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/45#issuecomment-6869673675) publicou **Quality Gate passed**, com [URL da análise](https://sonarcloud.io/dashboard?id=SenacOS_ADS-4S-OrganizacaoRecursos&pullRequest=45). A [CI43542757976](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976) aprovou testes Java/MySQL, JaCoCo e JMeter, mas o scanner Maven falhou com `Not authorized or project not found`; a conclusão global é failure.

Os dois resultados têm fontes próprias. O gate informado pelo bot não demonstra correção das credenciais/chaves/permissões usadas pelo scanner Maven. Tampouco o erro do scanner demonstra sozinho projeto ausente, token faltante ou limitação de plano. A administração da integração conserva esse diagnóstico; nenhuma configuração foi alterada para ignorar o erro. [Evidência e limites](../testes/marcos-8-resultados.md).

A cobertura de código novo0,0% informada no comentário do Sonar não é cobertura global nem resultado de cobertura da suíte frontend. JaCoCo92,58%linhas/76,39%branches pertence ao backend dessa CI e ao XML conferido.

## Guia de configuração e histórico

Os procedimentos seguintes preservam a orientação original. Aplicar conforme o diagnóstico do ambiente; as menções a criar projeto ou credenciais pendentes não constituem constatação atual de ausência.

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


## Atualização pós-merge do PR #50 — 14/11/2026

**Correção do workflow concluída:** [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50) integrado. A CI do próprio PR foi aprovada. O workflow agora é acionado por push na `main`, com análise SonarCloud somente nesse contexto; testes Maven, Testcontainers, JaCoCo e JMeter continuam exigidos.

**Pendência na `main` (não ocultada):** na execução `CI e SonarCloud` #92, commit `5e9b9ea`, o scanner identificou `Github event: push`, branch `main`, mas falhou ao criar a análise com `[ERROR] Not authorized or project not found`. O job terminou com `exit code 1`; **a CI global da `main` ficou vermelha e não há Quality Gate da main comprovadamente aprovado** nessa execução. A CI verde do PR não substitui essa verificação.

**Ação administrativa futura:** verificar permissão do `SONAR_TOKEN`, valores de `sonar.projectKey` e `sonar.organization`, vínculo do projeto à organização e direito de análise do token. Depois, reexecutar o workflow da `main` e anexar URL, SHA e resultado do gate. Não publicar tokens nem desabilitar o scanner apenas para obter status verde.

**Release:** [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1). A publicação da tag não atesta aprovação de CI no SHA marcado. Esta anotação é posterior à tag e não modifica o conteúdo da versão marcada.
