# Marcos-4 — conciliação com administração e movimentações

Data: 11/11/2026, America/Sao_Paulo. Branch `feature/marcos-4-aprovacoes`, base `f7360a238ac36ea672955c421ee44557436f1c7c` de movimentações, que já inclui a administração `c395541`. [Story Marcos-4](../stories/marcos-4.md).

**Estado: CONCILIADO E VALIDADO LOCALMENTE, COM REEXECUÇÃO AUTOMATIZADA PELO MARCOS APROVADA E COMMIT LOCAL AUTORIZADO.** Incremento de frontend Ready for Review. O pedido de commit não descreve separadamente uma revisão visual; backend real, revisão independente e CI continuam pendentes. Push e novo PR permanecem separados.

## Preservação e conciliação

A pasta original do projeto permanece em `feature/marcos-base-frontend`, HEAD `a10e0b5`, com suas alterações locais. Antes da conciliação foram copiados 29 arquivos modificados/não rastreados e conferidos seus hashes SHA-256. O backup e o manifesto estão em `.aiox-core/local/backups/marcos-4-20261111T215943Z`, na pasta original, ignorados pelo Git.

O checkout de trabalho está em `.aiox-core/local/wt/m4` da pasta original. A branch nova parte de movimentações, mantendo os commits e as evidências dos incrementos anteriores. A preparação da Marcos-4 foi aplicada por comparação com a base comum `a10e0b5`; seis divergências em documentação/testes foram conciliadas e a navegação combinada foi conferida.

- Solicitante mantém pesquisa e criação; Responsável recebe também Aprovações e Movimentações; Administrador recebe Gestão e Movimentações. Os testes conferem contagem, href e existência das páginas conforme o perfil.
- Aprovação/rejeição seguem exclusivas do Responsável. A ajuda da fila descreve recursos sob sua responsabilidade, conforme a [Q9 comunicada](../api/reservas-politica-leitura-q9.md). A aplicação desse escopo no servidor ainda depende do backend.
- Administração, bloqueios/expediente e movimentações foram preservados. Nenhuma mudança em Java, flags, contratos de escrita do produto, package.json, lockfile ou configuração de timeout/retries.
- Os registros de 10/11 da Marcos-4 e de 11/11 da etapa 5 continuam identificados por suas respectivas execuções; as contagens dessas execuções não são somadas como uma validação conjunta.

## Reprodução no checkout correto

Partindo da pasta original do projeto, em PowerShell:

```powershell
Set-Location '.aiox-core\local\wt\m4'
git branch --show-current
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run build
```

No CMD, partindo da mesma pasta original:

```bat
cd .aiox-core\local\wt\m4
git branch --show-current
set "PLAYWRIGHT_CHANNEL=chrome"
npm run build
```

A conferência da branch deve retornar `feature/marcos-4-aprovacoes`. Na execução do assistente foram reutilizadas as dependências já instaladas na pasta original, resolvidas pelo Node a partir desse checkout interno; package.json e lockfile são os mesmos. Em outro clone ou sem instalação disponível, executar `npm ci` antes dos gates. Não desativar validação de certificados.

Ambiente: Windows x64, Node v24.22.2, npm 11.19.1, Playwright 1.65.0 e Chrome 157.0.8103.39 headless. Viewports 1366 × 900 e 390 × 844; cenários dos fluxos usam também Asia/Tokyo para verificar o fuso operacional de São Paulo.

## Primeira execução e diagnóstico

A primeira execução passou lint, typecheck e 68 unitários. No navegador, 237 passaram e um falhou: cenário móvel de identificação antiga de material. O erro foi `Test timeout of 15000ms exceeded while setting up "context"`, antes do corpo do teste, sem falha de uma asserção do produto nesse cenário. O relatório registra 877,622 s para a execução; a causa específica da demora de criação do contexto não foi determinada.

[Log da primeira execução](marcos-4-conciliacao-primeira-execucao.txt), [resumo JSON com o erro](marcos-4-conciliacao/primeira-execucao.json) e [contexto da falha](marcos-4-conciliacao/primeira-falha-contexto.md). Logs normalizados em UTF-8 e sem espaços finais de terminal; o arquivo binário original, o JSON completo e o trace foram preservados no backup local.

Sem alterar código, timeout ou retries, o cenário foi executado três vezes em desktop e três em móvel: **6 aprovados em 18,8 s**. [Log do diagnóstico](marcos-4-conciliacao-diagnostico.txt). A nova regressão completa abaixo passou, incluindo esse cenário nas duas viewports. Não se determinou a causa específica do timeout de preparação, nem foi atribuída correção de produto a uma reexecução.

## Resultado final

| Gate | Resultado |
|---|---|
| npm run lint | Sem diagnósticos |
| npm run typecheck | Sem diagnósticos |
| npm run test:unit | 68 aprovados; zero falhas |
| npm run test:browser | 238 aprovados; zero falhas, ignorados ou retries |
| npm run build | Exit code 0 |

Execução final do navegador iniciada em 11/11/2026 às 19:22:01 de São Paulo (22:22:01 UTC), duração 481,362 s, reportada como 8,0 min. São 119 execuções por viewport: 30 de acesso, 46 de pesquisa/criação, 54 administrativas, 60 de movimentações e 48 da fila no conjunto. Os números vêm desta execução, não da soma de evidências anteriores.

[Log final](marcos-4-conciliacao-verificacao.txt), [ambiente/contagens/hashes do código](marcos-4-conciliacao/resultados.json) e [autoavaliação/DoD](marcos-4-conciliacao/autoavaliacao.json). Depois dessa execução, os ajustes restantes são documentais. Dependências, configuração de testes e código específico da etapa 5 foram preservados.

