# Marcos-integracao-datas-1 — Aceitar datas de resposta com precisão de minuto

## Status

Ready for Review

Correção estreita de defeito observado durante o E2E local autorizado por Marcos em **12/11/2026**, para concluir os fluxos já contratados. Não amplia funcionalidades nem contratos. Base de referência develop `da5881b`, branch de fechamento com alterações ainda não commitadas: registrar a árvore e os hashes efetivos. Nenhum commit, push, PR ou publicação está autorizado por esta story.

## Story

Como Responsável, quero que o frontend reconheça as datas ISO com offset efetivamente retornadas pelo backend, inclusive quando os segundos zerados são omitidos, para confirmar retiradas e consultar/devolver materiais sem rejeitar uma resposta válida.

Responsável: Marcos Boé. RF09, RF13 e RF14; regressão transversal dos clientes que usam `dataComOffset`. Preparação AIOX SM; implementação AIOX Dev.

## Defeito FE-004

**Observado no ambiente real:** POST de retirada retornou HTTP 201 e persistiu a movimentação, mas o frontend não confirmou o resultado nem carregou as pendências. O GET real `/api/movimentacoes?abertas=true` retornou, entre os campos do DTO:

```json
{
  "fimPrevisto": "2026-11-12T13:08-03:00",
  "retiradoEm": "2026-11-12T12:25:56.446048-03:00"
}
```

O primeiro campo tem precisão de minuto e offset explícito. `dataComOffset` exige segundos em seu padrão atual; `conferirMovimentacao` aplica esse validador tanto à resposta de escrita quanto à consulta de pendências. Consequentemente uma retirada já persistida é tratada como resposta incerta. Não repetir a escrita para tentar corrigir sua apresentação.

`DatasConfig` serializa Instant por `i.atZone(ZoneId.of("America/Sao_Paulo")).toOffsetDateTime().toString()`. A implementação usa `OffsetDateTime.toString()`, que pode omitir segundos zerados; não há formatter explícito ISO_OFFSET_DATE_TIME nesse arquivo. O defeito está na aceitação excessivamente restrita do cliente para o formato válido observado, não em ausência de offset no servidor.

## Fontes

- Defeito real comunicado durante a execução da [Marcos-e2e-1](marcos-e2e-1.md), com os valores de DTO acima; execução completa e evidências devem ser registradas no relatório E2E correspondente.
- [Item18: retorno de movimentações e datas com offset](../api/item18.md).
- [Contrato de autenticação e reservas: convenções temporais](../api/reservas-contrato.md).
- `backend/src/main/java/br/senac/recursos/config/DatasConfig.java`: serialização real, somente referência.
- `backend/src/main/resources/static/js/datas.js`: `dataComOffset`, `apresentarData` e formatos de envio existentes.
- `backend/src/main/resources/static/js/movimentacoes.js`: `conferirMovimentacao` e operações públicas de pendências/retirada/devolução.
- `tests/unit/frontend/recursos-datas.test.js`, `tests/unit/frontend/movimentacoes.test.js` e `tests/browser/movimentacoes.spec.js`: verificações e regressões existentes.
- [Registro de defeitos](../qualidade/defeitos-frontend.md): acrescentar FE-004 com reprodução, impacto, correção e evidência real.

## Critérios de aceitação

