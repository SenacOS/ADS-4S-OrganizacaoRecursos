# Relatório de trabalho — Marcos Boé

Data: 11/11/2026\
Projeto: ADS-4S-OrganizacaoRecursos\
Finalidade: transferir o contexto do trabalho realizado hoje para o chat utilizado em casa.

## 1. Resultado do dia

Concluímos a implementação local da etapa 5 do plano de Marcos, dividida em dois incrementos:

1. Administração de recursos, manutenção e expediente.
2. Movimentações: retirada, pendências e devolução de materiais.

Os dois incrementos receberam testes automatizados, documentação, evidências, revisão assistida e aceite visual de Marcos no Chrome. Ambos foram commitados em branches separadas.

“Implementação local concluída” significa que o frontend foi implementado e validado com API controlada nos testes. A entrega integrada ainda depende da revisão da equipe, do CI e da validação com o backend real.

Ao final do trabalho:

- Branch ativa: `feature/marcos-movimentacoes`.
- Último commit: `f7360a2`.
- Árvore de trabalho limpa, sem alterações pendentes.
- Q9 informado como resolvido posteriormente, apenas na conversa.
- Nenhuma alteração foi realizada para aplicar a decisão do Q9.

## 2. Organização do trabalho e continuidade entre computadores

Marcos informou que a Marcos-4 está praticamente implementada no computador de casa, mas ainda não havia sido commitada naquele momento.

Decidimos avançar em partes independentes:

- A administração de recursos não dependia da Marcos-4 nem da política Q9.
- Movimentações também puderam ser implementadas com o contrato existente, usando o número da reserva apresentado no comprovante.
- Não criamos consultas fictícias de reservas para contornar as dependências.

Foi mantida a separação entre os trabalhos locais dos dois computadores. Ao retomar em casa, será necessário preservar e conferir as alterações não commitadas da Marcos-4 antes de trocar branches ou incorporar atualizações.

## 3. Primeiro incremento: administração de recursos

Story: `docs/stories/marcos-5.md`\
Branch: `feature/marcos-5-administracao-recursos`\
Base: `a10e0b5`

Implementamos a área administrativa em:

- `backend/src/main/resources/static/pages/gestao-recursos.html`
- `backend/src/main/resources/static/js/administracao-recursos.js`
- `backend/src/main/resources/static/js/gestao-recursos-page.js`
- `backend/src/main/resources/static/css/administracao.css`

Também foram atualizados a navegação, os testes e a documentação.

### Comportamentos entregues

- Acesso administrativo somente para ADMINISTRADOR.
- Conferência do perfil antes de consultar dados administrativos.
- Pesquisa de recursos com filtros e paginação do servidor.
- Cadastro de salas, professores e materiais.
- Formulários com os campos correspondentes a cada tipo.
- Consulta do detalhe antes de permitir edição.
- PUT com os dados completos do recurso.
- Tipo do recurso preservado durante a edição.
- Desativação lógica com confirmação explícita.
- Tratamento de conflito sem apresentar desativação como concluída.
- Listagem, criação e cancelamento de bloqueios de manutenção.
- Bloqueios que atravessam mais de um dia.
- Datas interpretadas e exibidas no fuso de São Paulo.
- Consulta e edição da lista completa de janelas de expediente.
- Preservação dos dias e da precisão dos horários recebidos.
- Validação de sobreposição entre janelas.
- Confirmação explícita para salvar expediente vazio, que representa fechamento.
- Tratamento de erros, carregamento, mensagens e referência de suporte.
- Bloqueio de envios simultâneos e de troca de contexto durante operações.

### Correções realizadas

Na primeira execução, quatro testes de navegador falharam por verificarem a desabilitação diretamente no fieldset com um matcher inadequado. A verificação foi ajustada para conferir o atributo e os controles descendentes.

Também corrigimos o defeito FE-002:

