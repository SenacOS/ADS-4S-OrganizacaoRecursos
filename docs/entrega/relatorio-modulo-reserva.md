# Relatório do módulo `reserva/` — material de estudo e manutenção

**Estado: PROPOSTO** · Autor: Gabriel Silva Gomes · Versão alinhada ao *Guia Técnico Definitivo* (05/11/2026)

Este relatório explica o que foi construído no módulo de reservas, como testá-lo, como ele se encaixa no restante do sistema e como mantê-lo. Serve para estudo da equipe, para a apresentação e para a prova oral.

> **Honestidade sobre evidências.** Os testes deste módulo foram executados localmente com um executor mínimo, no lugar do JUnit, porque o Maven Central estava inacessível no ambiente de desenvolvimento. O resultado oficial vem de `mvn verify` e do CI. Os testes de concorrência usam locks **em memória**, que validam o algoritmo; a prova do InnoDB depende do teste com MySQL em Testcontainers (ver seção 5).

---

## 1. Resumo do projeto em 10 linhas

- Sistema acadêmico (Senac ADS 2026.2) para **reservar salas, professores e materiais** sem conflito de horário.
- Java 21, Spring Boot 3.x, **monólito modular**, MySQL/InnoDB, frontend HTML/CSS/JS puro servido pelo Spring (ADR-001, ADR-002).
- Três perfis: Solicitante, Responsável (aprova recursos restritos) e Administrador (cadastros e manutenção).
- Pontos que derrubam a nota: aplicação que não executa, CI ausente, falha de autorização e **dupla reserva**.
- Reserva comum nasce SOLICITADA e é autoaprovada; reserva com recurso restrito fica SOLICITADA e **já bloqueia a agenda** até o Responsável decidir (ADR-005).
- Intervalo semiaberto `[inicio, fim)`: 10h–11h e 11h–12h não conflitam.
- A proteção contra dupla reserva é um **lock pessimista** em `recursos` (`FOR UPDATE`, IDs em ordem crescente, READ COMMITTED) (ADR-003).
- Sessão HttpOnly + CSRF, sem JWT (ADR-004). Datas em UTC no banco, exibidas em `America/Sao_Paulo` (ADR-006).
- Avaliação: 25% testes automatizados, 15% CI/cobertura, metas 80% linhas e 70% branches, RTM 100% crítica.
- Quatro responsáveis principais; todos testam e revisam (D10).

## 2. O que foi construído (módulo de Silva)

Pacote base: `backend/src/main/java/br/senac/recursos/reserva/`

### 2.1 Domínio (`dominio/`) — Java puro, sem Spring nem banco

| Classe | Papel |
|---|---|
| `IntervaloReserva` | Record `[inicio, fim)`; recusa fim ≤ início; `sobrepoe()` implementa `inicio < outro.fim && fim > outro.inicio` |
| `StatusReserva` | Os 7 estados e a matriz de transições; `ocupaAgenda()` (SOLICITADA, APROVADA, EM_USO); `terminal()` |
| `Reserva` | Registro **imutável**; cada operação devolve uma nova reserva. Verifica permissão antes do estado |
| `AtorReserva` / `PapelAtor` | Quem executa e com qual perfil (vem do contexto autenticado) |
| `DetectorConflitos` | Regra única de conflito para criar, editar e consultar disponibilidade |
| `Ocupacao` / `OrigemOcupacao` | O que ocupa um recurso: RESERVA, MANUTENCAO ou RETIRADA_ABERTA (até `Instant.MAX`) |
| `Expediente` / `JanelaFuncionamento` | Funcionamento por dia da semana no fuso local; reserva deve caber inteira em uma janela do mesmo dia |
| Exceções | `IntervaloInvalida`, `TransicaoInvalida`, `OperacaoNaoPermitida` (403), `ConflitoDisponibilidade` (409), `RecursoIndisponivel`, `RecursoNaoEncontrado`, `ReservaNaoEncontrada`, `ForaDoExpediente` |

**Por que imutável?** Facilita testar (a reserva antiga continua disponível para comparar) e permite auditar "antes" e "depois" sem cópias manuais.

### 2.2 Aplicação (`aplicacao/`)

`ReservaService` orquestra os casos de uso: `criar`, `editar`, `aprovar`, `rejeitar`, `cancelar`, `iniciarUso`, `concluir` e `registrarNaoComparecimento`. Ele fala com o mundo exterior **somente por portas**:

| Porta | Quem implementa | Função |
|---|---|---|
| `RecursosPort` | Fausto | `SELECT ... FOR UPDATE` nos recursos, em ordem |
| `ReservaRepositorio` | Fausto/Silva | Persistência JPA |
| `OcupacoesPort` | Fausto | Lê reservas ativas, manutenção e retiradas abertas |
| `ExpedientePort` | Fausto | Funcionamento configurado |
| `AuditoriaPort` | Débora | Registro auditável na mesma transação |
| `NotificacaoPort` | Débora | Evento pendente (envio fora do commit) |
| `ConflitosEvitadosPort` | Fausto/Débora | Conta tentativas barradas, em transação independente |

