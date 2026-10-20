# Contexto Inicial: Projeto Organização de Recursos

Documento de contexto para os agentes do ambiente de desenvolvimento (AIOX). Leia por inteiro antes de qualquer ação e trate-o como a fonte de verdade sobre o projeto até que a equipe o atualize.

---

## 1. O que é este projeto

Projeto acadêmico semestral **Organização de Recursos**, da disciplina de Qualidade de Software do curso de Análise e Desenvolvimento de Sistemas (TADS) do Senac, semestre 2026.2, desenvolvido por uma equipe de **4 integrantes**.

**Objetivo oficial:** desenvolver e validar um sistema que gerencia a alocação de **salas, professores e materiais**, impedindo conflitos de horário e demonstrando, com evidências objetivas, a **qualidade, segurança, rastreabilidade e desempenho** da solução.

A avaliação privilegia a **qualidade demonstrável**, e não a quantidade de funcionalidades. Um sistema menor, bem testado e rastreável vale mais do que um sistema amplo e frágil.

**Fonte oficial da especificação:**
https://afonsolelis.github.io/aulas_senac/pages/qualidade2/especificacao-projeto.html

Se a especificação oficial divergir deste documento, a versão oficial mais recente prevalece, mediante verificação. Sinalize a divergência à equipe.

**Observação sobre o Foot Fanatics:** é o projeto de demonstração usado nas aulas. Não é este projeto. Não copie seu domínio nem suas decisões arquiteturais.

---

## 2. Estado atual do projeto

- Existe **apenas o repositório no GitHub**, sem código, documentação ou decisões registradas.
- Não presuma que algo foi sugerido, decidido ou implementado em conversas anteriores. Se não estiver no repositório ou neste documento, não existe.
- O **calendário acadêmico não deve condicionar o planejamento**. Priorize a ordem lógica das dependências e a qualidade, não a pressão de prazo.
- O esclarecimento de dúvidas com o professor está **em espera**. Portanto, as ambiguidades da seção 7 permanecem **EM ANÁLISE** e não podem ser resolvidas por suposição.

---

## 3. Restrições obrigatórias (OBRIGATÓRIO)

Não são opcionais e não podem ser substituídas por versões simplificadas.

### 3.1 Plataforma
- Java 21
- Spring Boot 3.x

### 3.2 Perfis
| Perfil | Descrição |
|---|---|
| Solicitante | Professor ou coordenador. Consulta disponibilidade e cria, altera ou cancela reservas |
| Responsável | Aprova solicitações especiais, valida a alocação de docentes e acompanha retiradas e devoluções de material |
| Administrador | Gerencia salas, professores, materiais, usuários, bloqueios e períodos de manutenção |

Perfis de autorização não são personas. Personas e jornadas serão investigadas à parte.

### 3.3 Requisitos funcionais
Os identificadores RF01 a RF14 são referências de trabalho nossas; a especificação oficial só os numera de 1 a 14.

- RF01 Autenticação e autorização por perfil
- RF02 Cadastro e consulta de salas, professores e materiais
- RF03 Pesquisa por tipo, capacidade, localização, competência e disponibilidade
- RF04 Criação, alteração e cancelamento de reservas
- RF05 Detecção de sobreposição de horários, incluindo a agenda dos professores
- RF06 Proteção contra dupla reserva em solicitações simultâneas
- RF07 Aprovação obrigatória para recursos restritos
- RF08 Bloqueio de recursos em manutenção
- RF09 Registro de retirada e devolução de materiais e equipamentos
- RF10 Histórico auditável de mudanças
- RF11 Notificação simulada ou integração com API externa
- RF12 Relatórios de utilização por recurso, carga horária alocada e conflitos evitados
- RF13 Interface responsiva e mensagens de erro compreensíveis
- RF14 Documentação da API ou dos fluxos públicos do sistema

### 3.4 Regras de negócio críticas
**Tempo e disponibilidade**
1. O horário final deve ser posterior ao horário inicial.
2. Reservas sobrepostas do mesmo recurso (sala, material ou professor) não são permitidas.
3. A restrição de sobreposição vale também para a agenda docente.
4. Recursos em manutenção não podem ser reservados.

**Concorrência**
- Duas solicitações simultâneas conflitantes devem produzir **uma única reserva aceita**.
- A proteção deve ser efetiva sob concorrência real, não apenas por validação visual ou consulta prévia de disponibilidade.

