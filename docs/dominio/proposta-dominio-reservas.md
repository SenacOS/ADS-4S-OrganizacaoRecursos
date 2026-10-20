# Proposta de Dominio e Ciclo de Vida das Reservas

**Estado do documento: PROPOSTO**

**Decisoes de dominio: EM ANALISE**
**Escopo:** fase 1 (dominio). Este documento nao define arquitetura, banco de dados, contratos de API ou implementacao.

## 1. Base e limites

**Estado: EM ANALISE**

Esta proposta parte do contexto inicial em `docs/contexto-inicial-agentes.md`. Sao obrigatorios: Java 21 e Spring Boot 3.x; os perfis Solicitante, Responsavel e Administrador; a proibicao de sobreposicao para sala, material e professor; a protecao efetiva contra dupla reserva simultanea; o bloqueio de recursos em manutencao; e o registro auditavel de toda mudanca de estado. O fluxo principal informado e `SOLICITADA -> APROVADA -> EM_USO -> CONCLUIDA`, com `REJEITADA`, `CANCELADA` e `NAO_COMPARECEU` como estados alternativos.

A matriz oficial de transicoes nao existe ainda. As regras abaixo sao propostas para analise, nao requisitos novos nem decisoes aprovadas. Permanecem sem resolucao as ambiguidades da secao 7 do contexto inicial; as alternativas e recomendacoes relacionadas estao identificadas como tal.

## 2. Estado observado do repositorio

**Estado: EM ANALISE**

Na inspecao de 2026-10-20, o repositorio tinha o commit inicial e arquivos do workspace sem rastreamento. Em `docs/`, existia somente o contexto inicial. Nao foram encontrados codigo da aplicacao, testes, glossario, matriz de transicoes, especificacao refinada de requisitos, personas ou decisoes de arquitetura registradas. A documentacao da especificacao oficial e uma referencia fornecida pelo contexto; seu conteudo nao foi verificado independentemente nesta tarefa.

O preset `nextjs-react` indicado na configuracao AIOX conflita com a plataforma obrigatoria Java 21/Spring Boot 3.x. A configuracao deve ser reconciliada pela equipe antes de ser usada como orientacao de implementacao; este documento nao a altera.

## 3. Glossario proposto

| Termo | Definicao de trabalho | Estado / lacuna |
|---|---|---|
| Recurso | Item cuja disponibilidade e alocada por horario: sala, material/equipamento ou professor. | PROPOSTO; confirmar se professor e usuario, recurso ou ambos. |
| Reserva | Solicitacao de alocacao de um ou mais recursos para um intervalo. | PROPOSTO; a composicao da reserva esta EM ANALISE. |
| Solicitante | Perfil que consulta disponibilidade e cria, altera ou cancela reservas; pode ser professor ou coordenador. | O perfil e OBRIGATORIO; identidade e associacao com professor estao EM ANALISE. |
| Responsavel | Perfil que aprova solicitacoes especiais, valida alocacao de docentes e acompanha retirada/devolucao de materiais. | Perfil OBRIGATORIO; limites de cada acao estao EM ANALISE. |
| Administrador | Perfil que gerencia recursos, usuarios, bloqueios e manutencao. | Perfil OBRIGATORIO; poderes sobre reservas existentes estao EM ANALISE. |
| Recurso restrito | Recurso para o qual a especificacao exige aprovacao. | EM ANALISE: criterio e relacao com solicitacao especial nao definidos. |
| Solicitacao especial | Solicitacao que pode exigir analise/aprovacao. | EM ANALISE: significado e relacao com recurso restrito nao definidos. |
| Intervalo da reserva | Par de data/hora de inicio e fim; o fim deve ser posterior ao inicio. | Regra de ordem OBRIGATORIA; limites, fuso e adjacencia EM ANALISE. |
| Sobreposicao | Interseccao temporal entre alocacoes do mesmo recurso. | Proibicao OBRIGATORIA; semantica de limites do intervalo EM ANALISE. |
| Bloqueio de manutencao | Periodo em que um recurso nao pode receber novas reservas. | Proibicao de reservar durante manutencao OBRIGATORIA; colisao com reservas existentes EM ANALISE. |
| Evento de auditoria | Registro associado a criacao, transicao ou outra mudanca auditavel da reserva. | Registro em toda mudanca de estado OBRIGATORIO; conteudo e imutabilidade EM ANALISE. |

