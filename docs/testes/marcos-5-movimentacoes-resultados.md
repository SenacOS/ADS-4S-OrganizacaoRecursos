# Movimentações — complemento da etapa 5

Data: 11/11/2026, America/Sao_Paulo. Branch feature/marcos-movimentacoes, baseada em c395541. Story: [Marcos-5-Movimentações](../stories/marcos-5-movimentacoes.md).

Estado: INCREMENTO LOCAL ENCERRADO com aceite visual e solicitação de commit por Marcos em 11/11/2026; story Ready for Review. Retirada, pendências e devolução implementadas na camada cliente completam a implementação local da etapa 5 junto à administração. Administração/PR 20 seguem separados. Não inclui Q9, fila, histórico completo ou relatórios. Revisão da equipe, CI e integração real permanecem pendentes.

## Reprodução

Com dependências já instaladas e Chrome disponível, no CMD:

```bat
set "PLAYWRIGHT_CHANNEL=chrome"
npm run build
```

No PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run build
```

Ambiente desta sessão: Windows, Node v26.13.0, npm 11.20.0, Playwright 1.65.0 e Chrome 157.0.8103.39 em modo headless. Viewports desktop 1366 × 900 e móvel 390 × 844; testes de movimentações usam Asia/Tokyo, exibindo São Paulo explicitamente. Nenhuma dependência nova foi instalada. A suíte/navegador exigem execução autorizada fora do sandbox devido à restrição de spawn já observada neste ambiente. Servidor gerenciado pelo Playwright encerrado ao fim; confirmada ausência de escuta em 4173.

## Resultados

| Verificação | Resultado |
|---|---|
| npm run lint | Aprovado sem diagnósticos |
| npm run typecheck | Aprovado, checkJs/noEmit estrito |
| npm run test:unit | 57 aprovados: 12 novos e 45 regressões |
| npm run test:browser | 190 aprovados: 60 de movimentações e 130 regressões, zero falhas/ignorados/retries |
| npm run build | Exit code 0; agrega todos os gates acima |

Rodada final do navegador: início 11/11/2026 às 16:12:10 em São Paulo (19:12:10 UTC), duração 115,065 s, reportada como 1,9 min. [Saída integral](marcos-5-movimentacoes-verificacao.txt) e [JSON final](marcos-5-movimentacoes/resultados.json). Logs normalizados somente em UTF-8 e espaços finais de terminal, preservando comandos/mensagens/resultados. Não se repetiu a suíte após alterações exclusivamente documentais para registrar a execução.

## Reexecução pelo Marcos

Em 11/11/2026 foi recebida a [saída do CMD fornecida por Marcos](marcos-5-movimentacoes-verificacao-marcos.txt): npm run build concluiu lint e typecheck sem diagnósticos, 57 testes unitários aprovados com zero falhas/ignorados e 190 testes de navegador aprovados, reportados em 1,9 min.

O arquivo foi preservado integralmente, com hash conferido, sem substituir os logs e relatórios anteriores. O anexo não informa versões, canal do navegador ou instante da reexecução. Este registro comprova a execução automatizada apresentada pelo autor; não presume aceite visual nem revisão humana de outro integrante. O assistente alterou apenas a documentação para registrar esta evidência, sem nova execução dos testes ou mudança no produto. O aceite visual posterior está registrado abaixo.

## Aceite visual e autorização de commit

Em 11/11/2026, a pedido de Marcos, foi aberta uma janela visível do Chrome na página de movimentações com perfil Responsável e fixtures dos testes. O auxiliar temporário ficou fora do repositório e interceptou a API apenas nessa sessão, com identificação de dados fictícios. A prévia apresentou retirada, pendências, prazo ultrapassado e devolução; produto e testes aprovados não foram modificados para a demonstração.

Após a abertura, Marcos informou "testado! podemos fazer o commit". Aceite do incremento local e autorização de commit registrados; não se atribui ao autor teste manual de todos os cenários, revisão de outro integrante ou integração com o backend real. Administração e movimentações encerram a implementação local da etapa 5. Atualizações posteriores são documentais e não justificam repetir a suíte já aprovada.

## Primeira rodada e revisão

A primeira suíte completa passou lint, checkJs, 57 testes unitários e 180 execuções de navegador. [Saída da primeira rodada](marcos-5-movimentacoes-primeira-execucao.txt) e [JSON original](marcos-5-movimentacoes/primeira-execucao.json).

A revisão assistida AIOX QA encontrou um caso não detectado por essa primeira suíte: depois de rede/resposta incoerente, a confirmação antiga ainda permitia outro envio sem a reconsulta prevista na story. Foram adicionadas flags de operação incerta, invalidação de confirmação e recuperação somente após GET de pendências bem-sucedido, seguido de nova confirmação. Se a consulta encontrar retirada do material, a seleção é descartada e o usuário é orientado a conferir a pendência, sem atribuir confirmação à escrita cuja resposta se perdeu.

As regressões foram ampliadas para rede/resposta incoerente nas duas escritas, tentativa de novo submit antes de consultar, GET falho não liberando reenvio, detalhe antigo após atualização e duplo envio de retirada. A primeira rodada aprovada foi preservada; não se afirma que ela cobria o caso encontrado nem que houve TDD retroativo. Registro [FE-003](../qualidade/defeitos-frontend.md#fe-003--confirmação-anterior-permitia-reenvio-após-operação-incerta).

## Capturas

Conferência visual de desenvolvimento com dados fictícios e API controlada, sem afirmar certificação de acessibilidade ou validação integrada.

- [Pendências desktop](marcos-5-movimentacoes/pendencias-desktop.png) e [pendências móvel](marcos-5-movimentacoes/pendencias-mobile.png).
- [Retirada confirmada desktop](marcos-5-movimentacoes/retirada-desktop.png) e [retirada confirmada móvel](marcos-5-movimentacoes/retirada-mobile.png).

## O que foi verificado

- Perfis antes de consultas: Solicitante sem dados; Administrador em leitura; Responsável com operações. 401 segue ao login.
- Pendências em array simples abertas=true, sem paginação/filtros inventados e sem consulta de reservas.
- Número da reserva do comprovante, pesquisa MATERIAL/patrimônio paginada, seleção explícita e confirmação invalidada ao mudar contexto.
- POST de retirada somente com IDs; servidor informa operador/horários. Sucesso validado antes de mostrar confirmação.
- Identificação por detalhe autenticado em pequenos lotes; 404/inativo/falha preservam número do material e possibilidade de devolução. Resposta antiga não contamina lista posterior.
- Instant com Z/fração exibido em São Paulo; par de devolução coerente; duplicatas e respostas divergentes recusadas.
- Retirada continua aberta após o prazo com atrasoSegundos zero; prazo ultrapassado é estimativa identificada, sem liberação automática do material.
- Devolução confirmada sem corpo, retorno idempotente por outro operador e atraso final do servidor, sem prometer nova disponibilidade/notificação.
- CSRF dinâmico, guard, bloqueio de área, não repetição de escritas, preservação em falhas e distinção entre escrita confirmada e GET posterior falho.
- Erros, referência de suporte, textos literais/XSS, teclado, foco, largura móvel/desktop e ausência de erros JavaScript não tratados.

## Limites e pendências

Mocks estão exclusivamente nos testes; o preview continua estático sem simular sessão/API. Java, application.yml, provedores, flags e dependências não foram alterados. A leitura de pendências pertence ao contrato de movimentações, não à Q9; nenhuma política de acesso de reservas foi decidida por esta UI.

Testes com API controlada não comprovam autenticação/CSRF/autorização reais, MySQL, eventos transacionais, auditoria, notificações ou concorrência. Não se presume que uma falha de rede impediu persistência.

Reexecução automatizada, aceite visual e solicitação de commit pelo Marcos registrados acima. Revisão humana de outro integrante, CodeRabbit/CI e integração real permanecem pendentes. CodeRabbit não foi executado neste ambiente: CLI ausente e WSL não instalado, conforme verificação registrada no incremento administrativo; não se declara aprovação dessa ferramenta.

Parecer assistido AIOX QA: PASS no recorte local, com FE-003 corrigido e sem finding material remanescente. Revisou contratos Java/item18, fonte, testes, documentação, checklist/File List, capturas e evidência final, sem repetir a suíte ou alterar arquivos. Não substitui aceite do autor, revisão humana, CI ou integração real.

## Autoavaliação

Checklists de DoD/self-critique aplicados aos riscos: confirmação obsoleta após operação incerta; identidade de detalhe misturada entre consultas; idempotência de devolução atribuir operador errado; passagem do prazo esconder material; falha de GET pós-escrita induzir replay. Tratamentos estão no código e nas regressões descritas acima. Fronteiras: lista vazia versus indisponível; cadastro inativo/404; múltiplos patrimônios por busca parcial; campos nullable pareados; instantes com Z/fração; relógio do navegador diferente do operacional. Essa autoavaliação não substitui revisão independente nem cobertura global do projeto. [Registro](marcos-5-movimentacoes/autoavaliacao.json).