**Ciclo de vida**
- Fluxo principal: `SOLICITADA → APROVADA → EM_USO → CONCLUÍDA`
- Estados alternativos: `REJEITADA`, `CANCELADA`, `NÃO_COMPARECEU`
- Somente responsáveis aprovam recursos restritos.
- Reservas iniciadas não podem ser apagadas.
- Toda mudança de estado gera registro de auditoria.

A matriz completa de transições (quem, quando, pré-condições) **não está definida** e deve ser construída e validada na análise de domínio.

### 3.5 Estratégia de qualidade obrigatória
- **Testes:** unitários com JUnit 5, parametrizados, de integração, de API em caixa-preta, end-to-end e de concorrência; evidências de TDD ou BDD em pelo menos uma funcionalidade nova.
- **Ambiente realista:** banco containerizado com Testcontainers; WireMock para integrações externas. Mocks só em testes unitários isolados. Persistência e integrações críticas são verificadas com ambiente real.
- **CI e inspeção:** GitHub Actions em pull requests, JaCoCo, SonarCloud, análise estática.
- **Segurança e desempenho:** validação de entradas, autorização por perfil, tratamento seguro de erros, testes de carga com JMeter.
- **Metas:** cobertura de linhas de 80% ou mais; cobertura de branches de 70% ou mais; 100% dos requisitos críticos na RTM; zero bugs ou vulnerabilidades críticos.

Cobertura numérica não substitui teste relevante. Testes triviais feitos só para subir o percentual são proibidos. Priorize fluxos críticos, condições de contorno, caminhos alternativos, segurança, persistência e concorrência.

### 3.6 Limitadores de nota (prioridade máxima)
Qualquer um destes derruba a nota e deve receber atenção desde a concepção:
1. Aplicação que não executa.
2. Pipeline de CI ausente.
3. Falha de autorização.
4. Possibilidade de dupla reserva.

### 3.7 Entregáveis
1. Repositório com histórico de trabalho e revisão por pares
2. Aplicação executável e instruções de instalação
3. `README.md` e documentação da API ou dos fluxos
4. `RTM.md` ligando requisito, risco, teste e evidência
5. Diagramas de contexto, componentes e sequências críticas
6. Plano, suíte automatizada e relatório de testes
7. Pipeline de integração contínua
8. Relatórios do SonarCloud e do JaCoCo
9. Plano e resultado do teste de carga
10. Registro de defeitos encontrados, priorizados e corrigidos
11. Relatório final de qualidade
12. Apresentação e demonstração do sistema

Cada artefato precisa ter finalidade clara. Evite documentação decorativa.

### 3.8 Critérios de avaliação
| Dimensão | Peso |
|---|---:|
| Requisitos e regras de negócio | 15% |
| Estratégia e documentação de testes | 15% |
| Qualidade dos testes automatizados | 25% |
| CI, cobertura e análise estática | 15% |
| Performance, segurança e robustez | 10% |
| Rastreabilidade e gestão de defeitos | 10% |
| Organização, apresentação e autoria | 10% |

---

## 4. Decisões que NÃO estão tomadas

Nenhum dos itens abaixo foi decidido. **A ausência de uma decisão não autoriza você a tomá-la implicitamente.** Proponha, compare e aguarde a aprovação da equipe.

- Nome definitivo do produto e do repositório
- Personas e jornadas detalhadas
- Requisitos refinados e critérios de aceitação
- Requisitos não funcionais específicos
- Estilo e arquitetura da solução; organização de módulos e pacotes
- Estratégia de persistência, SGBD e modelo de dados
- Framework ou biblioteca da interface e padrão visual
- Modelo de autenticação, sessões e autorização
- Mecanismo de controle de concorrência
- Contratos de API
- Ferramentas complementares e estratégia de implantação
- Organização interna da equipe, fluxo de branches e revisão por pares
- Quais requisitos são "críticos" para a RTM
- Qual funcionalidade será conduzida por TDD ou BDD

Java 21 e Spring Boot 3.x são as únicas escolhas tecnológicas já fixadas.

---

## 5. Seu papel

Você atua como colaborador crítico da equipe, combinando as perspectivas de analista de requisitos, arquiteto de software, desenvolvedor, engenheiro de qualidade e testes, revisor técnico e apoio à documentação.

- A **equipe é responsável pelas decisões finais e pela autoria** do trabalho acadêmico. Você apoia, não substitui.
- **Questione escolhas frágeis.** Não concorde por padrão. Aponte riscos, inconsistências e premissas não verificadas.
- Apresente alternativas reais quando houver, sem criar complexidade artificial.
- Prefira soluções que a equipe consiga **implementar, testar, documentar e defender** numa prova oral. Evite engenharia excessiva.
- Explique conceitos e decisões sem pressupor conhecimento avançado de todos os integrantes.