As quatro capturas abaixo foram produzidas nesta execução e inspecionadas pelo agente para composição, legibilidade, navegação e estados. Os testes verificaram teclado/foco e largura; não se declara certificação de acessibilidade ou aceite visual do Marcos.

- [Fila e detalhes desktop](marcos-4-conciliacao/fila-desktop.png).
- [Fila e detalhes móvel](marcos-4-conciliacao/fila-mobile.png).
- [Decisão confirmada desktop](marcos-4-conciliacao/decisao-desktop.png).
- [Decisão confirmada móvel](marcos-4-conciliacao/decisao-mobile.png).

## Validação humana e limites

### Saída fornecida por Marcos — pasta original

Recebida em 11/11/2026 a [saída do terminal fornecida por Marcos](marcos-4-conciliacao-verificacao-marcos-pasta-original.txt), preservada integralmente e conferida por SHA-256. O prompt mostra execução de `npm run build` na pasta original `ADS-4S-OrganizacaoRecursos`, sem entrar em `.aiox-core/local/wt/m4`.

O registro apresenta lint/typecheck sem diagnósticos, 43 testes unitários aprovados (zero falhas/ignorados) e 124 testes de navegador aprovados em 2,2 min. As suítes administrativas e de movimentações não aparecem nessa execução; as contagens correspondem ao recorte da Marcos-4 anterior à conciliação. É uma reexecução aprovada pelo autor desse recorte, preservada separadamente da execução conjunta do assistente.

O anexo não informa versões, canal do navegador, commit, instante da execução ou código numérico de saída. A data acima é de recebimento no contexto da sessão. Não se atribui essa primeira evidência à branch conciliada, ao aceite visual ou ao E2E com backend real. A reexecução do conjunto foi recebida posteriormente e está registrada a seguir.

### Reexecução do conjunto pelo Marcos — checkout conciliado

Recebida em 11/11/2026 a [nova saída fornecida pelo Marcos](marcos-4-conciliacao-verificacao-marcos.txt). O prompt mostra `npm run build` em `.aiox-core/local/wt/m4`, o checkout de conciliação. Lint e typecheck passaram sem diagnósticos, os **68 unitários passaram** (zero falhas/ignorados) e os **238 testes de navegador passaram em 6,3 min**. A lista numerada de 1 a 238 foi conferida; inclui administração, movimentações e aprovações.

O anexo foi preservado integralmente e conferido por SHA-256, em arquivo separado das execuções anteriores. Os hashes do código continuam iguais aos da regressão aprovada do assistente. A saída não informa versões, canal, commit, instante ou código numérico de saída; esses dados não são atribuídos à reexecução. A data é de recebimento na sessão. O registro comprova os testes automatizados apresentados pelo autor; aceite visual, revisão independente e backend real permanecem separados. Nenhum teste foi reexecutado pelo assistente nem código alterado para registrar essa evidência.

### Revisão visual e integração

Após a reexecução aprovada, Marcos solicitou em 11/11/2026: "vamos fazer o commit". A instrução autoriza versionar o incremento local e foi registrada sem solicitar nova confirmação. Não se atribui por inferência teste visual detalhado de todos os fluxos, revisão independente ou E2E integrado ao pedido. Este registro foi preparado antes do commit; o hash resultante deve ser consultado no histórico Git.

A revisão do código, os cenários automatizados e as capturas do agente não substituem os testes executados por Marcos, o aceite visual informado por ele ou revisão de outro integrante. A validação humana da Marcos-4 conciliada continua pendente.

Foi aberta uma prévia visual no Chrome em `http://127.0.0.1:4174/pages/aprovacoes.html`, com auxiliar temporário fora do produto, fixtures de `tests/browser/aprovacoes.spec.js`, perfil Responsável e aviso de dados fictícios. A API é interceptada apenas nessa janela do Chrome. O auxiliar está no backup local e termina ao fechar o navegador; a porta separada não ocupa 4173 dos testes. O servidor normal `npm run preview` continua estático e não simula sessão ou dados. Nenhum auxiliar de demonstração integra o commit. A abertura não presume aceite visual de Marcos.

Roteiro sugerido para Marcos: abrir uma solicitação, conferir solicitante/período/recursos, aprovar, rejeitar outra com motivo, verificar recarga/vazio, limpar/aplicar filtros e conferir o layout/teclado. A prévia permite reiniciar os dados de exemplo. Outras páginas mantêm suas próprias evidências e testes; a prévia da fila não simula seus contratos.

GET/SQL/controller da fila, vínculo responsável/recurso e segurança real, além de MySQL, auditoria, notificações e E2E integrado, continuam com a equipe. O cliente não inventa um campo de vínculo nem tenta aplicar essa autorização localmente. CodeRabbit não executado: CLI ausente e WSL não instalado; sem parecer de QA independente ou CI atribuído a esta rodada.

- [x] Regressão conjunta aprovada e evidências finais conferidas.
- [x] Reexecução dos testes pelo Marcos: 68 unitários/238 navegador, 6,3 min, no checkout conciliado.
- [ ] Aceite visual da Marcos-4 conciliada informado por Marcos.
- [x] Commit solicitado explicitamente por Marcos após a reexecução aprovada.
- [ ] Push pelo usuário e PR baseado em movimentações, conforme a cadeia vigente.
- [ ] Revisão independente, backend real e CI antes da entrega integrada.