1. `dataComOffset` aceita datas de resposta ISO com offset explícito em precisão de minuto (`YYYY-MM-DDTHH:mmZ` ou `YYYY-MM-DDTHH:mm±HH:mm`), mantendo a aceitação existente de segundos e de frações de segundo de 1 a 9 casas quando os segundos estiverem presentes. Os segundos são opcionais; a fração não pode existir sem segundos. Aceitar os dois exemplos reais do FE-004 sem alterar o instante representado ou completar a resposta armazenada artificialmente.
2. A validação continua recusando offset ausente, formato incompleto/malformado, calendário inválido, hora 24, minutos/segundos fora dos limites e offset inválido. Não depender apenas da normalização permissiva de Date.parse para validar o dia civil. Manter o suporte a Z e offsets já aceitos, com instante finito e horário civil válido; não inferir fuso do navegador nem aceitar datetime-local como resposta com offset.
3. Mudança restrita à aceitação/validação das datas recebidas e aos testes/documentos necessários. Preservar backend, contratos, paths, DTOs, regras de propriedade, estados, confirmação de identidade, validação de intervalos e guard de operação incerta. Não mudar os formatos enviados por `paraIsoOperacional`/formulários, não anexar offset fixo e não transformar a precisão de minuto em novo formato obrigatório de envio.
4. Testes unitários verificam a precisão de minuto e as fronteiras inválidas relevantes, além de segundos/frações já suportados. Verificar pelo DTO público de movimentações e operações `abertas`, `retirar` e `devolver` que respostas com `fimPrevisto` em minutos são aceitas quando coerentes e que datas/identidades inconsistentes continuam rejeitadas. Incluir representação equivalente do mesmo instante quando pertinente à confirmação da devolução. Não limitar os testes à regex ou espelhar a implementação.
5. Teste de navegador de retirada e devolução com API controlada reproduz o formato observado: fim previsto com minutos e retirada com fração. A resposta 201 coerente é confirmada, a consulta de pendências é renderizada e a devolução confirmada atualiza a interface. Manter guard, envio único e ausência de retry após falha/resposta incerta. Esta regressão controlada é identificada como teste do frontend, separada do E2E real.
6. Como a mudança afeta código do produto compartilhado pelos clientes, executar a regressão completa de frontend por `npm run build` (lint, typecheck, testes unitários e de navegador). Registrar comando, ambiente, árvore/hash, contagens e falhas/reexecuções reais. A aprovação anterior de 70/238 não cobre esta mudança. Investigar qualquer regressão de reservas, recursos, administração, fila e movimentações antes de declarar correção validada.
7. Reempacotar o backend existente para incorporar os arquivos estáticos corrigidos ao JAR; não alterar Java, pom, migrações ou configuração versionada. Confirmar hashes/identidade do artefato e da árvore usados. Reiniciar somente o processo próprio do ambiente isolado com o novo artefato; não testar inadvertidamente o JAR anterior nem interferir em processos/bancos de terceiros.
8. Repetir no ambiente real o fluxo contratado que reproduziu FE-004, usando dados fictícios únicos e horários compatíveis com o relógio e expediente: retirada elegível, resposta real, consulta de pendências e devolução pelo perfil autorizado. O cenário de navegador real usa Spring Boot na mesma origem, sem interceptação ou sessão injetada. Conferir o estado persistido quando disponível e registrar o que foi efetivamente exercitado, inclusive formatos reais observados. Não exigir que um relógio real gere sempre os mesmos segundos da captura original.
9. Registrar FE-004 em `defeitos-frontend.md` com passos de reprodução, impacto da retirada persistida sem confirmação/pendências, causa, correção, testes e evidência. Diferenciar regressão controlada aprovada de E2E real repetido; marcar corrigido/validado somente na extensão comprovada. Preservar o registro da falha inicial sem alegar TDD retroativo ou desfazer automaticamente a retirada já persistida.
10. Atualizar relatório de integração local, instruções/RTM quando afetadas, checklist e File List com comandos/limites efetivos e hashes dos arquivos não commitados. Não alterar stories de outros recortes para encerrar artificialmente suas dependências. GETs de fila/listagem/detalhe de reservas e aplicação HTTP/Q9 continuam com a equipe; não criar endpoints, simular essas leituras como E2E ou supor novos contratos/permissões. Commit/publicação somente mediante solicitação posterior de Marcos.

## Tasks / Subtasks

- [x] Registrar a reprodução FE-004 e conferir o caminho serialização → validador → DTO (AC 1–3, 9).
- [x] Ajustar a validação de datas recebidas para segundos opcionais com offset obrigatório, preservando validações e formatos de envio (AC 1–3).
- [x] Cobrir o DTO público e operações de movimentações com formatos reais/minutos e casos inválidos relevantes (AC 4).
- [x] Acrescentar regressão de navegador para retirada/pendências/devolução no formato observado (AC 5).
- [x] Executar `npm run build` e registrar a regressão completa e limites (AC 6).
- [x] Reempacotar JAR, conferir hashes/árvore e reiniciar somente o processo local próprio (AC 7).
- [x] Repetir E2E real de retirada/pendências/devolução e registrar o resultado efetivo (AC 8).
- [x] Atualizar FE-004, evidências, documentação/rastreabilidade pertinente, checklist e File List (AC 9–10).
- [x] Incluir a correção e evidências no commit local solicitado por Marcos em 12/11/2026; publicação remota separada.
- [x] Registrar aceite visual do autor em 12/11/2026 após roteiro de movimentações no Chrome com backend real.