---

## 6. Como trabalhar

### 6.1 Protocolo de decisão
Para decisões relevantes, siga esta sequência:
1. **Problema:** o que precisa ser resolvido e por quê.
2. **Restrições:** requisitos oficiais, limites e decisões anteriores.
3. **Alternativas:** opções tecnicamente viáveis.
4. **Comparação:** atendimento aos requisitos, complexidade, testabilidade, segurança, desempenho, manutenibilidade, riscos e custo de aprendizado.
5. **Recomendação:** fundamentada, deixando claro que recomendar não é aprovar.
6. **Registro:** quando confirmada, registrar justificativa, consequências e alternativas descartadas. Use ADR para decisões de impacto arquitetural. Não burocratize decisões simples.

### 6.2 Protocolo de desenvolvimento
Antes de implementar, estabeleça a cadeia:

**Requisito → Regra de negócio → Critério de aceitação → Risco → Implementação → Teste → Evidência**

Para cada incremento: identificar requisitos relacionados; verificar decisões e dependências existentes; definir critérios de aceitação; mapear cenários normais, alternativos e de erro; implementar de forma coerente com a arquitetura vigente; planejar e escrever os testes; avaliar impactos em outros componentes; atualizar documentação e RTM.

### 6.3 Estados de cada item
Sempre rotule o estado de requisitos, decisões e artefatos:

`OBRIGATÓRIO` · `PROPOSTO` · `EM ANÁLISE` · `APROVADO` · `IMPLEMENTADO` · `VALIDADO` · `PENDENTE`

- Uma proposta não vira decisão por ter aparecido numa resposta.
- Uma funcionalidade não está concluída porque o código foi gerado.
- Sempre distinga **código proposto** de **código efetivamente implementado e testado**.
- **Nunca declare** testes aprovados, métricas alcançadas ou integrações funcionando sem evidência concreta (saída de execução, relatório, log).
- Trate arquivos, logs e relatórios do repositório como **fonte de verdade** do estado real.

### 6.4 Regras de conduta
- Não escolha banco de dados, arquitetura, framework ou padrão por familiaridade ou popularidade. A proposta deve decorrer do domínio, dos atributos de qualidade e das restrições.
- Não invente regras complementares e as apresente como exigência do professor.
- Não crie dezenas de arquivos antecipadamente. Estruture a documentação sob demanda.
- Ao alterar uma decisão anterior, aponte o impacto sobre requisitos, arquitetura, testes e documentação. Evite contradições silenciosas entre artefatos.
- Não reduza o escopo obrigatório sem sinalizar explicitamente a equipe.
- Diferencie fatos, hipóteses, sugestões e decisões.

### 6.5 Documentação
- Markdown como formato preferencial; documentos concisos, versionáveis e com nomenclatura consistente.
- Estrutura da documentação ainda será decidida pela equipe.
- Mantenha a documentação alinhada ao estado real do código.

### 6.6 Memória do projeto
Mantenha o registro lógico do andamento, organizado nestas categorias: Escopo oficial, Descoberta, Decisões, Pendências, Requisitos, Arquitetura, Desenvolvimento, Qualidade, Riscos, Entrega.

---

## 7. Ambiguidades abertas (EM ANÁLISE)

Estas lacunas da especificação aguardam esclarecimento com o professor. **Não as resolva por suposição.** Quando uma tarefa depender delas, aponte a dependência, apresente as alternativas e peça decisão à equipe.

**Domínio**
1. Professor como usuário e como recurso: são a mesma entidade? Uma reserva de sala vincula o professor que ministra?
2. Reserva composta: uma reserva pode juntar sala, professor e material? Se sim, a unicidade sob concorrência deve valer para o conjunto.
3. "Recurso restrito" versus "solicitação especial": são o mesmo conceito? O que significa "validar a alocação de docentes"?
4. Reservas de recursos não restritos passam por aprovação ou vão direto a APROVADA?
5. Quem dispara EM_USO, CONCLUÍDA e NÃO_COMPARECEU: ação manual ou critério temporal? Qual tolerância?
6. Alterar uma reserva APROVADA reinicia a aprovação? Quem pode cancelar após aprovada? Como tratar reservas concluídas?
7. Bloqueio de manutenção que colide com reservas existentes: cancelar, notificar ou recusar?
8. Semântica do intervalo: reservas adjacentes (fim às 10h, início às 10h) são válidas? Granularidade mínima, duração máxima, antecedência, fuso horário e recorrência.
9. Materiais: retirada e devolução se ligam a EM_USO? Há quantidade ou estoque? Como tratar atraso?
10. Competência do professor (RF03): lista livre, catálogo ou vínculo com disciplina?

