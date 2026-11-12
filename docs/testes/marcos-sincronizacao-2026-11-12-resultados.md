# Marcos-4 — sincronização com a develop após o PR #23

Data: **12/11/2026**, America/Sao_Paulo. Branch: `feature/marcos-4-aprovacoes`.

Marcos solicitou: “vamos fazer a sincronização”. Foram atualizadas as referências remotas, criada a branch local acompanhando a origem e incorporada a develop atual. O merge foi preparado sem commit automático para permitir conferência e testes antes do registro local. Não houve conflito nem alteração manual no código importado.

## Origem e preservação

| Referência | Commit |
|---|---|
| Checkout antes da sincronização | feature/marcos-movimentacoes, f7360a238ac36ea672955c421ee44557436f1c7c |
| Marcos-4 trazida do GitHub | df5706327ce76aac67cec3935b9749ec96e68573 |
| Develop incorporada, após merge do PR #23 | 23cf839b6684ee5b53b7d85b5b1aa7964e83fbdd |

O plano local não versionado foi copiado antes da troca de branch, com hash SHA-256 conferido. Permaneceu idêntico durante a troca e só foi atualizado posteriormente para registrar esta execução. Backup/manifesto em `.aiox-core/local/backups/marcos-sincronizacao-20261112T135039Z`, ignorado pelo Git.

O merge importou os 12 arquivos de backend/documentação já presentes na develop: adaptador `ReservaFilaMysql`, migração V5, ajustes no POM, testes MySQL e documentos do item18/contratos. Esse trabalho mantém a autoria e os commits da equipe. Nenhum Java ou regra foi implementado por Marcos nesta sincronização.

Os **45 arquivos rastreados** do frontend, testes e configuração de desenvolvimento foram conferidos em relação a df57063: sem diferenças no produto, nas dependências ou nos testes. A lista de blobs foi preservada no backup; seu hash consta no [resumo JSON](marcos-sincronizacao-2026-11-12.json). A comparação da árvore resultante com a develop mantém o incremento de Aprovações e sua documentação, sem reintroduzir administração/movimentações como trabalho novo.

## Reprodução e ambiente

No PowerShell, na raiz do projeto:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run build
```

Windows x64, Node v26.13.0, npm 11.20.0, Playwright 1.65.0, Chrome instalado 157.0.8103.78. Execução headless nos viewports desktop 1366 × 900 e móvel 390 × 844. Casos dos fluxos usam Asia/Tokyo para conferir a apresentação operacional em São Paulo.

A execução precisou de permissão de processo fora do sandbox para iniciar Node/Chrome, conforme a restrição já conhecida desta máquina. Nenhuma dependência foi instalada, nem timeout/retries alterados. A variável NO_COLOR foi removida apenas do processo de execução para evitar conflito com FORCE_COLOR.

## Resultado real

| Verificação | Resultado |
|---|---|
| Lint | Aprovado, sem diagnósticos |
| Typecheck | Aprovado, sem diagnósticos |
| Unitários | 68 aprovados, zero falhas/ignorados |
| Navegador | 238 aprovados; 119 desktop e 119 móvel |
| Falhas / ignorados / flaky / retries no navegador | Zero |
| npm run build | Exit code 0 |

Playwright iniciou em **12/11/2026 às 10:53:30 de São Paulo**, 13:53:30 UTC. Duração: **143,185 s**, reportada como **2,4 min**. São 238 tentativas aprovadas, sem repetições, cobrindo acesso, pesquisa/criação, administração, movimentações e fila.

[Saída do terminal](marcos-sincronizacao-2026-11-12-verificacao.txt) e [resumo derivado do relatório Playwright](marcos-sincronizacao-2026-11-12.json). O log versionado foi normalizado somente para UTF-8 e remoção de espaços finais de terminal; original e JSON completo do Playwright preservados no backup local. As evidências de 10 e 11/11 permanecem inalteradas.

Após esta execução, as alterações próprias desta sincronização são documentais: plano, story, RTM e este registro. Não foi repetida a suíte para esses ajustes documentais. O hash do commit de integração resultante deve ser consultado no histórico Git; os dois pais estão identificados acima.

## PR, continuidade e limites

O PR #24 foi conferido: aberto em Draft, origem `feature/marcos-4-aprovacoes`, destino `develop`, head remoto df57063 durante a execução. O PR #23 já está mesclado. A sincronização é local; não houve push, alteração de PR ou mensagem para a equipe nesta etapa.

A aprovação dos testes com API controlada comprova a regressão do cliente. Não houve execução de Maven, Spring/MySQL ou E2E real nesta máquina, nova revisão independente ou novo aceite visual de Marcos. Não se presume correção do Sonar pela aprovação local: a CI pós-merge anteriormente conferida da develop passou nas etapas de testes/JaCoCo e JMeter e falhou na etapa Sonar.

O adaptador SQL da fila está presente, mas controller HTTP, autorização do escopo Q9, leituras gerais/detalhe e validação integrada continuam pendentes conforme o contrato. O aceite visual detalhado da Marcos-4 permanece a registrar. Nenhuma permissão, flag ou provedor foi criado para contornar essas dependências.

## Arquivos documentais desta sincronização

- `docs/planejamento/marcos-fechamento-etapas-1-a-5.md`
- `docs/stories/marcos-4.md`
- `docs/RTM.md`
- `docs/testes/marcos-sincronizacao-2026-11-12-resultados.md`
- `docs/testes/marcos-sincronizacao-2026-11-12-verificacao.txt`
- `docs/testes/marcos-sincronizacao-2026-11-12.json`

Os arquivos importados por merge são identificados na comparação Git entre os pais e a árvore de integração; não representam novo desenvolvimento de backend por Marcos.
