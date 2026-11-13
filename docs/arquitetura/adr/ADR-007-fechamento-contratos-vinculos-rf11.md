# ADR-007 — Fechamento dos contratos, operação dos vínculos e demonstração RF11

**Estado: DECISÃO ADOTADA SOB DELEGAÇÃO DE MARCOS; procedimento e demonstração implementados e validados localmente. Revisão do autor, publicação e operação no ambiente compartilhado mantêm estados próprios.**

Data: **13/11/2026**, America/Sao_Paulo. Escopo: pendências de integração das etapas 1 a 5 do frontend. Responsável pela decisão delegada e coordenação da demonstração: **Marcos Boé**. Registro técnico: AIOX Architect.

## Contexto e autoridade

Marcos informou no chat: “O pessoal me deu carta branca para resolver essas pendencias e seguir o fluxo do meu trabalho, podemos começar a resolvê-las?”. Esta autorização permite consolidar as decisões pendentes listadas no [encaminhamento de fechamento](../../integracao/marcos-pendencias-fechamento-2026-11-13.md), preservando a implementação integrada e preparando um procedimento verificável para a demonstração.

O registro é uma decisão de Marcos exercendo a delegação informada. Não atribui assinatura, revisão ou manifestação individual a Silva, Fausto ou Débora. A [execução local documentada](../../testes/marcos-fechamento-delegado-1-resultados.md) registra **8 cenários aprovados e zero falhas**, com aplicação/MySQL reais e gateway simulado real. Essa prova não é implantação no ambiente compartilhado, revisão do autor, publicação/merge ou encerramento dos RFs globais; esses estados exigem seus registros próprios.

Referências de origem: [ADR-004](ADR-004-sessao-spring-security.md), [ADR-005](ADR-005-politicas-de-reserva.md), [ADR-006](ADR-006-timezone-expediente-notificacoes.md), [contrato de reservas](../../api/reservas-contrato.md), [consultas](../../api/reservas-consulta-contrato.md), [fila](../../api/reservas-leitura-contrato.md), [Q9](../../seguranca/q9-autorizacao-reservas.md) e [RF11](../../qualidade/rf11-notificacoes.md). O comportamento foi confrontado com `Reserva`, `ReservaService`, `ReservaAcessoMysql`, `ReservaLeituraController`, `ProcessadorNotificacoes`, `GatewayNotificacaoPadrao` e V6 já integrados.

## 1. Contratos adotados

| Tema | Decisão que passa a orientar o fechamento |
|---|---|
| Datas e fuso | Entrada ISO 8601 com offset; saída com offset de `America/Sao_Paulo`, preservando os instantes. UTC na persistência. Não converter horário por simples concatenação de `-03:00`. |
| Edição HTTP | PATCH substitui `inicio`, `fim` e `recursosIds` juntos; os três obrigatórios. Identidade/papel sempre vêm da sessão. |
| Fora do expediente | HTTP409, `FORA_DO_EXPEDIENTE`, mantendo o envelope `{codigo,mensagem,correlationId}`. |
| Edição de domínio | Apenas o dono, em SOLICITADA ou APROVADA comum, sem mudar a necessidade de aprovação. Reserva restrita aprovada não é editável por esse fluxo. Leitura autorizada não concede edição. |
| Cancelamento | Dono ou Administrador, de SOLICITADA/APROVADA para CANCELADA. Histórico preservado; nenhuma remoção física. |
| Listagem | GET `/api/reservas`, filtros/ordem/paginação/total no servidor, conforme o contrato de consultas integrado. Não ampliar o escopo com filtros do cliente. |
| Detalhe | GET `/api/reservas/{id}`, projeção autorizada completa com todos os recursos, antes de editar/cancelar. Não expor dados pessoais adicionais por esta decisão. |
| Fila | Para RESPONSAVEL, GET `/api/reservas?status=SOLICITADA` limita a fila às restritas pendentes do escopo autorizado. Outros estados/perfis mantêm a listagem geral contratada. Não criar rota paralela. |
| Escopo Q9 | Solicitante consulta as próprias; Responsável exige vínculo efetivo com **todos** os recursos; Administrador consulta todas sem herdar decisões exclusivas do Responsável. Vínculo parcial não libera detalhe nem decisão. |
| Negativas | Sem sessão401; parâmetros inválidos400; detalhe inexistente/fora do escopo404; escrita não permitida403. Demais conflitos/transições seguem o contrato vigente. |

Q1, Q3 e Q8 permanecem como integradas nos PRs #31, #30 e #33/#34: início/conclusão/ausência exclusivos de Responsável; autoaprovação proibida; aprovação revalida autorização, domínio, ativos, expediente e ocupações na transação. Este ADR não estende a proibição de autoaprovação a ações que não possuem essa regra no domínio.