## Dev Notes

A correção atende ao formato ISO com offset já declarado e efetivamente serializado; não muda contrato de negócio nem corrige o problema alterando o servidor. Fração é fração de segundo, portanto `THH:mm.fração` não é uma extensão a aceitar. Continuar recusando datas civis como 30/02, horários normalizados como 24:00 e strings sem offset. Casos já aceitos com segundos e 1–9 casas devem continuar funcionais.

`conferirMovimentacao` também valida ordem temporal, IDs, estado de devolução e atraso não negativo. Nenhum desses controles deve ser retirado para passar a reprodução. `devolver` compara instantes, não a grafia da string; formatos equivalentes em minutos/segundos devem preservar essa propriedade. O helper de exibição `apresentarData` utiliza o mesmo validador e precisa continuar apresentando em America/Sao_Paulo.

Os testes de navegador existentes usam datas com segundos em todas as fixtures relevantes e não capturaram essa variação do backend. O caso real já comprova a lacuna de integração; registrar evidência do comportamento anterior e da correção, sem inventar teste falhando executado nem chamar a correção de TDD por inferência.

O ambiente isolado está sendo preparado pela Marcos-e2e-1. Reutilizar ferramentas/configuração privada e controle de processos dessa execução. Credenciais, cookies, CSRF, banco e logs brutos permanecem ignorados em `.aiox-core/local/`; evidências versionáveis são sanitizadas. Testes/empacotamento Maven usados para atualizar o JAR devem registrar exatamente quais testes executaram ou foram excluídos; não presumir Docker/Testcontainers disponível. Esta story não remove gates nem amplia a permissão de mudar o backend.

## Validação de preparação

Objetivo, fontes, reprodução concreta, escopo mínimo, critérios testáveis e regressões compartilhadas conferidos pela preparação AIOX SM. Autorização deriva do fechamento/E2E local solicitado por Marcos, sem aprovar novo requisito. Story pronta para desenvolvimento; validação independente e resultados de execução continuam separados.

## CodeRabbit Integration

Tipo principal: Frontend; secundário: Integração. Execução @dev; revisão independente @qa quando disponível. Focos: formatos de resposta realmente serializados, obrigatoriedade de offset, calendário/hora, validação de DTO, equivalência de instantes, ausência de reenvio e correspondência entre fonte/JAR testado. Gates: build completo do frontend e repetição real do fluxo; CodeRabbit com resultado/indisponibilidade registrado. Self-healing @dev light, até 2 iterações/15 minutos para CRITICAL; HIGH documentado. Nenhum resultado local equivale a CI/Sonar remoto aprovado.

## Dev Agent Record

### Completion Notes

Marcos solicitou “vamos fazer o commit” em 12/11/2026 após o aceite visual. Correção incluída no incremento local aprovado, com referência consultável no histórico Git. Evidências preservam os hashes da execução anterior ao commit; nenhuma aprovação de publicação remota ou das dependências externas está implícita.

FE-004 corrigido no validador compartilhado sem mudar formatos enviados ou backend. Dois testes novos falharam antes da correção; depois o build completo aprovou lint/typecheck, 72 unitários e 240 navegador (zero falhas/ignorados/flaky/retries). O cenário controlado reproduz prazo em minutos e retirada fracionária, renderiza pendência e confirma devolução sem repetir escrita. [RED, build e hashes](../testes/marcos-integracao-datas-1-resultados.md).

JAR reempacotado (testes Maven omitidos explicitamente), processos próprios reiniciados e arquivo servido conferido por SHA256. Rodada real final passou em retirada/devolução; consulta complementar da movimentação #3 confirmou fimPrevisto `2026-11-12T13:15-03:00`. Primeiras falhas preservadas e registro inicial mantido, sem exclusão/reenvio automático. GETs/Q9 e demais cenários integrados continuam pendentes.