- Uma falha de pesquisa mantinha o resumo “Consultando recursos”.
- O resumo passou a informar que a consulta não foi concluída.
- Foi acrescentada cobertura para falha e recuperação.

As evidências anteriores foram preservadas.

### Validação e aceite

Resultado final:

- Lint aprovado.
- Typecheck aprovado.
- 45 testes unitários aprovados.
- 130 testes de navegador aprovados.
- Build aprovado.

Marcos executou novamente os testes no CMD e enviou a saída. O arquivo original foi preservado separadamente, com hash conferido.

Depois, abrimos o Chrome com perfil Administrador e dados fictícios. Marcos revisou a interface e autorizou o commit.

Commit:

`c395541c7c297cfde92de3245b5c8b7fe7c0b152`

Mensagem:

`feat(frontend): implementa administracao de recursos manutencao e expediente`

O commit reúne 28 arquivos de implementação, testes, documentação e evidências.

## 4. Pull requests e separação das branches

Marcos criou os pull requests pelo GitHub após receber as descrições preparadas na conversa.

### PR 19 — base do frontend

https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/19

- Origem: `feature/marcos-base-frontend`.
- Destino: `develop`.
- Reúne a base dos clientes, autenticação, navegação, pesquisa e criação de reservas já implementadas anteriormente.
- As implementações dessa base não foram refeitas hoje.

### PR 20 — administração de recursos

https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/20

- Origem: `feature/marcos-5-administracao-recursos`.
- Destino utilizado: `feature/marcos-base-frontend`.
- Contém o incremento administrativo separado.
- Marcos confirmou que o marcou como Draft.

O estado Draft foi informado por Marcos na conversa. Não foi feita nova consulta remota para verificar o estado atual desses PRs ao preparar este relatório.

### Decisão sobre movimentações

Marcos perguntou se seria melhor desfazer o PR administrativo e continuar na mesma branch, porque movimentações ainda pertencem à etapa 5.

Decidimos:

- Manter o PR 20 com o escopo administrativo.
- Não acrescentar movimentações àquela branch.
- Criar uma story e uma branch próprias para o complemento da etapa 5.

Etapa do plano, story, branch e PR não precisam ter uma relação de um para um: a etapa 5 passou a reunir dois incrementos revisáveis.

Não houve confirmação de merge dos PRs nesta conversa.

## 5. Segundo incremento: movimentações

Story: `docs/stories/marcos-5-movimentacoes.md`\
Branch: `feature/marcos-movimentacoes`\
Base: `c395541`

Arquivos principais criados:

- `backend/src/main/resources/static/pages/movimentacoes.html`
- `backend/src/main/resources/static/js/movimentacoes.js`
- `backend/src/main/resources/static/js/movimentacoes-page.js`
- `backend/src/main/resources/static/css/movimentacoes.css`

Também foram atualizados a navegação, os testes de acesso, a configuração do lint e a documentação.

### Permissões

- RESPONSAVEL consulta pendências e registra retirada/devolução.
- ADMINISTRADOR consulta as pendências, sem controles de escrita.
- SOLICITANTE não acessa os dados dessa página.
- O perfil é conferido antes das consultas de movimentações e cadastros.
- As guardas visuais não substituem a autorização do servidor.

### Contrato consumido

Consulta de pendências:

`GET /api/movimentacoes?abertas=true`

Retorno: array simples, sem envelope paginado.

Retirada:

`POST /api/movimentacoes/retiradas`

Corpo:

```json
{
  "reservaId": 1001,
  "recursoId": 8
}
```

Devolução:

`POST /api/movimentacoes/{id}/devolucao`

Sem corpo.

A pesquisa e a identificação dos materiais reutilizam as consultas existentes de recursos.

### Fluxo de retirada

