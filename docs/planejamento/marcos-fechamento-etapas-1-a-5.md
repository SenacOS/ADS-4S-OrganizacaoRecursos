# Marcos — plano de fechamento das etapas 1 a 5

Data da conferência: **12/11/2026**, America/Sao_Paulo.\
Responsável pelo frontend: **Marcos Boé**.\
Estado: **EM EXECUÇÃO; frontend previsto implementado e aceito localmente, incluindo complemento da etapa 3; publicação e fechamento integrado pendentes**.

## Checkpoint vigente — consulta, edição e cancelamento, 12/11/2026

Marcos confirmou push da integração **f9c4912**, que inclui develop **4cea177** e os PRs #26/#27. Nova branch **feature/marcos-reservas-consulta** criada dessa base. Marcos informou que os testes funcionaram, aprovou o incremento e autorizou commit local. [Aceite](../testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md), [story](../stories/marcos-3-consulta-edicao.md) e [resultados, hashes e capturas](../testes/marcos-3-consulta-edicao-resultados.md). O commit que inclui esse registro identifica a entrega local; publicação ainda separada.

- Passo 5: GETs, projeções, fila e Q9 disponíveis e testados; não há mais bloqueio de ausência dessas leituras. Ratificação coletiva das regras e processo de vínculos permanecem separados.
- Passo 6: página **Reservas** dos três perfis, filtros/paginação, detalhe autorizado, edição completa sem perda de recursos/precisão e cancelamento implementados, testados e aceitos visualmente por Marcos. Commit local solicitado; regressão81/278 e E2E8/0 preservados.
- Passo 7: complemento da interface validado com Spring/MySQL reais, além do smoke geral. Q9/fila anterior 10/0 preservado. As suítes não comprovam toda a matriz: timeout, concorrência, todos os estados/prazos e entrega externa continuam separados.
- Próximo checkpoint após o commit solicitado: publicar a branch e preparar PR próprio conforme solicitação; revisão de outro integrante e checks remotos seguem o fluxo combinado. Scanner Sonar, ratificação coletiva, gestão administrativa dos vínculos e cenários integrados restantes exigem continuidade/alinhamento da equipe.

Os relatos de base/árvore/PRs abaixo conservam o histórico. Esta seção e os resultados novos definem o estado vigente; expressões anteriores de GET ausente, PR #27 aberto ou integração ainda sem commit não descrevem a base f9c4912.

**Aceite mais recente:** Marcos aprovou visualmente a fila real posterior ao PR27 e solicitou o commit local em12/11. [Registro](../testes/marcos-integracao-q9-1-aceite-visual-2026-11-12.md). Integração10/0Q9+16/0/1smoke pronta para registro na branch própria; fontes anteriores de testes preservadas. Próximo recorte funcional: interface geral de reservas. Revisão da equipe, gestão de vínculos, ratificação coletiva e Sonar separados; nenhum push/PR autorizado por essa confirmação.

**Atualização vigente após merge do PR #27:** develop `4cea177`, incorporada sem commit à `feature/marcos-integracao-q9`, preservando `8c21a43` e o trabalho local. JAR novo e fila/Q9 revalidados: **10/0 Q9, 16/0/1 smoke**. [Preservação, provas e limites](../testes/marcos-integracao-q9-1-pr27-resultados.md). GETs e fila disponíveis; próximo recorte é a interface geral de reservas. Revisão visual deste incremento, ratificação coletiva/processo de vínculos e scanner Sonar continuam pendentes. Os estados anteriores abaixo são históricos; #27 não está mais aberto.

**Estado atual após PR #26:** push de `8c21a43` confirmado; develop avançou para `3f2a9a3`. Branch `feature/marcos-integracao-q9` com merge local preparado sem commit. GETs e fila reais agora disponíveis: 8 cenários Q9 aprovados, smoke 16/0/1 e V6 aplicada só na instância isolada. [Resultados](../testes/marcos-integracao-q9-1-resultados.md). Marcos aceitou consumir vínculo com todos os recursos; falta ratificação dos demais. O bloqueio de ausência de endpoints foi superado; passo 6 (interface geral), revisão/aceite deste incremento, processo de vínculos e Sonar continuam abertos. Os diagnósticos de endpoints ausentes abaixo preservam a conferência anterior em da5881b.

Atualização após o merge do **PR #24** em 12/11/2026: develop `da5881b`, conferida por fetch e usada na nova branch `fix/marcos-qualidade-frontend`. O #23 já havia sido mesclado em `23cf839`. Ambos não aguardam outro merge. Marcos autorizou preparar ambiente local e confirmou que não recebeu contratos novos de leitura.