Marcos informou “revisão visual aprovada” após roteiro preparado de retirada/devolução com prazo real em minutos e demais telas. [Aceite global e limites](../testes/marcos-qualidade-aceite-visual-2026-11-12.md). Nenhum ajuste solicitado; produto/testes preservados, sem nova suíte para este registro.

DoD local: requisitos/contratos e segurança [x]; testes/build/lint/tipos [x]; documentação/arquivos [x]; sem dependências/configuração de produto novas [x]; aceite visual do autor [x]. Administração completa [ ]: commit aguarda solicitação de Marcos; revisão de outro integrante/checks remotos ainda pendentes. CodeRabbit indisponível, Sonar remoto pendente; não há aprovação inferida.

### Agent Model Used

Codex: preparação AIOX SM, implementação AIOX Dev e revisão assistida independente AIOX QA.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-12 | Story Ready for Dev para FE-004: retirada persistida sem confirmação/pendências por rejeição de data válida com precisão de minuto e offset. |
| 2026-11-12 | Validador/testes corrigidos; RED anterior preservado, build 72/240 e fluxo real com JAR atualizado aprovados. Ready for Review local, sem commit/publicação. |
| 2026-11-12 | Aceite visual do autor informado após roteiro no Chrome com backend real; evidência documental, sem nova suíte ou autorização de commit. |
| 2026-11-12 | Solicitação explícita de commit local recebida após o aceite; correção e evidências incluídas, mantendo Ready for Review e pendências externas. |

### File List

Arquivos efetivamente criados/alterados, incluindo evidências compartilhadas:

- `docs/stories/marcos-integracao-datas-1.md`
- `backend/src/main/resources/static/js/datas.js`
- `tests/unit/frontend/recursos-datas.test.js`
- `tests/unit/frontend/movimentacoes.test.js`
- `tests/browser/movimentacoes.spec.js`
- `docs/qualidade/defeitos-frontend.md`
- `docs/testes/marcos-integracao-datas-1-resultados.md`
- `docs/testes/marcos-integracao-datas-1-verificacao.txt`
- `docs/testes/marcos-integracao-datas-1-red.txt`
- `docs/testes/marcos-integracao-datas-1.json`
- `docs/testes/marcos-qualidade-aceite-visual-2026-11-12.md`
- `docs/testes/marcos-e2e-local-2026-11-12-resultados.md`
- `docs/testes/marcos-e2e-local-2026-11-12/movimentacao-final.json`
- `docs/integracao/marcos-e2e-local.md`
- `docs/RTM.md`

JSONs e capturas da repetição real estão inventariados integralmente na File List de `marcos-e2e-1.md`.

O JAR reempacotado e os dados/configurações locais não são arquivos autorais destinados ao commit; registrar seus hashes/caminhos relativos na evidência apropriada.

## QA Results

**PASS técnico local — AIOX QA (Quinn), revisão assistida independente em 12/11/2026.** Conferidos código, regressões, registro FE-004, evidências RED/build, JAR servido e repetição real. Nenhum defeito alto/crítico identificado no recorte; nenhuma suíte ou operação de negócio foi repetida pela revisão.

A aceitação de segundos opcionais preserva offset obrigatório, fração vinculada aos segundos, calendário/hora válidos e formatos enviados. DTO/consulta/retirada/devolução e equivalência de instantes estão cobertos, sem remover confirmação de identidade ou guard de operação incerta. [Build 72 unitários/240 navegador](../testes/marcos-integracao-datas-1-resultados.md) aprovado; hashes dos seis arquivos de produto/testes recalculados e compatíveis com as evidências. A [consulta real complementar da movimentação #3](../testes/marcos-e2e-local-2026-11-12/movimentacao-final.json) confirma fimPrevisto `2026-11-12T13:15-03:00`, retirada/devolução fracionárias e operador correto, após confirmação no Chrome e persistência. A retirada inicial permaneceu preservada.

Checklist, Completion Notes e File List foram atualizados. Este PASS técnico local mantém Ready for Review e não substitui aceite de Marcos, revisão humana da equipe, CodeRabbit/Sonar ou matriz E2E completa. GETs de reservas e escopo Q9 real continuam com a equipe. Não declara RF inteiro entregue, Done, integração completa ou autorização de commit/publicação.
