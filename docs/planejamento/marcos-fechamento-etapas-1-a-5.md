# Marcos — plano de fechamento das etapas 1 a 5

Data da conferência: **12/11/2026**, America/Sao_Paulo.\
Responsável pelo frontend: **Marcos Boé**.\
Estado: **EM EXECUÇÃO; sincronização e validação dos passos 1 e 2 concluídas localmente em 12/11/2026**.

Atualização em 12/11/2026 após comunicação de Marcos: **PR #23 mesclado na develop**, commit `23cf839`, às 10:42 de São Paulo. O PR #24 já tem destino develop e continua em Draft. O plano foi ajustado para sincronizar diretamente a Marcos-4 com essa develop; a CI pós-merge ainda tem falha na etapa Sonar, registrada separadamente da integração realizada.

Este plano foi solicitado por Marcos após a conferência do repositório e dos trabalhos realizados em casa. Consolida a ordem de execução, as dependências da equipe e as condições para encerrar as responsabilidades das etapas 1 a 5. Não cria endpoints, regras de negócio, prazos ou stories de implementação por inferência.

A preparação original deste arquivo incluiu somente leitura do checkout e consulta ao GitHub. Posteriormente Marcos pediu “vamos fazer a sincronização”: plano preservado por cópia/hash, fetch executado, branch Marcos-4 trazida para este computador e develop 23cf839 incorporada sem conflitos. Lint/typecheck e regressão 68 unitários/238 navegador aprovados; frontend/testes/configuração preservados. [Execução, evidências e limites](../testes/marcos-sincronizacao-2026-11-12-resultados.md). Não houve push ou alteração de PR nesta etapa. Os passos seguintes continuam planejados, não executados.

## 1. Resultado que buscamos

Concluir os fluxos de acesso, pesquisa, reservas, aprovação e administração/movimentação previstos até a etapa 5, com implementação do frontend, aceite de Marcos, evidências reproduzíveis e entrega integrada revisada.

Há três estados distintos a registrar durante o trabalho:

| Estado | O que comprova |
|---|---|
| Implementado e validado localmente | Código do cliente funciona nas verificações executadas, inclusive testes com API controlada. |
| Aceito e pronto para revisão | Marcos validou o incremento; código, story, documentação e evidências estão preparados para revisão. |
| Entregue de forma integrada | Fluxos funcionam com backend real, revisões/checks exigidos foram atendidos e os PRs pertinentes chegaram à develop. |

Não reimplementar o que já está entregue nos incrementos existentes. A principal funcionalidade de frontend ainda ausente é o restante da etapa 3: **consultar reservas existentes, abrir para edição e cancelar pela interface**. A Marcos-4 já foi implementada e conciliada, mas ainda depende de aceite visual detalhado e da leitura/autorização reais.

Relatórios da etapa 6 ficam fora deste plano. O E2E aqui previsto comprova os fluxos das etapas 1 a 5 e alimenta as evidências finais do projeto; não declara toda a etapa 7 concluída antecipadamente.

## 2. Fotografia do repositório usada no planejamento