## 4. Maquina de estados proposta

**Estado: PROPOSTO; validacao necessaria pela equipe e pelo professor.**

Estados terminais sao tratados aqui como estados sem saida prevista, nao como regra aprovada. Transicoes ausentes da tabela ficam proibidas por esta proposta ate que uma regra seja validada. A proibicao obrigatoria de apagar reservas iniciadas e preservada; nao se propoe apagar registros em nenhum estado.

| Origem | Destino | Responsavel proposto | Pre-condicao proposta / pendencia | Registro de auditoria esperado |
|---|---|---|---|---|
| inexistente | `SOLICITADA` | Solicitante | Dados validos; intervalo com fim posterior ao inicio; recursos identificados e sem conflito ou manutencao. Reserva composta e validacao concorrente dependem das ambiguidades 1, 2 e 8. | Criacao, autor, instante, estado inicial e identificador da solicitacao. |
| `SOLICITADA` | `APROVADA` | Responsavel para recurso restrito; ator para recurso nao restrito EM ANALISE | Aprovacao exigida concluida. A politica para recurso nao restrito e a ambiguidade 4; o papel para outros casos depende da ambiguidade 3. | Estado anterior/novo, ator, instante e decisao/motivo. |
| `SOLICITADA` | `REJEITADA` | Responsavel, quando a aprovacao for aplicavel | Solicitacao analisada e rejeitada; motivo proposto como obrigatorio para rastreabilidade. Quem pode rejeitar e quando ainda requer validacao. | Estado anterior/novo, ator, instante e motivo. |
| `SOLICITADA` | `CANCELADA` | Solicitante, sujeito a validacao | Cancelamento antes da aprovacao; permissao e efeitos da cancelacao estao EM ANALISE (ambiguidade 6). | Estado anterior/novo, ator, instante e motivo, se informado. |
| `APROVADA` | `EM_USO` | Responsavel como candidato | Uso iniciado e reserva ainda valida. Acionamento manual ou temporal e tolerancia dependem da ambiguidade 5. | Estado anterior/novo, ator ou processo, instante e referencia a retirada quando aplicavel. |
| `APROVADA` | `CANCELADA` | Solicitante ou Responsavel, a confirmar | Cancelamento antes do inicio; permissoes e politica de aprovacao dependem da ambiguidade 6. | Estado anterior/novo, ator, instante e motivo. |
| `APROVADA` | `NAO_COMPARECEU` | Responsavel ou processo automatico, a confirmar | Reserva aprovada nao iniciada ate o limite/tolerancia que vier a ser definido. Disparo e tolerancia dependem da ambiguidade 5. | Estado anterior/novo, ator ou processo, instante e criterio aplicado. |
| `EM_USO` | `CONCLUIDA` | Responsavel como candidato | Uso encerrado; retirada/devolucao registrada quando aplicavel. Acionamento, criterios temporais e materiais dependem das ambiguidades 5 e 9. | Estado anterior/novo, ator, instante e registros de devolucao/condicao quando aplicaveis. |

**Transicoes nao propostas:** `REJEITADA`, `CANCELADA`, `NAO_COMPARECEU` e `CONCLUIDA` nao retornam a estados anteriores. Nao ha transicao de `EM_USO` para `CANCELADA`/`REJEITADA`, nem alteracao ou exclusao destrutiva de uma reserva iniciada. Essa politica conservadora preserva historico, mas precisa ser validada junto da regra de cancelamento e do tratamento de encerramentos excepcionais.