Avanço local: duas ordenações explicitadas, FE-004 corrigido, build final com **72 unitários/240 navegador** e smoke real com **16 PASS/0 FAIL/1 BLOQUEADO**. [Qualidade/CI](../testes/marcos-qualidade-1-resultados.md), [datas](../testes/marcos-integracao-datas-1-resultados.md), [ambiente/E2E](../testes/marcos-e2e-local-2026-11-12-resultados.md), [handoff](../integracao/marcos-pendencias-2026-11-12.md). Marcos deu [aceite visual do incremento no Chrome com backend real](../testes/marcos-qualidade-aceite-visual-2026-11-12.md). Mudanças novas ainda sem commit; autorização de commit e aprovação remota são separadas. Passos 3 e 7 avançaram parcialmente; passos 5, 6 e encerramento integrado continuam abertos.

Este plano foi solicitado por Marcos após a conferência do repositório e dos trabalhos realizados em casa. Consolida a ordem de execução, as dependências da equipe e as condições para encerrar as responsabilidades das etapas 1 a 5. Não cria endpoints, regras de negócio, prazos ou stories de implementação por inferência.

**PR #27 comunicado depois da validação:** conferido aberto, head7fe9fe0 sobre develop3f2a9a3. Complementa o #26 conectando a fila ao caso de uso/adaptador existente e centralizando o filtro Q9, mantendo contrato externo. Ainda não foi importado à branch local. [Comparação, CI e condição de integração](../testes/marcos-integracao-q9-1-resultados.md#complemento-anunciado-pr-27-ainda-aberto). Após integração, conciliar contrato/evidências e repetir a validação real; não atribuir a ele os testes locais do #26 nem declarar resolvido o scanner Maven por seu check Sonar separado ter passado.

A preparação original deste arquivo incluiu somente leitura do checkout e consulta ao GitHub. Posteriormente Marcos pediu “vamos fazer a sincronização”: plano preservado por cópia/hash, fetch executado, branch Marcos-4 trazida para este computador e develop 23cf839 incorporada sem conflitos. Lint/typecheck e regressão 68 unitários/238 navegador aprovados; frontend/testes/configuração preservados. [Execução e limites](../testes/marcos-sincronizacao-2026-11-12-resultados.md). O usuário enviou a8da77c e o PR #24 foi conferido com esse commit e destino develop. Depois informou [aceite visual](../testes/marcos-4-aceite-visual-2026-11-12.md) da prévia com dados fictícios. Os passos 3 e 5 a 8 continuam pendentes; a publicação deste novo registro documental é separada.

## 1. Resultado que buscamos

Concluir os fluxos de acesso, pesquisa, reservas, aprovação e administração/movimentação previstos até a etapa 5, com implementação do frontend, aceite de Marcos, evidências reproduzíveis e entrega integrada revisada.

Há três estados distintos a registrar durante o trabalho:

| Estado | O que comprova |
|---|---|
| Implementado e validado localmente | Código do cliente funciona nas verificações executadas, inclusive testes com API controlada. |
| Aceito e pronto para revisão | Marcos validou o incremento; código, story, documentação e evidências estão preparados para revisão. |
| Entregue de forma integrada | Fluxos funcionam com backend real, revisões/checks exigidos foram atendidos e os PRs pertinentes chegaram à develop. |

Não reimplementar o que já está entregue. O complemento da etapa 3 está implementado/testado localmente, aguardando revisão visual e entrega. Marcos-4 foi implementada, conciliada e aceita pelo autor; leitura/autorização reais têm evidência Q9/fila. Revisão da equipe e encerramento integrado permanecem pendentes.

Relatórios da etapa 6 ficam fora deste plano. O E2E aqui previsto comprova os fluxos das etapas 1 a 5 e alimenta as evidências finais do projeto; não declara toda a etapa 7 concluída antecipadamente.

## 2. Fotografia do repositório usada no planejamento

Fotografia histórica anterior à sincronização e ao merge #24; os commits abaixo identificam sua origem. O checkout atual é `fix/marcos-qualidade-frontend` sobre `da5881b`, com alterações não commitadas. Os relatos anteriores abaixo preservam seu momento; consultar a atualização inicial para o estado atual.

