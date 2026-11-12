# Marcos-5 — administração de recursos, manutenção e expediente

Data: 11/11/2026, America/Sao_Paulo. Branch local: feature/marcos-5-administracao-recursos, base a10e0b5.

Estado: INCREMENTO LOCAL DO FRONTEND ENCERRADO COM ACEITE DE MARCOS em 11/11/2026. Incremento independente da fila e da Q9; não inclui movimentações nem a entrega integrada de toda a etapa 5. Story Ready for Review; commit local autorizado pelo autor. Integração real, revisão de outro integrante, CodeRabbit e CI permanecem pendentes.

## Reprodução

Na raiz, com dependências instaladas e Chrome disponível, no CMD:

```bat
set "PLAYWRIGHT_CHANNEL=chrome"
npm run build
```

No PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run build
```

Também é possível instalar o Chromium com npx playwright install chromium e omitir o canal. Não desativar a validação TLS para contornar certificado da rede. Node/npm/Playwright são ferramentas de desenvolvimento; não houve alteração de dependências nem compilação do produto.

Ambiente observado nesta sessão: Windows, Node v26.13.0, npm 11.20.0, Playwright 1.65.0, Chrome 157.0.8103.39 instalado em modo headless. Testes usam desktop 1366 × 900 e móvel 390 × 844. Casos administrativos executam com navegador em Asia/Tokyo para conferir conversão explícita para São Paulo. Processos de testes e navegador exigiram execução autorizada fora do sandbox, que bloqueou spawn com EPERM.

## Resultados

| Verificação | Resultado |
|---|---|
| npm run lint | Aprovado, sem diagnósticos |
| npm run typecheck | Aprovado, checkJs/noEmit estrito |
| npm run test:unit | 45 aprovados: 13 novos e 32 regressões |
| npm run test:browser | 130 aprovados: 54 administrativos e 76 regressões, zero falhas/ignorados/retries |
| npm run build | Exit code 0; agrega todos os gates acima |

Rodada final do navegador: início 11/11/2026 às 14:17:40 em São Paulo (17:17:40 UTC), duração 319,284 s, reportado como 5,3 min. [Saída integral](marcos-5-verificacao.txt) e [relatório JSON](marcos-5/resultados.json). Não se reexecutou a suíte após os ajustes exclusivamente documentais feitos para registrar esse resultado. Servidor de teste gerenciado pelo Playwright e encerrado ao final.

## Reexecução pelo Marcos

Em 11/11/2026, Marcos forneceu a [saída do próprio terminal](marcos-5-verificacao-marcos.txt). Executou set PLAYWRIGHT_CHANNEL=chrome no CMD seguido de npm run build: lint e typecheck sem diagnósticos, 45 testes unitários aprovados com zero falhas/ignorados e 130 testes de navegador aprovados, reportados em 1,3 min.

O anexo foi preservado integralmente em arquivo separado, com hash conferido; as evidências anteriores não foram substituídas. O terminal não informa as versões de Node/Chrome nem o instante da reexecução. Este registro confirma os testes automatizados executados pelo autor; o aceite visual e a revisão humana de outro integrante são registros separados. Nenhum teste foi reexecutado pelo assistente ou código alterado para registrar esta evidência.

## Revisão visual e aceite local

A pedido de Marcos, foi aberta uma janela do Chrome em perfil Administrador com o aviso REVISÃO VISUAL · DADOS FICTÍCIOS. Um auxiliar de teste manual em pasta temporária, fora do projeto, reutilizou fixtures dos testes e interceptou a API apenas nessa sessão de navegador. A aplicação permaneceu inalterada; o servidor de preview oficial continua servindo somente arquivos, sem API simulada. Mudanças da revisão manual ficaram em memória, sem banco ou persistência no projeto.

Após a abertura dessa prévia, Marcos solicitou o commit em 11/11/2026, registrando o aceite do incremento local. Não se atribui revisão independente ou execução manual de todos os cenários a esse aceite. O commit inclui implementação, testes, documentação e evidências; exclui o auxiliar temporário. Integração real, movimentações e revisão de outro integrante permanecem pendentes.

## Primeira rodada e ajustes

A primeira rodada completa passou lint/checkJs e os 45 testes unitários. Dos 122 testes de navegador, 118 passaram e quatro falharam: dois cenários em cada viewport verificavam toBeDisabled no próprio fieldset. O DOM já continha disabled, mas esse matcher não representava o estado daquele elemento. O teste foi corrigido para conferir o atributo e a desabilitação efetiva de botões descendentes, mantendo a verificação funcional de troca de alvo e envio único. [Log original](marcos-5-primeira-execucao.txt) e [relatório original](marcos-5/primeira-execucao.json).

No arquivo de texto da primeira rodada, foram normalizados somente a codificação UTF-8 e os espaços finais gerados pelo terminal para versionamento. Comandos, mensagens e resultados foram mantidos. A saída fornecida pelo Marcos permanece integralmente idêntica ao anexo recebido.

Na revisão, foi identificado que uma falha de pesquisa mantinha o resumo Consultando recursos mesmo após o feedback de erro. O resumo passou a indicar Consulta não concluída, com teste de falha e recuperação explícita: [FE-002](../qualidade/defeitos-frontend.md#fe-002--resumo-de-pesquisa-permanecia-em-carregamento-após-falha). Foram acrescentadas verificações de confirmação de inativação pelo PUT e de bloqueio confirmado seguido de falha no GET de atualização. Não se afirma TDD retroativo pela existência dessas correções.

## Capturas

Dados fictícios e respostas controladas nos testes; não são capturas de integração real. Conferência visual de desenvolvimento, com layout adaptado às duas larguras.

- [Gestão desktop](marcos-5/gestao-desktop.png) e [gestão móvel](marcos-5/gestao-mobile.png).
- [Edição/manutenção desktop](marcos-5/edicao-desktop.png) e [edição/manutenção móvel](marcos-5/edicao-mobile.png).
- [Expediente desktop](marcos-5/expediente-desktop.png) e [expediente móvel](marcos-5/expediente-mobile.png).

## Comportamentos verificados

- Perfil conferido antes das consultas administrativas; Solicitante/Responsável não consultam dados pela URL direta. Sessão ausente segue ao login.
- Pesquisa/paginação do servidor, filtros codificados, inativos, vazio e recuperação de falhas.
- Sala, docente e material, campos por tipo, competências vazias e condição livre; whitelist de corpos; nenhum envio de identidade ou envelope.
- GET de detalhe antes de editar, PUT completo, tipo imutável e bloqueio de troca de alvo durante leitura.
- Desativação confirmada, 204, conflito preservando o estado; confirmação também ao marcar inativo no PUT.
- Bloqueio multidia no fuso operacional, DTO snake_case, 409 preservando campos e cancelamento confirmado.
- Expediente completo, múltiplos dias/janelas, precisão de nanossegundos preservada, sobreposição recusada, fechamento explícito e leitura obrigatória antes de editar.
- CSRF dinâmico, 403 sem replay, envio único, resposta incoerente/rede sem sucesso falso, suporte separado e textos recebidos da API sem interpretação como HTML.
- Teclado, foco, estados, viewports e ausência de erros JavaScript não tratados; sem afirmar certificação de acessibilidade.

## Limites

Mocks ficam somente nos testes. O preview não fornece sessão fictícia nem respostas da API. Não foram alterados Java, application.yml ou flags. Os testes não provam autorização/CSRF reais do Spring, MySQL, auditoria, notificações ou concorrência do servidor.

Marcos-4 permanece no outro computador, fora deste checkout. A branch separada preserva a independência desta frente; conciliar alterações compartilhadas na navegação/testes quando o trabalho de casa for recuperado. Nenhuma leitura de reservas, fila ou decisão Q9 foi implementada aqui.

Movimentações, backend real, revisão de outro integrante e CI continuam pendentes. Marcos deu o aceite local e autorizou o commit. CodeRabbit não foi executado: CLI não encontrado e wsl --list --quiet informou que o subsistema não está instalado (exit 1). Não foram instaladas ferramentas para contornar essa limitação e não se declara aprovação do CodeRabbit.

Revisão assistida AIOX QA: PASS no incremento local, sem defeito material/bloqueante remanescente. Conferiu fonte, contrato Java/item18, testes, documentação, checklist/File List e a evidência final, sem reexecutar a suíte ou editar arquivos. O achado FE-002 foi corrigido antes do parecer final. Não substitui revisão humana, integração ou CI.

## Autoavaliação de desenvolvimento

Riscos examinados: resposta de detalhe misturar recursos (área serializada e GET antes de editar); PUT omitir campos ou alterar tipo (whitelist completa e comparação); expediente perder dias ou precisão (edição da coleção inteira com horários originais preservados); falha de atualização esconder escrita confirmada (mensagens separadas e ausência de replay); acesso direto expor dados (perfil antes de consultas).

Casos de fronteira: zero janelas com fechamento confirmado; janelas adjacentes versus sobrepostas; competências vazias e normalizadas; bloco de vários dias; inativos e desativação com compromissos; rede após uma escrita potencialmente persistida. Checklists de DoD e self-critique usados como autoavaliação; não constituem revisão independente ou cobertura global do projeto. [Registro de autoavaliação](marcos-5/autoavaliacao.json).
