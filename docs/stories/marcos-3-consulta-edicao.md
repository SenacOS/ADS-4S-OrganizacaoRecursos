# Marcos-3-consulta-edicao — Consultar, editar e cancelar reservas existentes

## Status

Ready for Review

**Aceite posterior em 12/11/2026:** Marcos informou que os testes funcionaram, aprovou a revisão visual e autorizou o commit local. [Registro e limites](../testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md). Os resultados QA abaixo conservam o momento anterior a esse aceite. Push/PR, revisão da equipe, checks e encerramento integrado continuam separados.

Continuidade autorizada por Marcos em **12/11/2026**, após informar o push do incremento Q9. O agente principal confirmou HEAD/remoto `f9c4912`, branch `feature/marcos-integracao-q9`, com a develop `4cea177` (PRs #26/#27) incorporada. A nova branch de implementação será registrada pelo executor, preservando esse histórico e eventuais alterações locais. Nenhum commit, push, PR ou merge remoto está autorizado automaticamente por esta story; seguir as solicitações correspondentes do usuário.

## Story

Como usuário autenticado, quero consultar as reservas que meu perfil pode acessar, abrir seu detalhe autorizado e editar ou cancelar quando permitido, para acompanhar e ajustar minhas solicitações sem perder recursos, precisão temporal ou confirmação do resultado.

Responsável: Marcos Boé. RF01, RF03, RF04, RF07 quanto à separação de decisões, RF13 e RF14 nos cenários executados. Preparação AIOX SM; implementação AIOX Dev; veredicto independente AIOX QA. Completa o recorte de interface pendente da etapa 3; não encerra automaticamente todas as etapas 1 a 5, a matriz E2E ou os RFs compartilhados.

## Fontes e contexto

- [Plano de fechamento, passo 6](../planejamento/marcos-fechamento-etapas-1-a-5.md#10-passo-6--implementar-o-restante-da-etapa-3): listagem, detalhe antes de editar/cancelar, PATCH conjunto, confirmação e testes.
- [Contrato de consultas](../api/reservas-consulta-contrato.md#listagem-e-detalhe): GETs entregues e revalidados nas bases `3f2a9a3`/`4cea177`; filtros, projeções, total e escopo Q9. [Regra de escopo](../api/reservas-consulta-contrato.md#escopo-da-sessão): leitura não concede escrita.
- [Contrato de escrita](../api/reservas-contrato.md#alterar-reserva): PATCH com `inicio`, `fim`, `recursosIds`; cancelamento por POST, sessão, CSRF e erros. Cabeçalhos antigos desse arquivo sobre GETs não implementados são históricos e devem ser conciliados com a entrega Q9, sem alterar regras por inferência.
- [Primeiro recorte Marcos-3](marcos-3.md): pesquisa/criação já implementadas; [integração Q9](marcos-integracao-q9-1.md) e [revalidação PR #27](../testes/marcos-integracao-q9-1-pr27-resultados.md): listagem/detalhe e fila reais disponíveis, regra de todos os vínculos aceita por Marcos para o frontend.
- `backend/src/main/java/br/senac/recursos/reserva/dominio/Reserva.java`: `reagendar` valida dono, estado e manutenção da necessidade de aprovação; `cancelar` exige dono ou Administrador. As regras marcadas **PROPOSTO** continuam sendo comportamento implementado observado, não ratificação coletiva atribuída por esta story.
- `StatusReserva.java`: cancelamento tem transição somente de SOLICITADA e APROVADA; EM_USO e estados terminais não cancelam. `ReservaService.editar`: valida ativos/expediente e conflitos ignorando a própria reserva; `cancelar` delega à transição de domínio.
- `static/js/api.js`, `auth.js`, `sessao-page.js`, `forms.js`, `datas.js`, `recursos.js`, `reservas.js`, `navegacao.js` e páginas atuais: padrões de sessão/CSRF, seleção, erros, projeção e acessibilidade. O cliente de escrita existente deve ser reutilizado quando adequado, sem transformar confirmação de criação em confirmação genérica de todos os estados.
- [Guia local](../integracao/marcos-e2e-local.md), [regressão anterior 72/240](../testes/marcos-integracao-datas-1-resultados.md): ambiente e referência de testes, não aprovação desta nova interface.

## Critérios de aceitação

1. Conferir base/branch/árvore antes de implementar e trabalhar em branch própria que preserve `f9c4912`, frontend consolidado e backend Q9 `4cea177`. Registrar a origem e o estado efetivamente usados; não reescrever evidências históricas, atribuir alterações ainda não commitadas a SHA novo ou publicar mudanças sem solicitação.
2. Disponibilizar página HTML/CSS/ES modules nativa em **`/pages/minhas-reservas.html`**, com rótulo visível **“Reservas”** na navegação e no painel dos três perfis. Explicar o escopo em linguagem de uso: próprias reservas para Solicitante, todos os recursos sob responsabilidade para Responsável e consulta geral para Administrador. Preservar Nova reserva, Aprovações, Gestão e Movimentações e suas permissões existentes. Verificar sessão antes de consultar dados; perfil desconhecido não libera ações.
3. Listagem consome somente `GET /api/reservas` e filtros contratados: status exato opcional; início/fim juntos, com offset, por sobreposição; recursoId positivo; pagina >= 0 e tamanho 1–100, padrões 0/20. Ordenação e total permanecem do servidor. Mudança de filtros reinicia página na nova consulta; mostrar carregamento, vazio, página além do fim com total preservado, erro e nova tentativa explícita. Não incluir solicitante/papel/escopo enviado pelo navegador nem filtrar localmente uma lista global para simular Q9. Para Responsável/status SOLICITADA respeitar o comportamento de fila restrita já implementado.
4. Validar e projetar estritamente lista/detalhe antes de exibir ou habilitar ação: IDs positivos seguros, estado conhecido, restrita booleana, datas com offset/intervalo coerente, recursosIds completos sem duplicatas, correspondência entre recursosIds e projeções legíveis, solicitante mínimo coerente com solicitanteId e envelope de paginação válido. Ignorar campos extras para a interface; não mostrar contatos/e-mail ou interpretar identificação/mensagens como HTML. Reutilizar os tipos/validadores existentes quando a semântica for equivalente, sem afrouxar validação apenas para aceitar um retorno incoerente.
5. Abrir uma reserva por **GET de detalhe autorizado completo** antes de oferecer edição/cancelamento, mesmo que o item da lista já tenha campos semelhantes. A resposta deve corresponder ao ID solicitado; resposta tardia da lista/detalhe de outro alvo não pode substituir a reserva atual, restaurar editor fechado ou confirmar ação sobre ID antigo. Identificar reserva, período, solicitante mínimo, estado e todos os recursos de forma legível. Fora do escopo/inexistente (404) mantém a área de ação indisponível e permite retorno/consulta apropriados.
6. Mostrar edição somente para o **dono** em SOLICITADA ou APROVADA **comum** (`restrita=false`), conforme `Reserva.reagendar` observado. Administrador/Responsável que apenas consultam reserva alheia não herdam edição. A alteração não pode mudar a necessidade de aprovação; não oferecer como permitida a troca entre reserva comum/restrita sem contrato. O backend continua sendo a autoridade final para estado, vínculo, ativos, expediente e conflitos, inclusive se o estado/perfil mudou após o GET. Registrar a natureza PROPOSTO da regra de edição, sem declarar ratificação coletiva ou ampliar permissões.
7. O editor carrega e preserva **todos** os recursos da resposta de detalhe. Manter os originais selecionados mesmo que não estejam na página atual da pesquisa, o período mude ou a disponibilidade genérica os reporte ocupados pela própria reserva. A UI não pode tratar esse resultado como prova de conflito consigo mesma nem removê-los automaticamente; o PATCH real revalida ignorando a própria reserva no servidor. Permitir remoção explícita e inclusão de recursos novos ativos/disponíveis por `GET /api/recursos` existente, com pesquisa/paginação e identificação legível. Recurso novo indisponível/inativo não é selecionável; disponibilidade desconhecida ou falha de pesquisa não vira disponibilidade confirmada nem apaga a seleção original. Não inventar filtro `ignorarReservaId` ou endpoint de disponibilidade/seleção de reserva não contratado.
8. PATCH substitui **inicio, fim e recursosIds juntos**, inclusive valores não alterados; enviar somente esses campos, sem solicitante, papel, estado ou projeções. Preservar instantes e precisão das datas originais quando o usuário não as editar: resposta pode ter minutos, segundos e fração de até nove casas com offset. Abrir e salvar sem alterar uma data não pode cortar segundos/fração, aplicar timezone do navegador, deslocar horário ou arredondar por `Date`/input em minutos. Guardar o ISO original e distinguir valor civil não alterado de edição real, ou usar solução equivalente verificável. Se apenas uma extremidade mudar, preservar integralmente a outra; datas realmente editadas são convertidas/validadas no fuso America/Sao_Paulo, incluindo intervalo e limite diário contratados. Não tornar formato fracionário obrigatório para novas entradas.
9. Cancelamento exige dono ou ADMINISTRADOR e estado **SOLICITADA ou APROVADA**, únicos com transição para CANCELADA na matriz atual. Não oferecer cancelamento de EM_USO, CONCLUIDA, REJEITADA, CANCELADA ou NAO_COMPARECEU. Após detalhe completo, apresentar confirmação explícita com alvo, período e recursos; desistir não escreve. Enviar `POST /api/reservas/{id}/cancelamento` sem corpo, nunca DELETE. Preservar histórico e atualizar listagem/detalhe somente após resposta coerente CANCELADA do mesmo alvo, não interpretar cancelamento como exclusão física.
10. Confirmar resposta de PATCH/cancelamento antes de mostrar êxito: mesmo ID/solicitante, estado e restrição coerentes com a operação, intervalo/recursos esperados e conteúdo necessário, sem confundir resposta de criação ou de outra reserva. Escrita confirmada seguida de falha ao atualizar a lista mantém a confirmação da escrita e aviso de atualização, sem repetir PATCH/POST. Um guard impede duplo envio e troca de alvo/contexto durante a escrita. Rede/resposta incoerente é operação incerta: invalidar confirmação e exigir nova leitura **GET de detalhe** bem-sucedida antes de nova tentativa explícita, sem replay automático ou reutilização da confirmação antiga. Falha dessa reconsulta mantém o bloqueio; se o estado mudou, reapresentar o estado confirmado e as ações então permitidas.
11. Tratar 400, 401, 403, 404 e 409 pelos módulos de sessão/erro existentes. 401 redireciona ao login; 403 ou revogação/404 não expõem dados fora do escopo; conflitos/TRANSICAO_INVALIDA/TENTE_NOVAMENTE mostram mensagem do servidor e referência de suporte, preservando contexto aplicável sem afirmar sucesso. CSRF usa o nome de cabeçalho devolvido pelo endpoint, cookie same-origin e nenhum dado de autenticação em storage. Não criar ETag, Idempotency-Key, trava de concorrência no cliente ou regras de backend novas. Mudanças concorrentes são tratadas por resposta/recarga explícita conforme o contrato atual.
12. Interface mantém textos seguros, labels/instruções, estados de carregamento/busy, teclado, foco previsível ao abrir/fechar/confirmar/errar e layout utilizável em desktop/móvel. Informar qual reserva está sendo editada/cancelada e distinguir consulta de ações permitidas. Não inserir detalhes de SQL, configurações, testes ou vínculos técnicos no fluxo do usuário. O editor pode manter seleção própria; evitar refatorar `recursos-page.js` ou outros fluxos sem necessidade comprovada.
13. Acrescentar testes unitários das operações públicas e testes de navegador controlados para listagem/filtros/paginação/vazio/erros, três perfis e navegação, detalhe obrigatório/ID divergente/resposta tardia, regras de edição/cancelamento e estados terminais, seleção original entre páginas e ocupada por si mesma, novo recurso indisponível, DTO completo e precisão temporal sem alteração, confirmação coerente/incerta, duplo envio/recarga antes de nova tentativa, sessão/CSRF/XSS, teclado/foco e duas viewports. Testes devem observar comportamento, não espelhar implementação ou apenas contar linhas. Executar **`npm run build` completo**, incluindo lint, typecheck, unitários e navegador; registrar contagens/falhas reais. A aprovação anterior de 72/240 é referência, não cobre as mudanças novas e não deve ser somada às contagens finais.
14. Reempacotar a árvore nova no JAR e executar E2E real da página com Spring/MySQL isolados, sem interceptação, autenticação falsa ou bypass de escopo: lista/detalhe próprios, edição válida com manutenção dos originais, cancelamento pelo dono e cancelamento administrativo de reserva alheia autorizada, e ausência/recusa de ações de perfil indevido. Preparar dados exclusivos com horário/expediente reais, vínculos de teste somente quando necessários e restritos aos próprios IDs, preservando dados existentes. Conferir fonte servida/JAR por hash e persistência pertinente. Package com testes Maven omitidos é registrado como tal, sem alegar clean verify, concorrência ou CI aprovadas.
15. Produzir `docs/testes/marcos-3-consulta-edicao-resultados.md`, logs/JSONs/capturas sanitizados pertinentes e guia de reprodução; atualizar contrato/consumo e cabeçalhos históricos superados, plano, RTM, checklist e File List conforme o resultado efetivo. Registrar base, branch, árvore ainda não commitada, hashes, versões e tentativas. Credenciais/cookies/tokens/configuração/dados/logs brutos permanecem ignorados. Obter revisão assistida independente QA e disponibilizar revisão visual a Marcos; não presumir aceite, revisão de outro integrante, checks remotos, ratificação coletiva ou encerramento integrado. Commit/push/PR somente nos pedidos correspondentes.

## Tasks / Subtasks

- [x] Conferir base/branch/artefatos e registrar o escopo herdado do incremento Q9 (AC 1).
- [x] Implementar cliente de consulta/projeção/permissões e confirmação de escrita conforme contratos e domínio observados (AC 3–6, 8–11).
- [x] Adicionar página Reservas, navegação dos perfis e lista com filtros/paginação/estados de consulta (AC 2–5, 12).
- [x] Implementar detalhe autorizado antes das ações e proteção contra respostas antigas/IDs divergentes (AC 5).
- [x] Implementar edição com seleção completa/paginação de recursos e preservação temporal dos originais (AC 6–8).
- [x] Implementar cancelamento com confirmação, restrições por dono/perfil/estado e resposta validada (AC 9–10).
- [x] Tratar operações incertas, recarga de detalhe antes de nova tentativa e falha de atualização após sucesso (AC 10–11).
- [x] Cobrir comportamentos e fronteiras relevantes em unitários/navegador e executar build completo (AC 13).
- [x] Reempacotar e validar fluxos da página contra Spring/MySQL reais com provas sanitizadas (AC 14).
- [x] Atualizar documentação/contratos/plano/RTM, checklist e File List, preservando evidências anteriores (AC 15).
- [x] Registrar veredicto independente QA deste incremento.
- [x] Obter revisão visual/aceite de Marcos pertinentes; manter revisão/checks externos separados.
- [x] Preparar o commit local solicitado por Marcos; o commit que inclui este registro identifica a entrega local.
- [ ] Publicar branch e criar PR quando solicitados, acompanhando revisão/checks/merge separadamente.

## Dev Notes

Os GETs estão implementados e já foram testados na integração anterior. Não reutilizar como diagnóstico atual os cabeçalhos antigos de “leitura ausente” do contrato de escrita; conciliá-los com as referências de PR #26/#27 sem marcar decisões coletivas inexistentes. A regra Q9 de vínculo com todos os recursos foi aceita por Marcos para o frontend; sua gestão administrativa e ratificação dos demais continuam registradas separadamente.

Permissões observadas no domínio devem orientar somente conveniência da UI. Cancelar: dono ou Administrador, transição SOLICITADA/APROVADA para CANCELADA. Editar: somente dono em SOLICITADA ou APROVADA não restrita, sem trocar necessidade de aprovação. `Reserva.reagendar` ainda rotula essa última política como PROPOSTO; a UI consome o comportamento atual sem ampliá-lo. As ações de aprovação/rejeição permanecem na fila existente, sem serem herdadas pelo Administrador nesta página.

`ReservaService.editar` ignora a própria reserva ao verificar conflitos, enquanto a pesquisa genérica de recursos não recebe exclusão por reserva. Logo, a disponibilidade dessa busca pode indicar ocupado para o recurso original no mesmo intervalo. Seleção original precisa sobreviver a isso, às páginas e a falhas de enriquecimento. O GET autorizado já fornece todos os IDs/projeções para manter o conjunto completo. Novos recursos vêm da pesquisa contratada; não converter uma falha/valor desconhecido em autorização de inclusão.

`datas.js` aceita resposta com minutos/segundos/fração e offset, mas `paraIsoOperacional` atualmente converte entrada civil com minutos/segundos sem fração. `Date.parse` também não representa as nove casas integralmente. A implementação deve evitar roundtrip destrutivo de datas originais: preservar a string ISO de cada campo não alterado e comparar com o valor civil apresentado, ou solução equivalente com testes de instantes e frações. Se ampliar auxiliar de entrada para frações for necessário, manter compatibilidade de todos os consumidores e cobrir no build completo; não mudar a saída do backend nem anexar -03:00 sem conversão.

O novo cliente pode reutilizar `reservas.editar/cancelar` para transporte, mas precisa de confirmação própria de edição/cancelamento: `confirmarCriacao` só aceita estados de criação e não é validador suficiente para CANCELADA ou edição restrita pendente. A confirmação deve exigir identidade/estado/intervalo/recursos coerentes e não dar sucesso por HTTP 200 isoladamente. Não reabrir ação com um simples refresh da lista após resposta incerta: a nova tentativa depende do detalhe completo autorizado e da nova conferência do alvo.

HTML, CSS e módulos nativos permanecem sob `backend/src/main/resources/static/`; Node/Playwright são ferramentas de desenvolvimento. Um editor com seleção própria é permitido para evitar acoplamento/refatoração excessiva do fluxo de pesquisa/criação já aprovado. Manter CSRF/sessão/erros/guard/foco nos padrões existentes. Os nomes previstos abaixo podem ser ajustados ao padrão real, com File List atualizada; rota `/pages/minhas-reservas.html` e rótulo Reservas fazem parte do recorte acordado.

## Validação de preparação

Checklist `story-draft-checklist` conferido: objetivo/valor, vínculo com plano e entregas anteriores, fontes existentes, contratos/permissões por estado, testes, fronteiras temporais, seleção e operação incerta estão explícitos. Escopo deriva do passo 6 e do comportamento atual do backend; nenhuma regra nova ou endpoint foi inventado. A preparação SM não é revisão independente PO/QA, aceite visual ou teste executado. Story pronta para desenvolvimento no fluxo autorizado.

## CodeRabbit Integration

Tipo principal: Frontend; secundário: Integração. Execução AIOX Dev; revisão independente AIOX QA; revisão visual do autor no fluxo combinado. Focos: detalhe antes de ação, escopo/estados sem ampliar permissões, seleção original, precisão de datas, resposta incerta/reconsulta, proteção de identidade/concorrência visual e layout/foco. Gates: build completo do frontend e E2E real correspondente, registrados separadamente; CodeRabbit com resultado/indisponibilidade explícitos, sem aprovação presumida. Self-healing AIOX Dev light: até 2 iterações/15 minutos para CRITICAL; HIGH documentado. Publicação/PR seguem autorização própria e AIOX DevOps.

## Dev Agent Record

### Complemento compartilhado Q8/MySQL — PR #34

#34 aprovado por Marcos e mesclado1948e69; adiciona somente ReservaAprovacaoMysqlIT. CI43447037478:9testes Q8/MySQL aprovados, incluídos no total66integrações;261unitários/HTTP, JaCoCo e JMeter aprovados. [Fonte, log, cenários e limites](../testes/marcos-q8-pr34-evidencias.json). Evidência da equipe relacionada à lacuna Q8/MySQL, sem nova execução local, reconstrução de JAR ou alteração autoral de código. Base documental atual1948e69 por fast-forward, onze documentos preservados antes da atualização. Scanner compartilhado mantém tratamento alinhado; sem novo Quality Gate inferido. Publicação documental e confirmações compartilhadas restantes seguem pendentes; pareceres QA e resultados anteriores conservam sua origem. Os checkpoints seguintes são históricos.


### Atualização após os merges #32/#33

#32 aprovado por jovemOG-Dev e mesclado3e1a2a0; #33/Q8 aprovado por Marcos e integrado62cd48f. Documentação local preservada por cópia/hash e trazida para `docs/marcos-fechamento-etapas` sobre62cd48f. Revalidação pertinente executada com JAR reconstruído:8/0unitários Q8 e12/0Q9/Q1/Q3 reais. [Nova prova e limites](../testes/marcos-fechamento-pos-merge-32-33.json). Suítes anteriores preservam base/hash/origem; não foram novamente executadas. Nenhum código autoral/CI modificado. CodeRabbit continua indisponível; scanner compartilhado não bloqueia a implementação por orientação de Marcos. Pareceres QA preservados, sem novo veredicto ou encerramento global. Documentação atual ainda sem commit/push; confirmações compartilhadas seguem pendentes. Os checkpoints seguintes descrevem as fotografias anteriores.


### Publicação e conciliação — 13/11/2026

Incremento de origem 0775715 integrado à develop pelo [PR #28](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/28). Aceite do autor e resultados originais preservados; menções anteriores a ausência de commit/push/PR são históricas. Corretivo dos auxiliares/evidências em5569e57 / #32: Quality Gate OK, Ready for review, ainda sem merge/revisões. Scanner compartilhado registrado e temporariamente não bloqueante da implementação por orientação de Marcos; CodeRabbit/revisão coletiva e ratificações seguem separados. [Estado remoto e limites](../testes/marcos-fechamento-status-2026-11-13.md). Esta conciliação não executa novos testes, altera parecer QA ou encerra RFs globais.


### Completion Notes

Implementação local concluída em 12/11/2026 na branch `feature/marcos-reservas-consulta`, criada sobre f9c4912 após push confirmado por Marcos. Página Reservas para os três perfis, consulta/paginação, detalhe autorizado, edição/cancelamento e confirmação implementados conforme contratos. ISO original preservado por campo; comparador preciso compartilhado evita recusar intervalo submilissegundo. Seleção original mantida entre páginas e disponibilidade própria. Nenhuma alteração de Java, POM, migrações, dependências ou configuração persistente.

Build final **81 unitários/278 navegador**, lint/typecheck aprovados. E2E real **8/0**, sete fontes servidas conferidas com o JAR; smoke geral **16/0/0**. Package Maven omitiu testes, sem alegar clean verify. Primeiras rodadas 80/274 e 80/276 preservadas; QA encontrou FE-005/P2 e FE-006/P3, corrigidos e cobertos na final. [Resultados, hashes, reprodução e limites](../testes/marcos-3-consulta-edicao-resultados.md). Reforço de validação de códigos de fixture efetuado antes do SQL limitado à massa nova.

Interface implementada/testada e aceita visualmente por Marcos, com commit local solicitado. [Aceite e alcance](../testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md). Revisão da equipe, ratificação coletiva/processo de vínculos, matriz integrada completa, CI/CodeRabbit, publicação e merge não estão presumidos. Busca compartilhada de recursos conserva limite anterior para intervalo menor que 1ms; originais ainda podem ser consultados/salvos/cancelados, conforme testes controlados. Ready for Review não significa Done nem revisão de outro integrante concluída. O commit que inclui este registro identifica a entrega local; push/PR permanecem separados.

### Agent Model Used

Codex, preparação AIOX SM e execução AIOX Dev; revisão independente AIOX QA registrada separadamente.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-12 | Story Ready for Dev para o restante da etapa 3 após push de f9c4912: lista/detalhe/edição/cancelamento, precisão temporal, seleção original, erros/guard e testes completos/reais conforme contratos entregues. |
| 2026-11-12 | Implementação local Ready for Review: build final81/278, E2E8/0 e smoke16/0/0; FE-005/FE-006 corrigidos, provas/contratos/plano/RTM atualizados. Aceite visual, commit e entrega pendentes. |
| 2026-11-12 | Aceite visual global de Marcos e commit local autorizados; registro documental sem alteração de produto/testes ou repetição de suítes. Publicação/revisão/checks/merge separados. |

### File List

Arquivos efetivamente criados/alterados neste incremento:

- `backend/src/main/resources/static/css/consulta-reservas.css`
- `backend/src/main/resources/static/js/consulta-reservas-page.js`
- `backend/src/main/resources/static/js/consulta-reservas.js`
- `backend/src/main/resources/static/js/datas.js`
- `backend/src/main/resources/static/js/navegacao.js`
- `backend/src/main/resources/static/js/reservas.js`
- `backend/src/main/resources/static/pages/minhas-reservas.html`
- `docs/README.md`
- `docs/RTM.md`
- `docs/api/frontend-integracao.md`
- `docs/api/reservas-consulta-contrato.md`
- `docs/api/reservas-contrato.md`
- `docs/integracao/marcos-e2e-local.md`
- `docs/integracao/marcos-pendencias-2026-11-12.md`
- `docs/planejamento/marcos-fechamento-etapas-1-a-5.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/qualidade/defeitos-frontend.md`
- `docs/stories/marcos-3.md`
- `docs/stories/marcos-3-consulta-edicao.md`
- `docs/testes/marcos-3-consulta-edicao-resultados.md`
- `docs/testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md`
- `docs/testes/marcos-3-consulta-edicao/arvore-testada.json`
- `docs/testes/marcos-3-consulta-edicao/build-final.txt`
- `docs/testes/marcos-3-consulta-edicao/build-intermediario.txt`
- `docs/testes/marcos-3-consulta-edicao/build-primeira-rodada.txt`
- `docs/testes/marcos-3-consulta-edicao/cancelamento-real.png`
- `docs/testes/marcos-3-consulta-edicao/e2e-final.json`
- `docs/testes/marcos-3-consulta-edicao/e2e-intermediario.json`
- `docs/testes/marcos-3-consulta-edicao/e2e-primeira-rodada.json`
- `docs/testes/marcos-3-consulta-edicao/edicao-real.png`
- `docs/testes/marcos-3-consulta-edicao/navegador-final.json`
- `docs/testes/marcos-3-consulta-edicao/navegador-intermediario.json`
- `docs/testes/marcos-3-consulta-edicao/navegador-primeira-rodada.json`
- `docs/testes/marcos-3-consulta-edicao/reservas-mobile.png`
- `docs/testes/marcos-3-consulta-edicao/smoke-real.json`
- `tests/browser/acesso.spec.js`
- `tests/browser/consulta-reservas.spec.js`
- `tests/e2e-local/validar-consulta-reservas.cjs`
- `tests/e2e-local/validar.cjs`
- `tests/unit/frontend/consulta-reservas.test.js`

JAR, ferramentas, configuração privada, dados de teste, credenciais e logs brutos permanecem nos caminhos ignorados já definidos; não são arquivos destinados ao commit.

## QA Results

**PASS técnico local — AIOX QA (Quinn), revisão assistida independente em 12/11/2026.** Inspecionados cliente, página/HTML/CSS, navegação, testes, helper real, contratos/fontes de domínio e evidências finais. A revisão não executou Git, suítes ou serviços e não acessou credenciais privadas. Nenhum achado alto/crítico pendente neste recorte.

Permissões de edição/cancelamento correspondem ao comportamento observado do domínio, sem herdar escrita por acesso de leitura. O detalhe autorizado completo precede as ações; seleção original é preservada entre páginas e diante da ocupação pela própria reserva. Identidade/estado/intervalo/conjunto são conferidos nas respostas, cada ISO original não alterado é mantido e operações incertas/conflitos exigem nova leitura e confirmação. O guard impede repetição/troca de alvo durante a operação; sucesso confirmado é preservado quando uma atualização posterior falha. Projeções/textos são explícitos e seguros.

**FE-005/P2 resolvido:** recurso novo restrito não é oferecido para reserva comum, mantendo os originais e a decisão final do backend; regressão nas duas viewports. **FE-006/P3 resolvido no fluxo declarado:** comparador compartilhado preciso usado no leitor/filtros/editor/transporte, com leitura e PATCH controlados de `.123001` a `.123002` sem truncar. O limite anterior da pesquisa compartilhada para intervalos menores que 1ms está documentado, sem alegar cobertura dessa busca. O helper de fixture valida igualdade/forma do código gerado antes do SQL restrito aos IDs novos, além de conferir perfil e instância locais.

Conferidos [build final 81 unitários/278 navegador](../testes/marcos-3-consulta-edicao/build-final.txt), lint/typecheck aprovados, [E2E real 8/0](../testes/marcos-3-consulta-edicao/e2e-final.json) e [smoke 16/0/0](../testes/marcos-3-consulta-edicao/smoke-real.json). Os oito hashes da evidência E2E e os doze do manifesto da árvore foram recalculados e correspondem aos arquivos atuais; sete fontes servidas pelo JAR foram conferidas na execução real, incluindo datas.js/reservas.js. O E2E comprova preservação de frações em reservas de uma hora, conflito 409/reconsulta, edição/inclusão, consulta do Responsável sem ações do dono, cancelamento do dono/Administrador, persistência e layout móvel; o intervalo submilissegundo pertence à regressão controlada. Captura móvel inspecionada sem overflow aparente; isso não é aceite visual de Marcos. [Resultados e tentativas preservadas](../testes/marcos-3-consulta-edicao-resultados.md).

Checklist, Completion Notes, File List, contratos/consumo, plano/RTM e defeitos foram atualizados. Package com testes Maven omitidos, testes controlados, provas reais e resultados remotos permanecem separados. Este PASS técnico mantém Ready for Review: ainda faltam aceite visual de Marcos, revisão humana da equipe, checks/CodeRabbit/Sonar, ratificações coletivas/processo de vínculos e os cenários restantes da matriz integrada. Não declara Done, entrega integrada das etapas 1–5 ou autorização de commit, push, PR ou merge.