**Alteracao de dados:** a tabela nao estabelece uma transicao de estado para edicao. Alteracoes em reserva aprovada podem exigir nova aprovacao ou permanecer aprovadas conforme a natureza da mudanca; a ambiguidade 6 precisa definir isso antes da implementacao. Toda mudanca de estado deve gerar auditoria (OBRIGATORIO). O conjunto minimo de campos de auditoria segue EM ANALISE (ambiguidade 13).

## 5. Ambiguidades relacionadas: alternativas e recomendacoes

Todas as recomendacoes abaixo estao **PROPOSTAS**, nao aprovadas. A equipe deve obter esclarecimento do professor quando a especificacao for ambigua.

### 5.1 Professor como usuario e recurso (ambiguidade 1)

**Estado: EM ANALISE.**

- **Alternativa A:** uma unica entidade representa pessoa/usuario e professor-recurso. Simplifica associacoes, mas acopla credenciais/permissoes ao cadastro academico e exige tratar professores sem acesso ao sistema.
- **Alternativa B:** identidade de acesso separada do cadastro de professor, com vinculacao explicita. Aumenta modelagem e manutencao, mas permite que coordenadores sejam solicitantes e que nem todo professor seja usuario.
- **Recomendacao PROPOSTA:** manter os conceitos distintos no glossario e validar se existe vinculacao; nao assumir identidade unica. Confirmar tambem se toda reserva de sala exige professor associado.

### 5.2 Reserva composta e atomicidade (ambiguidade 2)

**Estado: EM ANALISE.**

- **Alternativa A:** uma reserva contem sala, professor e materiais como alocacao conjunta. Representa a aula de forma direta; exige que validacao e aceitacao sejam atomicas para todos os recursos, aumentando a complexidade de concorrencia.
- **Alternativa B:** reservas independentes por recurso ligadas a um agrupador. Simplifica casos isolados, mas pode deixar alocacoes parciais se uma parte falhar e complica cancelamento e auditoria conjunta.
- **Recomendacao PROPOSTA:** se o professor confirmar a composicao, tratar a aceitacao como tudo-ou-nada para evitar uma aula parcialmente reservada; sem essa confirmacao, nao escolher o modelo.

### 5.3 Recurso restrito, solicitacao especial e validacao docente (ambiguidade 3)

**Estado: EM ANALISE.**

- **Alternativa A:** restricao e atributo do recurso; pedido especial e motivo/condicao da solicitacao. Permite que conceitos coexistam, mas requer definir a regra que aciona aprovacao.
- **Alternativa B:** ambos nomeiam a mesma situacao de aprovacao. Menos conceitos, mas pode confundir a propriedade permanente do recurso com a excepcionalidade de um pedido.
- **Recomendacao PROPOSTA:** manter os termos separados ate obter definicoes; perguntar se “validar alocacao de docentes” e aprovacao, verificacao de competencia ou outra atividade. Nao inferir a regra.

### 5.4 Aprovacao de recursos nao restritos (ambiguidade 4)

**Estado: EM ANALISE.**

- **Alternativa A:** toda reserva passa por `SOLICITADA` e aprovacao. Padroniza o fluxo, mas adiciona espera e trabalho para pedidos sem restricao.
- **Alternativa B:** somente recursos restritos exigem aprovacao; os demais seguem diretamente para `APROVADA` apos validacoes. Reduz etapas, mas cria dois caminhos de criacao que precisam de testes e auditoria distintos.
- **Recomendacao PROPOSTA:** avaliar a alternativa B por corresponder ao escopo explicito de aprovacao obrigatoria para restritos; confirmar se aprovacao universal e desejada antes de fechar a transicao.

### 5.5 Inicio, conclusao e nao comparecimento (ambiguidade 5)

**Estado: EM ANALISE.**