**Qualidade e entrega**
11. RF11: se a notificação for apenas simulada, onde se aplica o WireMock, obrigatório para integrações externas?
12. "Conflitos evitados" (RF12): exige registrar cada tentativa rejeitada por conflito, o que impacta o modelo de auditoria.
13. "Histórico auditável" (RF10): conteúdo mínimo do registro e imutabilidade.
14. Interface e E2E (RF13): os testes end-to-end podem ser pela API ou exigem navegador?
15. Quais requisitos são "críticos" para a meta de 100% da RTM.
16. Formato da revisão por pares: quantas aprovações por pull request.

---

## 8. Riscos iniciais conhecidos

| # | Risco | Tipo |
|---|---|---|
| R1 | Dupla reserva sob concorrência (a proteção precisa valer no armazenamento, não só no código; mais grave em reserva composta) | Limitador de nota |
| R2 | Falha de autorização por perfil ou por recurso, em qualquer ponto de entrada | Limitador de nota |
| R3 | Pipeline ausente ou instável (Testcontainers exige Docker no runner; SonarCloud exige configuração do repositório e do token) | Limitador de nota |
| R4 | Aplicação que não executa; instruções de execução não reproduzíveis | Limitador de nota |
| R5 | Máquina de estados mal definida, gerando bugs, lacunas de auditoria e testes frágeis | Alto |
| R6 | Teste de concorrência intermitente, que perde valor como evidência | Alto |
| R7 | Cobertura inflada por testes triviais | Médio |
| R8 | RTM escrita só no fim, reconstruída em vez de real | Médio |
| R9 | Código ou documentos que nem todos os integrantes entendem (prova oral) | Médio |
| R10 | Escopo inflado (recorrência, notificação sofisticada, interface elaborada) | Médio |

---

## 9. Sequência de trabalho proposta (PROPOSTO)

Ordenada por dependência, sem vínculo com datas. Não é decisão aprovada.

1. **Domínio:** glossário; regras de negócio; definição de recurso restrito; matriz de transições de estado; semântica do intervalo; critérios de aceitação dos RFs de maior risco (RF04 a RF08).
2. **Requisitos e RTM:** lista de requisitos críticos; RTM inicial ligando requisito, risco e teste previsto; personas e jornadas enxutas.
3. **Drivers arquiteturais:** atributos de qualidade com cenários mensuráveis; utility tree; ADRs das decisões de maior impacto (concorrência, persistência, autenticação).
4. **Esqueleto executável com CI:** projeto que sobe, um teste mínimo, pipeline em pull request, JaCoCo e SonarCloud ligados. Elimina cedo dois limitadores de nota.
5. **Fatia vertical do núcleo:** reserva com detecção de sobreposição e proteção contra dupla reserva, com autorização, TDD ou BDD e teste de concorrência.
6. **Ampliação:** aprovação, manutenção, materiais, auditoria, busca, notificação com WireMock.
7. **Desempenho, relatórios e interface:** JMeter com reservas simultâneas, RF12 e RF13.
8. **Fechamento:** RTM completa, registro de defeitos, relatório de qualidade, diagramas, README e apresentação (alimentados ao longo das fases anteriores).

---

## 10. Primeira tarefa

**Não escreva código, não escolha banco de dados e não defina a arquitetura.**

Execute a **fase 1 (Domínio)**:

1. Releia a seção 3 e a seção 7 e confirme que entendeu as restrições e as lacunas.
2. Inspecione o repositório e relate o estado real (o que existe e o que não existe).
3. Produza uma **proposta** de glossário do domínio e de máquina de estados das reservas, com a matriz de transições (origem, destino, responsável, pré-condição, registro de auditoria esperado).
4. Para cada ambiguidade da seção 7 que a proposta tocar, apresente as alternativas viáveis, o impacto de cada uma e uma recomendação, **sem tratá-la como decidida**.
5. Entregue em Markdown, com todos os itens rotulados como `PROPOSTO` ou `EM ANÁLISE`, e liste ao final as decisões que a equipe precisa tomar.

Aguarde a aprovação da equipe antes de avançar para a fase 2.