O serviço **não** tem `@Transactional` ainda: a anotação entra no PR de integração (`READ_COMMITTED`), junto com o bean e o controller.

### 2.3 Fluxo de `criar` (resumo)

1. Valida o intervalo e o **expediente** (antes de qualquer lock, para não segurar lock à toa).
2. Ordena os IDs dos recursos, sem repetição.
3. **Bloqueia** os recursos (`RecursosPort`).
4. Só então **lê as ocupações** e roda `DetectorConflitos`.
5. Conflito → registra "conflito evitado", lança exceção (HTTP 409) e a transação inteira sofre rollback.
6. Sem conflito → grava SOLICITADA, audita, registra notificação; se não houver recurso restrito, grava APROVADA e audita a segunda transição.

Diagramas: `docs/arquitetura/sequencia-reserva.md`.

### 2.4 Regras PROPOSTAS (ainda sem decisão formal)

Estão listadas e numeradas em `docs/integracao/dependencias-e-revisores.md` (Q1–Q8): quem inicia e conclui o uso, edição de reserva aprovada, cancelamento por Administrador, código HTTP para fora do expediente, limites de duração.

## 3. Como testar

### 3.1 Comandos

```bash
cd backend
mvn test          # testes unitários e de serviço (sem banco)
mvn verify        # o mesmo comando que o CI deve usar
```

Não há testes que exijam Docker neste módulo ainda. Quando Fausto entregar o MySQL, os de integração (Testcontainers) exigirão Docker ativo.

### 3.2 Mapa dos testes e dos casos críticos (CT) do guia

| Caso do guia | Teste | Classe |
|---|---|---|
| CT01, CT02 fim ≤ início inválido | `ct01_…`, `ct02_…` | `IntervaloReservaTest` |
| CT03, CT04 encostar × sobrepor | `sobreposicaoSemiaberta` (parametrizado) | `IntervaloReservaTest` |
| CT05, CT06, CT07, CT08 recursos compartilhados | `conflitosPorRecursoCompartilhado_…` | `ReservaServiceTest` |
| CT09 duas threads, uma vence | `ct09_mesmoRecursoEIntervalo_exatamenteUmaVence` (**simulado**) | `ReservaConcorrenciaSimuladaTest` |
| CT10 multi-recurso sem gravação parcial | `ct10_conflitoNaoDeixa…` | `ReservaServiceTest` |
| CT11 restrita bloqueia, CT12 rejeitada libera | `ct11_…`, `ct12_…` | `ReservaServiceTest` |
| CT13 comum autoaprovada e auditada | `ct13_…` | `ReservaServiceTest` |
| CT14 Solicitante não aprova | `ct14_…` | `ReservaDominioTest`, `ReservaServiceTest` |
| CT15 manutenção, CT16 retirada aberta | `ct15_ct16_…` | `ReservaServiceTest` |
| CT19 edição detecta conflito | `ct19_…` | `ReservaServiceTest` |
| Matriz de estados (49 pares) | `matrizCompletaDeTransicoes` | `StatusReservaTest` |
| Expediente e fuso | `expediente…` | `DetectorConflitosEExpedienteTest` |
| CT20 auditoria na mesma transação | **parcial**: gera os registros; a atomicidade real depende do adaptador de Débora | — |
| CT17, CT18 logout/CSRF | responsabilidade de Débora | — |

### 3.3 Como ler os testes de concorrência

`AmbienteFake` implementa todas as portas em memória. Seus locks são `ReentrantLock` liberados ao fim de `transacao(...)`, imitando commit/rollback. Os testes:

- **mesmo recurso**: 8 threads, 20 rodadas, exatamente 1 reserva aceita e 7 conflitos;
- **ordens opostas** (`[1,2]` e `[2,1]`): o serviço ordena, então não há deadlock;
- **recursos distintos**: todas passam (não há lock global);
- **multi-recurso parcial**: invariante "nenhum recurso com duas reservas ativas sobrepostas";
- **controle negativo**: sem lock e com atraso entre ler e gravar, **a dupla reserva acontece**. Esse teste mostra que a suíte detecta o problema (risco R6: teste que nunca falha não vale como evidência).

### 3.4 O que ainda precisa de teste real

- Corrida com MySQL/Testcontainers para sala, professor, material e multi-recurso (CT09/CT10 reais, risco R-CONC-01).
- Rollback verdadeiro: nenhum vínculo ou auditoria órfãos após falha.
- API caixa-preta, segurança (403/IDOR), E2E e JMeter.
- Um ciclo TDD/BDD **documentado** (RED → GREEN → REFACTOR com commits e prints), exigido em ao menos uma funcionalidade. Sugestão: a aprovação restrita (RF07) ou a idempotência.

## 4. Como o módulo se relaciona com os demais (resumo do guia)