- **Alternativa A:** acao manual de perfil autorizado. Explicita evidencia e facilita responsabilizacao, mas depende de operacao humana e pode atrasar.
- **Alternativa B:** transicoes automaticas por horario/tolerancia. Reduz operacao manual, mas requer regras temporais, fuso, tratamento de indisponibilidade e testes de fronteira.
- **Recomendacao PROPOSTA:** iniciar com transicoes explicitas por ator, caso o professor permita; qualquer automacao depende de criterio temporal aprovado. Definir separadamente quem pode concluir e marcar ausencia.

### 5.6 Edicao, cancelamento e reservas concluidas (ambiguidade 6)

**Estado: EM ANALISE.**

- **Edicao apos aprovacao:** reiniciar aprovacao (mais controle, mais friccao) ou manter aprovacao (mais simples, risco de alterar recurso/horario sem revisao). **Recomendacao PROPOSTA:** mudanca que afete recurso ou intervalo deve voltar a analise; definir quais campos contam como materiais. Nao e uma regra aprovada.
- **Cancelamento:** permitir ao Solicitante antes do inicio, exigir Responsavel apos aprovacao, ou delegar a Administrador. Restringir papeis melhora controle, mas pode bloquear correcao operacional. **Recomendacao PROPOSTA:** registrar ator e motivo e nao apagar o historico; definir papeis e prazo com o professor.
- **Concluidas:** impedir qualquer mudanca de estado ou permitir correcao auditada. Imutabilidade favorece confiabilidade; correcao auditada permite corrigir erro operacional. **Recomendacao PROPOSTA:** nunca apagar; permitir correcao somente como evento rastreavel se a equipe/professor exigir.

### 5.7 Manutencao com reservas existentes (ambiguidade 7)

**Estado: EM ANALISE.**

- **Alternativa A:** recusar o bloqueio de manutencao enquanto houver reservas conflitantes. Evita cancelamento implicito, mas pode impedir registrar uma manutencao urgente.
- **Alternativa B:** aceitar bloqueio e cancelar reservas conflitantes. Atende rapidamente a indisponibilidade, mas altera compromissos e exige notificacao e autorizacao de cancelamento.
- **Alternativa C:** aceitar bloqueio e preservar reservas ja confirmadas (grandfathering). Evita mudanca retroativa, mas pode permitir uso durante manutencao, contrariando a proibicao de reservar recurso em manutencao.
- **Recomendacao PROPOSTA:** nao ativar bloqueio que conflite com reserva sem decisao explicita sobre as reservas afetadas; a alternativa A e mais previsivel, mas manutencao urgente precisa de fluxo de excecao validado.

### 5.8 Intervalos e politica temporal (ambiguidade 8)

**Estado: EM ANALISE.**

- **Adjacencia:** intervalos semiabertos `[inicio, fim)` permitem reserva seguinte iniciar exatamente no fim; intervalos fechados consideram esse limite conflitante. Recomenda-se avaliar `[inicio, fim)` por evitar conflito artificial, mas depende de confirmacao.
- **Granularidade/duracao/antecedencia:** limites fixos simplificam validacao e planejamento, mas podem excluir necessidades legitimas; valores livres aumentam combinacoes de teste e risco de uso inconsistente. Definir com a equipe/professor conforme uso real.
- **Fuso e recorrencia:** horario local explicito e sem recorrencia reduz complexidade; multiplos fusos ou recorrencia exigem regras de conversao, excecoes e expansao de conflitos. Nao assumir recorrencia nem fuso implicito.
- **Recomendacao PROPOSTA:** confirmar primeiro a regra de adjacencia, o fuso, a granularidade e se recorrencia esta no escopo. A regra obrigatoria ja conhecida e `fim > inicio`.

### 5.9 Materiais, quantidade e retirada/devolucao (ambiguidade 9)

**Estado: EM ANALISE.**