A regra multirrecurso exige uma pessoa autorizada para o conjunto completo. Não há aprovação parcial por recurso neste fluxo. Caso a organização necessite de outro modelo no futuro, isso será uma mudança de contrato/regra com critérios próprios, não concessão implícita de acesso a qualquer recurso da reserva.

## 2. Operação administrativa de vínculos

### Responsáveis e limite de autoridade

- O **Administrador da aplicação** autoriza quais pares usuário/recurso devem ser concedidos ou revogados, com referência de solicitação/decisão. Para a demonstração delegada, Marcos coordena essa autorização.
- Um **operador de banco autorizado** executa o procedimento por CLI com conta restrita à operação no banco identificado. Papel ADMINISTRADOR na sessão web não concede automaticamente acesso SQL; uma conta SQL autorizada também não altera os papéis da aplicação.
- O procedimento é um runbook com SQL reutilizável e parâmetros explícitos. Não cria endpoint público, nova tela, tabela, migração, trigger, procedimento armazenado ou papel de aplicação.
- A conta de runtime da aplicação não é ampliada para administrar vínculos. O provisionamento da conta operadora pertence à administração do banco, com os privilégios necessários ao procedimento na base pretendida; não exige `SUPER` nem grants globais. Credenciais ficam fora do repositório e dos argumentos públicos.

Na instalação MySQL8.4 validada, a conta operadora usa `SELECT(id,perfil,ativo)` em `usuarios`, `SELECT(id,codigo,ativo)` em `recursos` e `SELECT` em `responsaveis_recursos`; não recebe leitura de e-mail nem hash de senha. A escrita é limitada a `INSERT`, `DELETE` e `UPDATE(recurso_id)` na tabela de vínculos, sendo o último o no-op da concessão idempotente. O locking `SELECT ... FOR UPDATE` exigiu também `UPDATE(id)` em `usuarios` e `recursos` na execução observada. Isso não concede atualização de `perfil`, `ativo`, e-mail ou senha; o procedimento não altera os IDs. A [prova local](../../testes/marcos-fechamento-delegado-1-resultados.md) identifica a conta, os resultados e as negativas efetivamente executadas. Esses privilégios foram exercitados somente com conta/base próprias da demonstração; não se afirma aplicação de grants no ambiente compartilhado ou produção.

### Unidade de operação e validação

Cada execução contém **uma ação** (`CONCEDER` ou `REVOGAR`), **um `usuarioId`**, **um `recursoId`** e **uma referência operacional obrigatória**. IDs são positivos e explícitos; não há seleção por padrão, coringa ou operação em massa. Antes de escrever, conferir a identidade da base/conexão, os registros envolvidos e o par atual.

1. Abrir transação curta e bloquear os registros de recurso e usuário na ordem definida pelo procedimento. Não manter a transação aberta enquanto se solicita decisão humana.
2. **Concessão:** exige usuário existente, ativo e de perfil RESPONSAVEL, e recurso existente/ativo. Validar parâmetros/referência antes da mutação. O par existente é sucesso idempotente sem duplicação; a chave primária da V6 continua sendo a garantia de unicidade.
3. **Revogação:** remove somente o par explicitamente indicado. Pode retirar vínculo obsoleto de usuário inativo ou cujo perfil mudou, ou de recurso desativado. Não exigir que o usuário ainda seja RESPONSAVEL para retirar um privilégio antigo. Par já ausente é resultado idempotente sem remoção de outros pares.
4. Parâmetro inválido, registro inexistente para concessão ou estado incompatível não pode resultar em concessão parcial. O procedimento deve emitir resultado inequívoco de recusa e não confirmar mutação; falhas SQL exigem rollback.
5. Conferir o estado final do par antes de confirmar. A transação trata somente essa operação; não modifica reservas, perfil/atividade do usuário, estado do recurso, vínculos de terceiros ou evidências anteriores.
6. Guardar a referência, operador SQL (`CURRENT_USER()`), base identificada, momento, ação, par e resultado antes/depois em registro operacional sem segredos. Isso não é registro automático em `auditoria` pela aplicação: o SQL administrativo não atravessa as portas de domínio de RF10. Não fabricar autoria de sessão nem auditoria de domínio.

Consulta e escrita devem usar os mesmos IDs conferidos. A concessão de todos os recursos de uma reserva corresponde a operações explícitas para cada par; o Responsável permanece sem autorização para a reserva enquanto faltar um dos vínculos. A revogação passa a valer nas leituras/decisões posteriores conforme o predicado Q9 já implementado. Não se afirma revogação retroativa de decisões já concluídas.

### Preparação do ambiente e prova mínima

No ambiente de demonstração, cadastrar usuários/recursos pelos fluxos existentes e preparar vínculos com esse procedimento antes das ações que dependam deles. Não usar os IDs fixos das fixtures como cadastro real. A validação automatizada pode criar massa própria identificada e exercer o mesmo SQL/procedimento, preservando os demais dados.