| Módulo | Dono | Relação com `reserva/` |
|---|---|---|
| `recurso/` | Fausto | Fornece a tabela `recursos` (alvo do lock), cadastro, ativo/restrito, expediente e bloqueios de manutenção |
| `movimentacao/` | Fausto | Retirada aberta vira ocupação `RETIRADA_ABERTA`; usa o mesmo lock e a mesma ordem |
| `seguranca/`, `usuario/` | Débora | Entrega o `AtorReserva` do usuário autenticado; aplica 401/403/CSRF; resolve IDOR |
| `auditoria/` | Débora | Implementa `AuditoriaPort`; cada transição vira registro com ator, antes/depois e correlação |
| `notificacao/` | Débora | Implementa `NotificacaoPort`; envio simulado e WireMock |
| `relatorio/` | Silva e Fausto | Usa `ConflitoEvitado` e horas por reserva (sem contar horas em triplicado por recurso) |
| frontend (`static/`) | Marcos | Consome o contrato `docs/api/reservas-contrato.md`; só mostra ações permitidas, mas **o servidor sempre revalida** |
| CI/qualidade | Débora | JaCoCo, Sonar, RTM, JMeter |

Regra de ouro: `reserva` é o **único** dono da regra de sobreposição. Controller, frontend e outros módulos não duplicam essa verificação.

## 5. Concorrência explicada (para a apresentação)

**Problema.** Duas pessoas pedem a mesma sala ao mesmo tempo. Se cada uma "consulta e depois grava", as duas veem "livre" e gravam: dupla reserva.

**Solução.** Antes de consultar, cada requisição **trava as linhas dos recursos** envolvidos na tabela `recursos`, em ordem crescente de ID. A segunda requisição espera. Quando a primeira confirma, a segunda lê o estado atualizado, enxerga o conflito e recebe 409.

**Perguntas esperadas na prova oral**

- *Por que não bloquear a linha da reserva?* Porque a reserva futura ainda não existe; é preciso um objeto estável compartilhado (o recurso).
- *Por que ordenar IDs?* Para duas requisições com `[1,2]` e `[2,1]` não travarem uma à outra (deadlock). Mesmo assim o InnoDB pode abortar uma transação; o sistema deve retornar erro previsível.
- *Por que READ COMMITTED?* Porque a leitura de conflitos precisa ver o que foi confirmado depois do início da transação; o snapshot do REPEATABLE READ poderia ser antigo.
- *O que prova que funciona?* Teste real com MySQL em Testcontainers, não mock. O teste em memória mostra apenas que o algoritmo está correto.
- *E se alguém esquecer o lock em um endpoint?* A garantia se perde; por isso criação, edição, cancelamento, manutenção, retirada e devolução usam a mesma convenção e passam por revisão.
- *Por que o conflito evitado usa outra transação?* Porque a transação da tentativa sofre rollback e levaria o registro junto.

## 6. Guia de manutenção

| Quero… | Onde mexer | Cuidados |
|---|---|---|
| Mudar uma transição de estado | `StatusReserva.destinos()` e `StatusReservaTest` (matriz) | Atualizar o ADR-005, a RTM e o contrato |
| Mudar quem pode agir | Métodos de `Reserva` (`exigirPapel`, `exigirOperador`, `cancelar`) | Testar CT14 e o caso do Administrador |
| Novo motivo de indisponibilidade | Novo valor em `OrigemOcupacao` + adaptador de `OcupacoesPort` | O detector não muda |
| Mudar a regra de sobreposição | **Somente** `IntervaloReserva.sobrepoe` | Os testes CT03/CT04 devem continuar passando; a mesma regra existe no SQL do Fausto |
| Alterar a ordem ou o tipo de lock | `RecursosPort` e ADR-003 | Revisar manutenção e movimentação; reexecutar o teste real de corrida |
| Novo endpoint | Controller → `ReservaService`; nunca acessar repositórios no controller | Atualizar `docs/api/` |
| Nova exceção de domínio | `dominio/` + mapeamento no `@RestControllerAdvice` | Código de erro no contrato |

Convenções: pacotes sem acento; mensagens ao usuário em português; nenhum dado sensível em auditoria ou logs; uma issue por mudança pequena ligada a um RF.

## 7. Limites desta entrega

- Sem controller REST, DTOs, JPA, migrações, segurança, auditoria e notificação reais: dependem das portas listadas acima.
- Sem `@Transactional` e sem idempotência por chave.
- Consulta de disponibilidade (`ReservaService.consultarDisponibilidade`) e cálculo de horas (`UtilizacaoReservas`) existem como código de serviço/domínio, **sem endpoint** e sem busca real de dados; relatórios (RF12) completos dependem de persistência.
- Nenhum requisito deve ser marcado como **IMPLEMENTADO/VALIDADO** na RTM até existirem execução no CI e evidência.

## 8. Glossário rápido

- **Recurso restrito**: exige aprovação do Responsável.
- **Ocupar a agenda**: estar em SOLICITADA, APROVADA ou EM_USO.
- **Lock pessimista**: bloqueio de linha no banco até o fim da transação.
- **Porta**: interface que o serviço usa e que outro módulo implementa.
- **Conflito evitado**: tentativa de reserva barrada por colisão; alimenta o relatório RF12.
- **Intervalo semiaberto**: inclui o início e exclui o fim.