- **Alternativa A:** cada item/equipamento e recurso individual. Facilita rastrear retirada e conflito do mesmo item, mas exige cadastro de unidades.
- **Alternativa B:** material por quantidade/estoque. Representa lotes, mas conflito passa a depender de saldo ao longo do tempo, nao apenas de sobreposicao do mesmo recurso.
- **Recomendacao PROPOSTA:** comecar pelo significado que o professor definir; nao presumir estoque. Relacionar retirada/devolucao a `EM_USO` e tratar atraso apenas apos esclarecer se ha prazo e consequencia.

### 5.10 Competencia do professor (ambiguidade 10)

**Estado: EM ANALISE.**

- **Alternativa A:** texto livre. Cadastro simples, mas busca inconsistente e dificil de validar.
- **Alternativa B:** catalogo controlado de competencias. Melhora pesquisa e consistencia, mas exige governanca do catalogo.
- **Alternativa C:** vinculo com disciplina/unidade curricular. Permite validar alocacao contextual, mas requer cadastro e regras academicas adicionais.
- **Recomendacao PROPOSTA:** catalogo controlado e alternativa intermediaria a avaliar; so usar vinculo a disciplina se a validacao docente exigir esse contexto. Nao criar catalogo sem aprovacao.

### 5.11 Notificacao e WireMock (ambiguidade 11)

**Estado: EM ANALISE.**

- **Alternativa A:** notificacao simulada internamente. Evita dependencia externa; WireMock nao valida uma integracao que nao existe.
- **Alternativa B:** integracao real com API externa. Exige configuracao, tratamento de falhas e testes de contrato; WireMock atende ao requisito de testar a dependencia externa em ambiente controlado.
- **Recomendacao PROPOSTA:** confirmar o nivel esperado para RF11. Usar WireMock se houver integracao externa; nao incluir ferramenta sem alvo de integracao.

### 5.12 Medicao de conflitos evitados (ambiguidade 12)

**Estado: EM ANALISE.**

- **Alternativa A:** registrar tentativas rejeitadas por conflito como eventos de dominio. Permite relatorio direto e evidencia, mas aumenta volume, requer definir dados retidos e pode expor informacao da agenda.
- **Alternativa B:** derivar conflitos de logs/telemetria ou consultas. Reduz dados de dominio, mas pode perder eventos, dificultar reproducao e enfraquecer rastreabilidade.
- **Recomendacao PROPOSTA:** definir com a equipe se RF12 exige contagem auditavel; se sim, registrar evento minimo sem dados pessoais desnecessarios e documentar retencao/acesso.

### 5.13 Conteudo e imutabilidade da auditoria (ambiguidade 13)

**Estado: EM ANALISE.**

- **Alternativa A:** historico de eventos append-only, sem edicao/exclusao comum. Facilita rastreabilidade, mas exige fluxo para retificacao e protecao de acesso.
- **Alternativa B:** guardar estado atual e historico mutavel/snapshot. Pode ser mais simples de consultar, mas alteracoes podem apagar evidencia anterior.
- **Recomendacao PROPOSTA:** considerar eventos append-only contendo, no minimo, referencia a reserva, acao/estados, ator e instante; incluir motivo quando aplicavel. Campos, imutabilidade tecnica, retencao e privacidade continuam sem decisao.

### 5.14 Escopo de testes end-to-end (ambiguidade 14)

**Estado: EM ANALISE.**

- **Alternativa A:** E2E pela API. Mais rapido e adequado para validar o fluxo do backend; nao cobre interface responsiva nem interacao de navegador.
- **Alternativa B:** E2E pelo navegador. Cobre o percurso da interface ate a aplicacao, mas aumenta custo e sensibilidade a ambiente.
- **Recomendacao PROPOSTA:** alinhar a definicao com a avaliacao do professor; API E2E nao deve ser apresentada como evidencia de responsividade. Se RF13 for avaliado visualmente, prever teste de navegador para o fluxo essencial.

### 5.15 Requisitos criticos da RTM (ambiguidade 15)

**Estado: EM ANALISE.**