Provas mínimas: concessão válida/idempotente; negativa para ID/ação/referência inválidos e para concessão a usuário inativo/outro perfil ou recurso inativo/inexistente; revogação exata/idempotente inclusive de vínculo obsoleto; preservação de outros pares; consulta/decisão permitida somente com vínculo completo e negada após revogação. Identificar a base/massa, o procedimento usado e o resultado. Os testes Q9 anteriores continuam com sua proveniência e não são rebatizados como execução de um procedimento novo.

## 3. RF11: modo de demonstração e aceite

Adotar para o fechamento acadêmico a **simulação local por log** já prevista e aprovada no ADR-006. A prova integrada deve usar outbox MySQL, processador e `GatewayNotificacaoPadrao` reais, com `notificacoes.gateway.url` efetivamente vazia. O processamento registra a simulação por ID/evento/reserva e conclui a linha como ENVIADA. Nesse modo, ENVIADA significa **simulação concluída**, não recebimento de e-mail ou de uma instituição externa.

As provas de gateway HTTP com WireMock, retry e falha definitiva já relacionadas permanecem complementares. Não é requisito deste fechamento enviar mensagens reais. Um futuro uso de gateway externo exige configuração/validação próprias do ambiente correspondente e não é declarado entregue por este ADR.

### Isolamento e execução

`ProcessadorNotificacoes` e o worker selecionam toda a outbox elegível, sem filtro por reserva ou rodada. Portanto:

- A demonstração usa **base e processo Spring exclusivos**, identificados por nome/porta/credenciais/configuração próprios, com migrações reais e somente massa da demonstração. Não limpar/reutilizar outbox antiga para torná-la elegível à prova.
- O MySQL pode ser a instância local isolada já identificada, com uma base nova e conta limitada a ela. Isso não autoriza modificar a base principal ou outros serviços. Na aplicação temporária, conferir a base efetiva e a propriedade vazia do gateway antes de criar eventos/processar; variáveis herdadas não podem selecionar um destino externo.
- Para demonstrar o agendamento, habilitar `NOTIFICACOES_WORKER_ENABLED=true` **somente no processo temporário**. A configuração atual executa `processarLote(20)` com intervalo de30segundos. Espera e polling devem ser limitados e progressivos, sem repetir a escrita HTTP de resultado incerto.
- A demonstração cria uma reserva por API real com sessão/CSRF e guarda o ID do evento correspondente. Confere commit da reserva, trilha de auditoria/outbox, log do gateway simulado e estado final da linha. Após a observação, encerra apenas o processo temporário cuja identidade foi verificada. A base/massa podem permanecer para inspeção; não remover dados compartilhados por rotina.
- O worker do E2E principal permanece desligado. Sua outbox histórica e identidades/estado devem ser preservados. Se a identidade ou o isolamento não puderem ser comprovados, a execução deve parar antes de habilitar processamento.

### Evidência e critério de conclusão

Registrar configuração efetiva sem valores secretos, identidade do processo/base, comando/ambiente, hashes do JAR/fontes, IDs próprios e estados HTTP/SQL/log do gateway. Aceitar o fluxo real **reserva confirmada → outbox confirmada → processamento real → log simulado → ENVIADA**. Evidência de processador com gateway Mockito ou HTTP com WireMock não substitui essa demonstração específica com o gateway simulado real.

Não afirmar que um worker habilitado é uma prova: o evento da rodada precisa alcançar o estado/log esperado. Eventual falha deve ser preservada, não convertida em aprovação pela simples existência de testes antigos.

## 4. Consequências e conclusão do recorte

As decisões contratuais e o modo RF11 deixam de aguardar uma nova manifestação individual porque Marcos recebeu delegação para resolvê-los e os adotou neste escopo. Os contratos/runbooks e o plano devem referenciar esta autoridade sem apagar os registros anteriores de pendência.

O [procedimento operacional](../../operacao/vinculos-responsaveis.md) e a [demonstração reproduzível](../../operacao/demonstracao-fechamento.md) foram implementados e exercitados em conta/base exclusivas, com **8 cenários aprovados e zero falhas** conforme o [relatório de execução](../../testes/marcos-fechamento-delegado-1-resultados.md). Decisão adotada e validação local não atribuem aprovação a testes futuros nem execução no ambiente compartilhado. Revisão independente, revisão do autor/aceite visual pertinente, commit, publicação/PR e merge continuam nos estados efetivamente registrados. O erro compartilhado do scanner e a indisponibilidade local do CodeRabbit mantêm o tratamento já registrado, sem aprovação presumida.

O recorte fecha as pendências específicas de contratos, vínculos e modo RF11 das etapas1a5 quando o procedimento/evidências estiverem entregues. Não encerra relatórios da etapa6, implantação em produção, imutabilidade da auditoria contra SQL privilegiado ou certificação global de requisitos/concorrência.