| Local / branch remota | Commit conferido | Papel no trabalho |
|---|---|---|
| Checkout deste computador: feature/marcos-movimentacoes | f7360a2 | Árvore limpa antes da criação deste plano; contém o trabalho anterior feito aqui. |
| origin/feature/marcos-movimentacoes, consultada pelo GitHub | 8ad75af | Já avançou em relação ao checkout local. |
| feature/marcos-5-administracao-recursos | 8df312e | Referência da entrega de administração/movimentações já mesclada pelo PR #23. |
| feature/marcos-4-aprovacoes | df57063 | Reúne todo o frontend já implementado das etapas 1 a 5; origem do PR #24. |
| develop | 23cf839 | Inclui a base frontend, o adaptador SQL da fila (#22), administração e movimentações (#23). |

As referências `origin/*` existentes no computador ainda podem estar antigas: a conferência remota foi feita pela integração GitHub, sem executar fetch neste checkout.

Na comparação após o merge do #23, a Marcos-4 df57063 e a develop 23cf839 têm três commits exclusivos de cada lado, com base comum 8df312e. Incorporar a develop atual na Marcos-4 faz parte da preparação; o destino do PR #24 já está correto e não precisa de novo retarget neste momento.

### PRs e dependências atuais

| PR | Situação observada | Consequência |
|---|---|---|
| [#19 — base frontend](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/19) | Mesclado na develop. | Base de comunicação, acesso, pesquisa e criação já chegou à integração. |
| [#20 — administração](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/20) | Mesclado na branch intermediária da base frontend. | Seu merge isolado não entregou a administração à develop. |
| [#21 — movimentações](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/21) | Mesclado na branch administrativa. | Movimentações foram reunidas à administração. |
| [#23 — administração e movimentações](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/23) | Mesclado na develop em 12/11/2026; commit de integração 23cf839. | Administração e movimentações chegaram à develop; conferir qualidade pós-merge e integração real. |
| [#24 — Marcos-4](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/24) | Mesclado na develop em 12/11/2026; da5881b. | Cliente da fila integrado; contrato HTTP/autorização e E2E ainda pendentes. |

Os PRs #23/#24 estão integrados. Aprovação, checks, validação real e merge são condições distintas; os merges não comprovam aprovação Sonar ou E2E completo. Na develop da5881b, testes Java/MySQL e cobertura passaram; o scanner falhou depois por autorização/projeto.

### Testes já registrados

| Árvore / incremento | Unitários | Navegador | Limite da evidência |
|---|---:|---:|---|
| Administração original | 45 | 130 | Frontend isolado, com aceite visual de Marcos. |
| Administração + movimentações | 57 | 190 | Frontend isolado, com aceite visual e reexecução de Marcos. |
| Marcos-4 conciliada com os anteriores | 68 | 238 | Frontend isolado, com reexecução de Marcos; aceite visual posterior registrado em 12/11, na versão a8da77c. |

As contagens são cumulativas dentro de cada árvore, não devem ser somadas. Foram conferidas nas evidências publicadas, sem nova execução durante a preparação deste plano. São referências para a regressão, não metas fixas: novas contagens devem refletir os testes efetivamente executados e as mudanças realizadas.

## 3. O que falta em cada etapa

| Etapa | Implementação existente | Trabalho de fechamento |
|---|---|---|
| 1 — comunicação com a API | Clientes, sessão/CSRF, erros e proteção contra envio repetido. | Conferir contrato efetivo com o backend integrado, revisão/checks e coerência do status documental. |
| 2 — acesso e navegação | Login, logout, perfil, expiração e layout responsivo. | Validar com sessão real e navegação consolidada dos três perfis. |
| 3 — pesquisa e reservas | Pesquisa/criação integradas; complemento local de consulta/detalhe/edição/cancelamento validado com backend real. | Revisão visual, commit solicitado, publicação/PR, revisão/checks e merge do complemento. |
| 4 — fila e decisões | Cliente integrado pelo #24; HTTP/Q9 pelos #26/#27, aceitos por Marcos; E2E real 10/0. | Ratificação coletiva/processo de vínculos, revisão/checks compartilhados e combinações integradas restantes. |
| 5 — recursos e movimentações | Integrada pelo #23; smoke real de cadastros, manutenção, expediente, retirada/devolução passou. FE-004 corrigido localmente. | Entregar correções novas após aceite/commit; complementar cenários integrados de prazo/permissão e checks/revisão. |

Q9 está **decidida como política**: Solicitante consulta as próprias reservas; Responsável, as dos recursos sob sua responsabilidade; Administrador, todas. A decisão não implementa endpoints nem concede novas operações de escrita. Aprovação/rejeição e escrita de movimentações continuam exclusivas de RESPONSAVEL nos contratos atuais.

## 4. Responsabilidades e organização das mudanças

| Frente | Marcos / assistente | Participação da equipe |
|---|---|---|
| Frontend e evidências | Clientes JS, telas, mensagens, confirmação, acessibilidade básica, testes e documentação. | Revisão de outro integrante e confirmação dos contratos. |
| Reservas e exposição HTTP | Consumir os contratos confirmados e informar o necessário para os formulários. | Silva: regras/serviço e exposição dos contratos de reservas, em coordenação com a equipe. |
| Persistência e projeções de leitura | Conferir o uso dos dados e preservar a identificação correta na interface. | Fausto: leitura SQL, paginação, vínculos e projeções, em coordenação com Silva. |
| Segurança, eventos e qualidade compartilhada | Validar comportamento do cliente e apresentar evidências dos próprios fluxos. | Débora: autorização real, sessão, auditoria/notificação e configuração/qualidade da CI, com revisão da equipe. |
| Aceite visual | Marcos testa os fluxos no Chrome; assistente prepara e registra a evidência. | Não substitui revisão de outro integrante. |

São responsabilidades de integração, não autorização para enviar mensagens à equipe ou modificar componentes de terceiros automaticamente.

### Onde cada alteração deve entrar

- Correções de administração/movimentações após a integração do #23: branch própria a partir da develop atual, vinculada à story pertinente e com novo PR.
- Correções da fila, navegação conciliada e aceite da Marcos-4: `feature/marcos-4-aprovacoes`, vinculadas à Marcos-4.
- Restante da etapa 3: story própria ou refinamento explícito do recorte existente, antes do código; branch própria a definir quando o contrato de leitura estiver confirmado.
- Preparação de testes integrados: recorte próprio e rastreável, baseado no conjunto atualizado, sem misturar novos fluxos ao PR #23.

A Marcos-4 será nossa referência para conferir o conjunto completo do frontend implementado. Isso não exige concentrar nela todas as correções. Após o merge do #23, a referência de integração da administração é a develop; propagar por ela as correções da base para a Marcos-4, mantendo comparações de PR compreensíveis.

## 5. Passo 1 — preservar o estado local e sincronizar a base

**Objetivo:** trazer o trabalho de casa e sincronizar a Marcos-4 diretamente com a develop que já contém administração e movimentações.

**Responsáveis:** Marcos e assistente; operações Git/GitHub pelo fluxo AIOX correspondente. Nenhuma publicação ou merge remoto está incluído na criação deste plano.

### Ações

1. Conferir branch, alterações e commits locais. A criação deste plano deixará um arquivo novo; preservá-lo, junto de qualquer outra alteração que apareça antes da execução.
2. Atualizar as referências do remoto com fetch e conferir novamente os PRs. Fetch atualiza referências; não incorpora sozinho as mudanças aos arquivos de trabalho.
3. Trazer a branch Marcos-4 para este computador, caso ainda não exista, ou sincronizá-la com sua origem remota. Se houver divergência local, examinar os commits antes de decidir a integração; preservar o trabalho existente.
4. Incorporar a develop atualizada à Marcos-4, preparando uma mudança revisável. Conciliar documentação/RTM por conteúdo e preservar as evidências anteriores. Não é mais necessário passar pela branch administrativa como etapa anterior.
5. Conferir a árvore resultante e validar as alterações relevantes. Registrar eventuais commits de integração conforme o fluxo de aceite/commit já combinado.
6. Conferir que Aprovações, Gestão e Movimentações continuam presentes e que os atalhos respeitam os perfis; confirmar que o #24 continua apontando à develop.

Comandos iniciais de referência, a executar individualmente, conferindo cada resultado:

```powershell
git status --short --branch
git branch -vv
git fetch origin
```

Para acessar a Marcos-4 depois do fetch, escolher somente a situação correspondente:

```powershell
# Se a branch ainda não existir localmente:
git switch --track origin/feature/marcos-4-aprovacoes
```

```powershell
# Se já existir localmente:
git switch feature/marcos-4-aprovacoes
```

Os comandos de switch não substituem a incorporação da develop descrita acima. Conferir estado e diferenças antes de cada merge; um merge também pode criar commit. Se houver erro ou conflito, resolver essa condição antes de continuar a sequência. Não reescrever os commits publicados como rotina de sincronização.

### Critério de saída

- [x] Plano e outras alterações locais preservados.
- [x] Referências remotas e situação dos PRs conferidas novamente.
- [x] Marcos-4 disponível localmente e sincronizada com sua origem remota antes da incorporação local.
- [x] Develop 23cf839 incorporada à Marcos-4 sem conflitos.
- [x] Comparação com a develop preserva o escopo da Marcos-4; sincronização a8da77c enviada pelo usuário e conferida no PR #24, destino develop.
- [x] Branch, commits de origem e resultados da conferência registrados nas evidências; commit resultante consultável no histórico Git.

## 6. Passo 2 — validar o conjunto consolidado

**Objetivo:** estabelecer uma base reproduzível para novas alterações, antes de investigar regressões ou ampliar os fluxos.

1. Conferir a branch e os arquivos efetivos no checkout consolidado.
2. Conferir Node/npm, dependências já instaladas e o navegador disponível. Instalar dependências somente se necessário; preservar package.json e lockfile quando não houver mudança justificada.
3. Executar o build do frontend. No package.json atual, ele já inclui lint, typecheck, testes unitários e testes de navegador; não é necessário executar todas essas suítes novamente em sequência só para repetir o mesmo resultado.
4. Comparar os cenários executados à evidência anterior de 68/238. Investigar qualquer ausência de suíte, falha ou alteração de contagem antes de atribuir sucesso ao conjunto.
5. Registrar comando, ambiente, branch/commit, resultados reais e limites da execução.

No PowerShell, com o Chrome instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run build
```

No CMD:

```bat
set "PLAYWRIGHT_CHANNEL=chrome"
npm run build
```

Se o ambiente não tiver o Chrome configurado, conferir o navegador disponível e a configuração do Playwright antes de adotar o comando. Não aumentar timeout/retries para transformar uma falha não investigada em aprovação.

### Critério de saída

- [x] Lint e typecheck aprovados.
- [x] Unitários e navegador aprovados: 68/238, zero falhas/ignorados/flaky/retries.
- [x] Administração, movimentações e fila presentes na mesma regressão.
- [x] Evidências vinculadas à árvore efetivamente testada, com origens e preservação dos 45 arquivos conferidas.

Depois disso, repetir testes somente quando alterações, falhas ou uma preocupação nova justificarem. Atualizações exclusivamente documentais exigem conferência dos documentos, não uma nova suíte completa por rotina.

## 7. Passo 3 — acompanhar a qualidade após a integração do PR #23

**Objetivo:** compreender e tratar as pendências de qualidade que permaneceram após a integração de administração/movimentações. O #23 já foi mesclado; eventuais correções seguem por novo incremento, sem aguardar outro merge desse PR.

Na conferência anterior ao merge, em 12/11:

- A etapa de unitários/integração MySQL e gates JaCoCo passou no job Java.
- O job JMeter passou.
- A etapa Maven de análise Sonar falhou.
- O check separado `SonarCloud Code Analysis` falhou com `D Reliability Rating on New Code`, exigência A, e duas anotações.
- O PR relata apontamentos de ordenação em administracao-recursos.js, nas posições 113 e 162 da versão analisada. Reabrir as anotações atuais e conferir as linhas antes de editar.

Após o merge, a [CI da develop 23cf839](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43229810267) também concluiu com falha: a etapa de unitários/integração MySQL/gates passou e o job JMeter passou, mas a etapa de análise Sonar falhou. O merge não elimina essas pendências nem substitui sua investigação.

Essas falhas precisam ser examinadas separadamente. A descrição do PR menciona erro de autorização/projeto no scanner; isso não comprova sozinho uma causa ligada ao plano do serviço. As anotações também não são, por si, prova de defeito funcional.

### Ações

1. Ler os logs da develop atual e as anotações anteriores, conferindo a versão analisada e se os apontamentos permanecem aplicáveis.
2. Revisar as funções de comparação/canonicalização afetadas. Definir a correção ou o tratamento fundamentado do apontamento sem alterar silenciosamente a semântica.
3. Executar os testes adequados à alteração e a regressão pertinente; acrescentar cenário somente se houver comportamento relevante ainda não coberto.
4. Com Débora, conferir separadamente configuração, credenciais/permissões do scanner e requisitos do projeto no Sonar.
5. Atualizar a story correspondente, File List e evidências; preparar a descrição de eventual novo PR, distinguindo testes aprovados de checks ainda pendentes.
6. Após commit/publicação pelo fluxo combinado, conferir os checks no novo SHA e obter revisão da equipe para a correção.

Não retirar gates nem mudar a base para main apenas para evitar uma verificação. Eventual alteração de CI precisa tratar a causa e ser revisada no escopo apropriado.

### Critério de saída

- [x] Duas ordenações analisadas/corrigidas preservando semântica; build 70/238 e posterior 72/240 aprovados, com hashes e limites.
- [ ] Falha do scanner identificada e tratada com o responsável.
- [ ] Verificações exigidas atendidas no commit a entregar; indisponibilidades não declaradas como aprovação.
- [ ] Revisão humana e pendências de integração explicitadas no PR.

## 8. Passo 4 — concluir o aceite visual da Marcos-4

**Objetivo:** registrar a conferência do autor para a interface conciliada, separadamente dos testes automatizados.

Pode avançar enquanto a equipe conclui o backend e as pendências de qualidade pós-merge são tratadas.

### Roteiro no Chrome

1. Abrir Aprovações com perfil Responsável e identificar o ambiente: simulado ou real.
2. Aplicar e limpar filtros, conferir paginação, vazio, carregamento e erro.
3. Abrir uma solicitação e conferir solicitante, período e identificação dos recursos.
4. Aprovar uma solicitação com confirmação explícita.
5. Rejeitar outra com motivo obrigatório e confirmar a atualização da fila.
6. Conferir conflito ou decisão já realizada, preservação do contexto e atualização sem reenvio automático.
7. Conferir teclado, foco, mensagens e layout em desktop e móvel.
8. Conferir que Solicitante/Administrador não recebem ações de decisão e que Gestão/Movimentações mantêm seus atalhos por perfil.

Se a API real ainda não estiver pronta, a prévia controlada deve ser identificada como fictícia e permanecer fora do produto. `npm run preview` serve arquivos estáticos; não cria sessão nem fornece o GET da fila.

### Critério de saída

- [x] Marcos informou “está aprovado” após a prévia da interface conciliada/sincronizada e o roteiro apresentado.
- [x] Nenhum ajuste funcional solicitado na confirmação do aceite; produto e testes permaneceram preservados.
- [x] Aceite/contexto/limites registrados na story e nas evidências; capturas automatizadas anteriores preservadas, sem atribuir E2E ao teste simulado.

## 9. Passo 5 — consolidar os contratos e dependências da leitura

**Objetivo:** permitir a integração da fila e a implementação do restante da etapa 3 sem criar expectativas fictícias de API.

### O que já está decidido

- Solicitante consulta suas próprias reservas e estados.
- Responsável consulta reservas de recursos sob sua responsabilidade, incluindo solicitações que deve avaliar.
- Administrador consulta todas para administração e acompanhamento.
- Consulta de disponibilidade é distinta da exposição dos dados completos das reservas.
- Direito de leitura não concede novas ações de escrita.

Não reabrir essa decisão de escopo. Precisamos traduzi-la em contrato e implementação verificáveis.

### Entregas a conferir com a equipe

| Necessidade | O que precisa ficar explícito | Responsáveis pela integração |
|---|---|---|
| Listagem de reservas | Rota, filtros, ordenação, paginação/total, DTO mínimo e escopo aplicado no servidor. | Silva, Fausto e Débora; Marcos revisa o consumo. |
| Detalhe para edição | Leitura da reserva completa autorizada; período, todos os recursos, estado e campos necessários para preencher o formulário. | Silva/Fausto e Débora. |
| Fila de aprovação | Rota definitiva ou uso ratificado de status=SOLICITADA, projeções, filtros, paginação e erro de parâmetros. | Silva/Fausto, com revisão de segurança. |
| Escopo do Responsável | Origem do vínculo responsável/recurso, seleção no servidor e tratamento de reservas com múltiplos recursos. | Equipe de backend/segurança. |
| Identificação e erros | Dados mínimos do solicitante, projeção de professor/competências se necessária e convenção 403/404 fora do escopo. | Débora e responsáveis pelos contratos. |

Na fotografia original esses GETs ainda eram propostas. Agora `GET /api/reservas` e `GET /api/reservas/{id}` estão entregues, documentados em [consultas](../api/reservas-consulta-contrato.md) e testados com Q9/fila reais após #26/#27. Não aguardar novamente essa entrega. Ratificação coletiva e processo de concessão dos vínculos ainda precisam de registro da equipe.

Marcos deve fornecer exemplos de consumo, conferir DTOs e registrar o aceite do frontend. Filtros do navegador não substituem a delimitação de escopo no servidor. Nenhuma mensagem foi enviada à equipe ao elaborar este plano.

### Critério de saída

- [ ] Contratos de listagem, detalhe e fila ratificados pelos responsáveis.
- [x] Exemplos de sucesso, vazio, parâmetros inválidos, sessão ausente e acesso fora do escopo registrados nas evidências Q9/fila.
- [x] Implementação HTTP, leitura e autorização disponíveis para os fluxos a integrar.
- [x] Consumo relaciona cada campo/ação ao contrato, sem inventar identidade ou permissão no cliente; ratificação coletiva segue na linha anterior.

Com contratos estáveis, o frontend pode avançar com testes isolados enquanto a equipe conclui a integração. O fechamento integrado permanece condicionado ao backend real.

## 10. Passo 6 — implementar o restante da etapa 3

**Objetivo:** completar a interface de reservas existentes: consultar, editar e cancelar conforme contrato.

Story [Marcos-3-consulta-edicao](../stories/marcos-3-consulta-edicao.md) preparada por SM antes do código. Implementação na branch `feature/marcos-reservas-consulta`, sobre f9c4912; evidências no [relatório](../testes/marcos-3-consulta-edicao-resultados.md). Próximo checkpoint é o aceite visual, ainda não recebido.

### Ações

1. Partir de uma base que contenha o frontend consolidado e os contratos ratificados. Se os PRs anteriores já tiverem chegado à develop, usar a develop atualizada; caso contrário, manter a dependência explícita do novo incremento.
2. Implementar a listagem com os filtros e a paginação efetivamente contratados, incluindo carregando, vazio, erro e informações mínimas por perfil.
3. Para edição, carregar a reserva completa pela leitura autorizada antes de habilitar o formulário. Preservar todos os recursos e os valores não alterados.
4. Reenviar `inicio`, `fim` e `recursosIds` juntos no PATCH, como exige o contrato existente; não enviar solicitante, papel ou estado como identidade do ator.
5. Aplicar estados editáveis e permissões confirmados no contrato, mantendo a decisão final no servidor. Receber dados de consulta não implica poder editá-los.
6. Para cancelamento, apresentar alvo e confirmação; atualizar a interface somente após resposta coerente de sucesso. Preservar histórico e não apresentar remoção física como resultado.
7. Tratar conflito, transição inválida, sessão expirada, dados alterados por outro operador e resposta incerta, sem repetição automática de escrita.
8. Manter datas em America/Sao_Paulo por conversão explícita, CSRF dinâmico, texto seguro, referência de suporte, envio único, foco e responsividade.
9. Executar verificações relevantes, regressões e revisão visual; atualizar story, File List, documentação de consumo e RTM.

### Critério de saída

- [x] Listagem usa contrato entregue e escopo aceito por Marcos; ratificação coletiva acompanhada no passo 5.
- [x] Edição inicia por detalhe autorizado completo e envia o PATCH conjunto.
- [x] Cancelamento confirmado e estados/erros coerentes com a API nos cenários executados.
- [x] Regressão preserva criação, fila, administração e movimentações.
- [x] Testes/evidências e aceite registrados; commit local autorizado, identificado pelo commit que inclui o registro do aceite. Publicação/revisão/merge separados.

## 11. Passo 7 — validar com backend real

**Objetivo:** substituir a suposição de compatibilidade por provas dos fluxos integrados das etapas 1 a 5.

Preparação autorizada/realizada em 12/11: ferramentas portáteis, MySQL novo e Spring próprios; [guia](../integracao/marcos-e2e-local.md). Smoke atualizado sem bloqueio de interface geral e complemento real de edição/cancelamento aprovados; [evidências](../testes/marcos-3-consulta-edicao-resultados.md). A tabela abaixo continua sendo a meta completa, ainda parcialmente pendente.

### Preparação

1. Conferir JDK 21, Maven ou wrapper efetivamente disponível, MySQL e a execução documentada do backend. A disponibilidade dessas ferramentas na máquina de casa não comprova a configuração deste computador.
2. Preparar banco e dados de teste isolados, com migrações e configuração reproduzíveis; usar os três perfis e o vínculo de recursos definido pela equipe.
3. Conferir provedores reais de sessão, eventos e demais dependências antes de ativar APIs no ambiente de teste. Não habilitar flags com provedores vazios nem alterar padrões de produção apenas para a demonstração.
4. Preparar reservas e recursos com horários compatíveis com o relógio real, o expediente e os estados exigidos. Os IDs e datas fixos das fixtures não são dados reais do ambiente integrado.
5. Executar o frontend na mesma origem do backend, conferindo cookies, CSRF e contratos reais. Não interceptar a API nos cenários identificados como E2E.

### Cenários mínimos de fechamento

| Área | Prova integrada esperada |
|---|---|
| Acesso | Login correto/incorreto, me, logout, sessão expirada e CSRF nas escritas. |
| Pesquisa | Filtros/período, paginação, recursos indisponíveis, vazio e expediente verdadeiro. |
| Reserva comum/restrita | Criação e estados retornados; conflito preserva contexto e informa a falha sem expor outro solicitante. |
| Consulta/Q9 | Próprias reservas do Solicitante; escopo de recursos do Responsável; consulta administrativa; negativa real fora do escopo. |
| Edição/cancelamento | Detalhe, PATCH completo, confirmação, estados permitidos e tratamento de conflito/alteração concorrente. |
| Aprovação/rejeição | Fila real no escopo autorizado, filtros/página, decisão exclusiva de Responsável, motivo e atualização. |
| Administração | Tipos de recursos, GET antes de PUT completo, desativação, manutenção e expediente com confirmação. |
| Movimentações | Retirada elegível, pendência após o prazo, devolução confirmada e atraso final da API; Administrador somente em leitura. |
| Erros e uso da interface | correlationId, ausência de sucesso falso/reenvio automático, preservação em falhas, teclado, foco e larguras móvel/desktop. |

Provas de segurança, persistência, auditoria, notificação e concorrência pertencem também às entregas da equipe. Marcos confere o comportamento do cliente e referencia as evidências apropriadas; uma mensagem de sucesso no navegador não comprova esses mecanismos sozinha.

### Critério de saída

- [x] Ambiente/dados/comandos locais documentados; credenciais e ferramentas ignoradas pelo Git.
- [ ] Cenários executados com backend real, separados dos cenários com mocks.
- [x] Resultados parciais, FE-004, correção, data/ambiente e hashes da árvore sem commit registrados.
- [ ] Evidências da equipe relacionadas às provas que excedem a camada cliente.

## 12. Passo 8 — revisão, merges e encerramento das etapas 1 a 5

1. Conferir os PRs e a base de cada um novamente, pois outros integrantes podem ter integrado mudanças durante o trabalho.
2. Registrar o #23 como já entregue à develop, preservando a identificação dos commits de administração e movimentações e o acompanhamento da qualidade pós-merge.
3. Registrar o #24 já mesclado em da5881b; preparar revisão/aceite do incremento novo antes do commit solicitado por Marcos. Não repetir a sincronização/PR do incremento já integrado.
4. Conferir os checks do novo SHA quando publicado e acompanhar remediação do scanner Sonar; resultado local não aprova análise remota.
5. Entregar o complemento da etapa 3 no PR próprio definido para ele, respeitando as dependências dos anteriores.
6. Atualizar plano, stories, status, File Lists, RTM, README/índice de docs e evidências conforme o estado efetivo. Reconciliar registros antigos de Q9/PRs com os documentos mais recentes, preservando o contexto histórico.
7. Registrar o que foi aceito por Marcos, o que recebeu revisão de outro integrante e o que foi executado em CI/E2E. CodeRabbit indisponível não equivale à ferramenta aprovada; obter a revisão independente prevista e tratar sua exigência conforme as regras vigentes do projeto.

### Critério de encerramento

- [x] Funcionalidades de frontend previstas até a etapa 5 implementadas localmente; complemento da etapa 3 ainda não entregue à develop.
- [ ] Consultas e operações respeitam os contratos e a Q9 aplicada no servidor.
- [ ] Marcos deu o aceite visual dos incrementos pertinentes.
- [ ] Testes relevantes passaram e as evidências correspondem ao código entregue.
- [ ] Integração real foi validada nos fluxos previstos.
- [ ] Revisão humana e verificações exigidas dos PRs foram atendidas.
- [ ] Alterações pertinentes chegaram à develop.
- [ ] Documentação e rastreabilidade refletem o resultado, sem pendência ocultada ou aprovação presumida.

Até essas condições serem atendidas, manter a distinção entre incremento local encerrado e entrega integrada. As responsabilidades globais dos RFs compartilhados não são encerradas somente pelo frontend.

## 13. O que podemos fazer enquanto aguardamos a equipe

| Pode avançar com a informação atual | Condição que ainda limita a entrega |
|---|---|
| Sincronizar a base e conferir regressões existentes. | Investigar falhas reais antes de prosseguir sobre uma base desconhecida. |
| Revisar os apontamentos anteriores do #23 e a falha Sonar pós-merge na develop. | Configuração compartilhada exige participação do responsável; correções seguem por novo incremento. |
| Aceite visual da Marcos-4 realizado e registrado; preparar sua publicação e revisão da equipe. | Isso não substitui endpoint/autorização reais. |
| Preparar ambiente E2E e os cenários dos contratos já existentes. | Execução dos novos GETs aguarda implementação. |
| Refinar os critérios do restante da etapa 3. | Código de consumo e testes de contrato precisam de contrato ratificado; integração depende da API. |

## 14. Fluxo de execução e primeiro passo

Para cada mudança: conferir story/contrato e branch, implementar o incremento, executar verificações proporcionais, registrar evidências e atualizar checklist/File List. Marcos testa e revisa a interface pertinente. Commit após sua solicitação, conforme o fluxo já adotado; push e alterações de PR seguem a autorização da sessão, sem publicação automática por este documento.

Passos 1, 2 e 4 executados; #23/#24/#26/#27 mesclados. Base enviada f9c4912, complemento local da etapa 3 em feature/marcos-reservas-consulta. Próximo ponto: revisão visual desse complemento e commit somente após solicitação. Leituras/Q9 disponíveis; matriz E2E completa, Sonar, ratificação coletiva/processo de vínculos e revisão da equipe continuam separados.

## 15. Fontes para retomar o contexto

- [Plano original de responsabilidades e etapas](marcos-plano-de-acao.md): neste checkout ainda contém estados anteriores à atualização feita em casa; consultar junto da versão remota consolidada.
- [Plano consolidado consultado na Marcos-4](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/df5706327ce76aac67cec3935b9749ec96e68573/docs/planejamento/marcos-plano-de-acao.md).
- [Marcos-1](../stories/marcos-1.md), [Marcos-2](../stories/marcos-2.md), [Marcos-3](../stories/marcos-3.md), [administração](../stories/marcos-5.md) e [movimentações](../stories/marcos-5-movimentacoes.md).
- [Story Marcos-4 publicada](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/df5706327ce76aac67cec3935b9749ec96e68573/docs/stories/marcos-4.md).
- [Política Q9 documentada](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/df5706327ce76aac67cec3935b9749ec96e68573/docs/api/reservas-politica-leitura-q9.md).
- [Contrato local de reservas](../api/reservas-contrato.md) e [proposta de leitura da fila](../api/reservas-leitura-contrato.md): exemplos de contrato, não comprovação de disponibilidade do GET.
- [Pendências de integração da fila na develop conferida](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/9d6b56cd0cb78ed8c0f1c10fbbb8661709a4da12/docs/integracao/revisao-contrato-fila-rf07.md).
- [Evidências da conciliação Marcos-4](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/df5706327ce76aac67cec3935b9749ec96e68573/docs/testes/marcos-4-conciliacao-resultados.md) e [revalidação após atualização da base](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/df5706327ce76aac67cec3935b9749ec96e68573/docs/testes/marcos-integracao-2026-11-11-resultados.md).
- [Execução CI do PR #23, anterior ao merge](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43137824691), [check separado Sonar](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/runs/130917502876) e [CI pós-merge da develop 23cf839](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43229810267).
- [Workflow de CI conferido](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/8df312e17e21cbf3c254fcef4cb94fabe3fa0061/.github/workflows/ci.yml).