- Informar o número da reserva obtido no comprovante.
- Pesquisar material por patrimônio.
- Escolher explicitamente uma unidade retornada.
- Conferir a identificação e confirmar a retirada.
- Enviar somente os IDs de reserva e recurso.
- Mostrar sucesso apenas após resposta válida e coerente da API.

Não criamos listagem ou seletor de reservas baseado em GET inexistente.

O servidor continua responsável por validar vínculo com a reserva, estado, horário, material ativo, conflitos e retirada aberta.

### Pendências e devolução

- Exibição das retiradas abertas com identificação de movimento, reserva e material.
- Consulta do cadastro para apresentar descrição e patrimônio.
- Identificação pelo número do material quando o cadastro estiver inacessível.
- Falha no detalhe não elimina a pendência nem impede sua devolução.
- Material continua pendente após o fim previsto.
- Prazo ultrapassado aparece como estimativa do navegador.
- Atraso final é apresentado a partir da resposta da API.
- Devolução exige confirmação explícita.
- Retorno idempotente pode registrar outro operador; a interface preserva o operador informado pelo servidor.
- Devolução não promete disponibilidade imediata, pois reservas e manutenção continuam relevantes.

### Tratamento de falhas

- CSRF com o nome de cabeçalho fornecido pela API.
- Bloqueio de duplo envio e operações simultâneas.
- Descarte de respostas antigas.
- Mensagens inseridas como texto, sem interpretar HTML recebido.
- CorrelationId mostrado separadamente como referência de suporte.
- Nenhuma repetição automática de escrita.
- Distinção entre escrita confirmada e falha no GET posterior de atualização.
- Datas exibidas em São Paulo, mesmo com navegador em outro fuso.

### Correção FE-003

A primeira rodada passou 57 testes unitários e 180 testes de navegador. A revisão assistida encontrou um caso ainda não coberto:

Após falha de rede ou resposta incoerente, uma confirmação antiga podia permitir nova tentativa manual sem a reconsulta exigida.

Corrigimos o comportamento:

1. A operação passa a ser tratada como incerta.
2. A confirmação anterior é invalidada.
3. Novos envios ficam bloqueados.
4. Uma consulta de pendências bem-sucedida é exigida.
5. É necessária nova confirmação antes de tentar novamente.
6. Uma consulta que falha não libera o reenvio.

As regressões foram ampliadas para retirada e devolução. As evidências da primeira rodada foram preservadas.

## 6. Testes finais e revisão visual

| Incremento | Unitários | Navegador | Lint, tipos e build |
|---|---:|---:|---|
| Administração | 45 aprovados | 130 aprovados | Aprovados |
| Movimentações, incluindo regressões anteriores | 57 aprovados | 190 aprovados | Aprovados |

As contagens são cumulativas. Não devem ser somadas como testes distintos.

Os testes de navegador cobriram:

- Desktop: 1366 × 900.
- Móvel: 390 × 844.
- Casos dos novos fluxos com navegador em Asia/Tokyo para conferir exibição explícita em São Paulo.
- Perfis, falhas, confirmações, envio único, respostas incoerentes, textos seguros, teclado e foco.

Ambiente registrado nas execuções do assistente:

- Windows.
- Node v26.13.0.
- npm 11.20.0.
- Playwright 1.65.0.
- Chrome 157.0.8103.39.

Essas versões não são atribuídas automaticamente às reexecuções enviadas por Marcos.

Marcos também enviou o resultado de sua execução final de movimentações:

- Lint e typecheck sem erros.
- 57 testes unitários aprovados.
- 190 testes de navegador aprovados, reportados em 1,9 minuto.

O anexo foi preservado integralmente com hash conferido.

### Teste visual de movimentações

Abrimos uma janela do Chrome com:

- Perfil Responsável.
- Dados fictícios.
- Reserva de exemplo 1001.
- Câmera com patrimônio PAT-02.
- Projetor com retirada aberta e prazo ultrapassado.
- Retirada e devolução simuladas em memória.