Fotografia conferida antes da execução; os commits abaixo identificam sua origem. O checkout agora é Marcos-4 com a incorporação local descrita nas evidências. Revalidar branches, PRs e checks antes das próximas ações, pois podem mudar depois desta conferência.

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
| [#24 — Marcos-4](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/24) | Aberto em Draft, destino develop. | Atualizar sua branch com a develop, validar a fila e conferir os checks no contexto atual. |

O PR #23 está efetivamente integrado. O GitHub não apontou conflito de merge no #24 na atualização, mas ele permanece bloqueado para entrega. Aprovação, checks, validação real e merge são condições distintas; o merge do #23 não comprova aprovação do Sonar ou E2E.

### Testes já registrados

| Árvore / incremento | Unitários | Navegador | Limite da evidência |
|---|---:|---:|---|
| Administração original | 45 | 130 | Frontend isolado, com aceite visual de Marcos. |
| Administração + movimentações | 57 | 190 | Frontend isolado, com aceite visual e reexecução de Marcos. |
| Marcos-4 conciliada com os anteriores | 68 | 238 | Frontend isolado, com reexecução de Marcos; aceite visual detalhado ainda indicado como pendente. |

As contagens são cumulativas dentro de cada árvore, não devem ser somadas. Foram conferidas nas evidências publicadas, sem nova execução durante a preparação deste plano. São referências para a regressão, não metas fixas: novas contagens devem refletir os testes efetivamente executados e as mudanças realizadas.

## 3. O que falta em cada etapa

| Etapa | Implementação existente | Trabalho de fechamento |
|---|---|---|
| 1 — comunicação com a API | Clientes, sessão/CSRF, erros e proteção contra envio repetido. | Conferir contrato efetivo com o backend integrado, revisão/checks e coerência do status documental. |
| 2 — acesso e navegação | Login, logout, perfil, expiração e layout responsivo. | Validar com sessão real e navegação consolidada dos três perfis. |
| 3 — pesquisa e reservas | Pesquisa, seleção e criação comum/restrita. | Contratos de leitura; listagem, carregamento para edição, PATCH completo e cancelamento pela interface; integração real. |
| 4 — fila e decisões | Filtros, paginação, projeção de detalhes, aprovação/rejeição e motivo. | Aceite visual, contrato coletivo definitivo, endpoint HTTP e autorização Q9 no servidor, E2E e PR #24. |
| 5 — recursos e movimentações | Cadastros, manutenção, expediente, retirada, pendências e devolução; código integrado pelo #23. | Acompanhar qualidade pós-merge e validar os fluxos com backend real; tratar correções remanescentes em incremento próprio. |

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
- [x] Comparação local com a develop preserva o escopo da Marcos-4; PR remoto ainda em df57063, aguardando publicação local pelo fluxo combinado.
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

- [ ] Anotações analisadas e tratamento registrado.
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

- [ ] Marcos informou o aceite visual do fluxo conciliado, ou descreveu ajustes necessários.
- [ ] Ajustes tratados na Marcos-4 com validação proporcional.
- [ ] Aceite, capturas pertinentes e limites registrados na story e nas evidências, sem atribuir E2E ao teste simulado.

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

As rotas `GET /api/reservas` e `GET /api/reservas/{id}` são necessidades/propostas dos artefatos existentes, não endpoints declarados disponíveis por este plano. A leitura SQL da fila já chegou à develop no PR #22, mas o controller HTTP de leitura ainda não foi entregue na versão conferida.

Marcos deve fornecer exemplos de consumo, conferir DTOs e registrar o aceite do frontend. Filtros do navegador não substituem a delimitação de escopo no servidor. Nenhuma mensagem foi enviada à equipe ao elaborar este plano.

### Critério de saída

- [ ] Contratos de listagem, detalhe e fila ratificados pelos responsáveis.
- [ ] Exemplos de sucesso, vazio, parâmetros inválidos, sessão ausente e acesso fora do escopo registrados.
- [ ] Implementação HTTP, leitura e autorização disponíveis para os fluxos a integrar.
- [ ] Marcos consegue relacionar cada campo/ação do formulário ao contrato, sem inventar identidade ou permissão no cliente.

Com contratos estáveis, o frontend pode avançar com testes isolados enquanto a equipe conclui a integração. O fechamento integrado permanece condicionado ao backend real.

## 10. Passo 6 — implementar o restante da etapa 3

**Objetivo:** completar a interface de reservas existentes: consultar, editar e cancelar conforme contrato.

Antes do código, preparar/refinar uma story com critérios testáveis e fontes, seguindo AGENTS.md e o fluxo SM/PO. O nome da nova branch será definido ao iniciar esse recorte; não há nova branch criada por este plano.

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

- [ ] Listagem usa o escopo e o contrato ratificados.
- [ ] Edição inicia por detalhe autorizado completo e envia o PATCH conjunto.
- [ ] Cancelamento confirmado e estados/erros coerentes com a API.
- [ ] Nenhuma perda dos fluxos de criação, fila, administração ou movimentações.
- [ ] Testes, evidências, aceite e commit do incremento registrados pelo fluxo combinado.

## 11. Passo 7 — validar com backend real

**Objetivo:** substituir a suposição de compatibilidade por provas dos fluxos integrados das etapas 1 a 5.

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

- [ ] Ambiente, dados e comandos reproduzíveis documentados, sem credenciais no versionamento.
- [ ] Cenários executados com backend real, separados dos cenários com mocks.
- [ ] Resultados, defeitos, correções e limites registrados com commit/data/ambiente.
- [ ] Evidências da equipe relacionadas às provas que excedem a camada cliente.

## 12. Passo 8 — revisão, merges e encerramento das etapas 1 a 5

1. Conferir os PRs e a base de cada um novamente, pois outros integrantes podem ter integrado mudanças durante o trabalho.
2. Registrar o #23 como já entregue à develop, preservando a identificação dos commits de administração e movimentações e o acompanhamento da qualidade pós-merge.
3. Atualizar a Marcos-4 com a develop e conferir a comparação do #24, cujo destino já é develop. Se a ancestralidade ou o conteúdo tiverem mudado, tratar isso antes de declarar o diff limpo.
4. Conferir os checks do #24 no novo contexto. O Sonar automático havia aprovado sua versão consultada, mas isso não comprova uma CI completa: o workflow filtra as branches de destino e não incluía a base administrativa anterior. Com destino develop e após a atualização da branch, conferir as execuções exigidas no novo SHA.
5. Entregar o complemento da etapa 3 no PR próprio definido para ele, respeitando as dependências dos anteriores.
6. Atualizar plano, stories, status, File Lists, RTM, README/índice de docs e evidências conforme o estado efetivo. Reconciliar registros antigos de Q9/PRs com os documentos mais recentes, preservando o contexto histórico.
7. Registrar o que foi aceito por Marcos, o que recebeu revisão de outro integrante e o que foi executado em CI/E2E. CodeRabbit indisponível não equivale à ferramenta aprovada; obter a revisão independente prevista e tratar sua exigência conforme as regras vigentes do projeto.

### Critério de encerramento

- [ ] Todas as funcionalidades de frontend previstas até a etapa 5 estão implementadas.
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
| Fazer a revisão visual detalhada da Marcos-4 com dados identificados como fictícios. | Isso não substitui endpoint/autorização reais. |
| Preparar ambiente E2E e os cenários dos contratos já existentes. | Execução dos novos GETs aguarda implementação. |
| Refinar os critérios do restante da etapa 3. | Código de consumo e testes de contrato precisam de contrato ratificado; integração depende da API. |

## 14. Fluxo de execução e primeiro passo

Para cada mudança: conferir story/contrato e branch, implementar o incremento, executar verificações proporcionais, registrar evidências e atualizar checklist/File List. Marcos testa e revisa a interface pertinente. Commit após sua solicitação, conforme o fluxo já adotado; push e alterações de PR seguem a autorização da sessão, sem publicação automática por este documento.

Os **passos 1 e 2 foram executados localmente em 12/11/2026**. A sincronização está validada, com publicação remota ainda separada. As próximas frentes do plano são acompanhar a qualidade pós-merge e concluir o aceite visual detalhado da Marcos-4; contratos/endpoint e E2E real permanecem pendentes. Esta execução não iniciou novas funcionalidades nem declarou concluídos os passos 3 a 8.

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