- **Alternativa A:** classificar como criticos apenas os limitadores de nota ja explicitados: aplicacao executavel, CI, autorizacao e dupla reserva. Facilita rastrear o risco imediato, mas pode omitir ciclo de vida/auditoria.
- **Alternativa B:** incluir tambem regras de negocio de alto risco, como manutencao, sobreposicao docente e auditoria. Amplia cobertura critica e esforco de evidencia.
- **Recomendacao PROPOSTA:** usar os quatro limitadores como conjunto minimo e discutir a inclusao de RF05, RF07, RF08 e RF10 conforme a analise de risco. A classificacao final e da equipe.

### 5.16 Revisao por pares (ambiguidade 16)

**Estado: EM ANALISE.**

- **Alternativa A:** uma aprovacao de integrante diferente do autor. Menor custo e adequada a equipe de quatro pessoas, mas oferece uma unica perspectiva.
- **Alternativa B:** duas aprovacoes. Mais revisao independente, mas aumenta espera e pode ser dificil de manter em entregas pequenas.
- **Recomendacao PROPOSTA:** uma revisao independente como baseline e duas para mudancas que afetem concorrencia, autorizacao ou integridade de dados, se a equipe considerar viavel. Quantidade e politica dependem da equipe/professor.

## 6. Riscos e dependencias

**Estado: PROPOSTO**

- **R1 / R6:** sem definicao de reserva composta, intervalo e transicoes, nao e possivel especificar teste deterministico de concorrencia nem provar atomicidade do fluxo.
- **R2:** papeis definidos nao bastam para autorizar cada transicao; e necessario aprovar a matriz de ator/acao e cenarios negativos.
- **R5:** manter transicoes indefinidas causa comportamentos contraditorios em edicao, manutencao e encerramento.
- **R8:** decidir o minimo de auditoria e eventos de conflito antes de produzir relatorios evita reconstruir rastreabilidade ao final.
- **R9:** manter recomendacoes separadas de decisoes ajuda a equipe a defender as escolhas e evita que um rascunho seja confundido com regra oficial.

## 7. Decisoes que a equipe precisa tomar

**Estado: PENDENTE**

1. Confirmar ou corrigir este glossario e a matriz de transicoes com a equipe/professor.
2. Definir se professor e usuario, recurso, ou conceitos separados vinculados; e se toda reserva de sala requer professor.
3. Definir se reservas agrupam multiplos recursos e se a aceitacao deve ser integral ou permitir alocacao parcial.
4. Definir formalmente recurso restrito, solicitacao especial e validacao da alocacao docente.
5. Definir o caminho de aprovacao de recursos restritos e nao restritos, incluindo ator para aprovacao e rejeicao.
6. Definir quem inicia, conclui e marca nao comparecimento; modo manual/automatico, tolerancia e criterios temporais.
7. Definir edicao apos aprovacao, cancelamento por perfil/estado, tratamento de concluida e campos que reiniciam aprovacao.
8. Definir politica para manutencao que colide com reservas existentes, inclusive urgencias e notificacoes.
9. Definir semantica de adjacencia, granularidade, duracao, antecedencia, fuso horario e recorrencia.
10. Definir se materiais sao unidades ou quantidades, como retirada/devolucao se relacionam a `EM_USO` e como tratar atraso.
11. Definir representacao de competencias docentes.
12. Definir notificacao simulada ou integracao externa e, portanto, o papel de WireMock.
13. Definir como medir conflitos evitados e o conteudo, imutabilidade, acesso e retencao da auditoria.
14. Definir se E2E exige navegador ou se API E2E atende a avaliacao, sem substituir a validacao da interface.
15. Aprovar quais requisitos sao criticos para RTM e a quantidade/regra de aprovacoes por pull request.
16. Resolver o desalinhamento entre preset AIOX `nextjs-react` e plataforma obrigatoria Java 21/Spring Boot 3.x antes da implementacao.

**Proxima etapa:** aguardar a aprovacao da equipe e os esclarecimentos necessarios. A fase 2 (requisitos e RTM) nao foi iniciada por este documento.