Marcos confirmou: “testado! podemos fazer o commit”.

Os auxiliares de prévia ficaram em pasta temporária, fora do repositório. Nenhuma API simulada foi adicionada ao produto.

O comando normal `npm run preview` continua servindo apenas os arquivos estáticos; ele não cria sessão nem simula o backend. A simulação manual funcionava na janela controlada que foi aberta.

## 7. Commit final de movimentações

Commit:

`f7360a238ac36ea672955c421ee44557436f1c7c`

Mensagem:

`feat(frontend): implementa retirada pendencias e devolucao de materiais`

Branch:

`feature/marcos-movimentacoes`

O commit reúne 27 arquivos de implementação, testes, documentação e evidências.

Antes do commit, foram conferidos:

- Correspondência entre os arquivos alterados e a File List da story.
- Existência dos arquivos relacionados.
- Validade dos relatórios JSON.
- Links locais da documentação.
- Resultado final de 190 testes de navegador sem falhas.
- Preservação do log original enviado por Marcos.
- Ausência de erros em `git diff --check`.

Depois do commit, a árvore de trabalho ficou limpa.

O assistente não executou push. Foi orientado o comando:

```bash
git push -u origin feature/marcos-movimentacoes
```

Não houve confirmação posterior de execução desse push nem de criação de PR para movimentações.

A branch de movimentações descende da administrativa. Ao preparar seu PR, conferir a base conforme o estado dos merges, para apresentar somente o incremento pretendido.

## 8. Documentação e evidências

Documentos centrais atualizados durante os incrementos:

- `README.md`
- `docs/README.md`
- `docs/RTM.md`
- `docs/api/frontend-integracao.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/qualidade/defeitos-frontend.md`
- `docs/stories/marcos-5.md`
- `docs/stories/marcos-5-movimentacoes.md`

Evidências administrativas:

- `docs/testes/marcos-5-resultados.md`
- `docs/testes/marcos-5-verificacao.txt`
- `docs/testes/marcos-5-verificacao-marcos.txt`
- `docs/testes/marcos-5-primeira-execucao.txt`
- `docs/testes/marcos-5/`

Evidências de movimentações:

- `docs/testes/marcos-5-movimentacoes-resultados.md`
- `docs/testes/marcos-5-movimentacoes-verificacao.txt`
- `docs/testes/marcos-5-movimentacoes-verificacao-marcos.txt`
- `docs/testes/marcos-5-movimentacoes-primeira-execucao.txt`
- `docs/testes/marcos-5-movimentacoes/`

As pastas contêm relatórios JSON, autoavaliações e capturas de tela.

Os registros administrativos anteriores descrevem movimentações como pendentes porque correspondem ao primeiro incremento. O complemento posterior encerrou essa parte localmente; consultar o plano e a story de movimentações para o estado consolidado.

## 9. Q9 resolvido — informação recebida depois do commit

Marcos informou que o Q9 foi resolvido e pediu expressamente:

“Vou te mandar apenas para contexto. Não altere nada. Vou resolver isso em casa.”

A decisão comunicada foi:

| Perfil | Escopo de consulta de reservas |
|---|---|
| SOLICITANTE | Suas próprias reservas e respectivos estados. |
| RESPONSAVEL | Reservas dos recursos sob sua responsabilidade, incluindo solicitações que precisa avaliar. |
| ADMINISTRADOR | Todas as reservas para administração, manutenção e acompanhamento. |

Também ficou estabelecido:

- Consulta de disponibilidade e consulta de dados completos de reservas são coisas diferentes.
- Cada perfil deve receber somente as informações necessárias ao seu trabalho.
- O backend deve aplicar o escopo autorizado.
- A decisão não transforma todos os dados de reservas em informações públicas.

Essa decisão foi recebida apenas como contexto:

- Nenhum arquivo foi alterado para registrá-la.
- Nenhum endpoint foi implementado por causa dela.
- Nenhuma autorização ou configuração foi modificada.
- Nenhum novo commit foi criado para o Q9.
- Alguns documentos do checkout ainda descrevem Q9 como pendente.

Portanto, ao continuar em casa, considerar a política Q9 resolvida conforme esta comunicação, mas conferir a atualização dos contratos e a implementação efetiva das leituras e autorizações.

A decisão de consulta não concede automaticamente aprovação de reservas ou escrita de movimentações ao Administrador.

## 10. Estado das etapas e pendências

### Etapa 3 — reservas

Pesquisa, seleção de recursos e criação de reservas já estavam implementadas e validadas localmente.

O restante do fluxo — consulta de reservas existentes, reabertura para edição e cancelamento — ainda precisa ser conciliado com os contratos e endpoints de leitura.

A resolução do Q9 define a política de acesso, mas não comprova que esses endpoints já estejam integrados.

### Etapa 4 — fila e decisões

Marcos relatou implementação praticamente pronta no computador de casa, ainda não commitada naquele momento.

Esse trabalho não foi sobrescrito nem incorporado ao checkout utilizado hoje. Será necessário recuperá-lo e conferir suas dependências e contratos antes de concluir a integração.

### Etapa 5 — recursos e movimentações

Implementação local encerrada com:

- Cadastros de recursos.
- Manutenção.
- Expediente.
- Retirada.
- Pendências.
- Devolução.
- Testes e aceite visual.
- Commits separados.

As stories permanecem Ready for Review para a revisão e entrega integrada.

### Etapas seguintes

- Etapa 6: relatórios e mensagens de eventos.
- Etapa 7: E2E real e acabamento.
- Etapa 8: revisão e entrega.

Não implementamos relatórios hoje.

### Pendências coletivas

- Revisão humana de outro integrante.
- Acompanhamento dos PRs e CI.
- Integração com autenticação, CSRF e autorização reais.
- Integração com persistência, eventos, auditoria e notificações.
- E2E com backend real.
- Aplicação da decisão Q9 aos contratos e à implementação correspondente.
- Conciliação da Marcos-4 existente em casa.

CodeRabbit não foi executado por indisponibilidade do CLI/WSL no ambiente. Não foi atribuída aprovação dessa ferramenta.

Os testes com mocks não comprovam segurança Spring, persistência MySQL ou concorrência real.

## 11. Fluxo de trabalho a preservar no chat de casa

1. Conferir branch, alterações locais, story e contratos.
2. Definir um incremento com escopo verificável.
3. Implementar sem inventar endpoints ou requisitos.
4. Executar lint, typecheck, testes e build pertinentes.
5. Corrigir os defeitos encontrados.
6. Atualizar checklist, File List, documentação, RTM e evidências.
7. Marcos executa os testes e revisa visualmente no Chrome.
8. Fazer commit quando Marcos autorizar.
9. Enviar a branch e preparar o PR conforme a organização das dependências.
10. Manter revisão da equipe, CI e integração real separados do aceite local.

Não alterar Java, flags ou provedores apenas para permitir uma demonstração do frontend. Os incrementos de hoje mantiveram o produto em HTML/CSS/JavaScript nativos, sem framework novo ou novas dependências.

## 12. Ponto de retomada em casa

O trabalho de hoje está registrado até `f7360a2`, na branch `feature/marcos-movimentacoes`.

Antes de incorporar atualizações no computador de casa:

- Conferir e preservar as alterações locais da Marcos-4.
- Confirmar que os commits necessários foram enviados ao GitHub.
- Conferir o estado dos PRs e das branches.
- Usar a decisão Q9 deste relatório como contexto atualizado.
- Verificar quais contratos e endpoints já refletem essa decisão.

Não refazer a etapa 5 já commitada. Retomar as pendências de reservas/fila existentes em casa ou o próximo incremento que Marcos escolher, após conferir o estado real do repositório.