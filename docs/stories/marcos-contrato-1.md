# Marcos-contrato-1 — Aceite do contrato pelo frontend

## Status

Ready for Review

## Story

Como responsável pelo frontend, quero registrar o aceite dos contratos e a leitura necessária à fila de aprovação para implementar as telas sem ambiguidades.

Responsável: Marcos Boé. Requisito: RF14. Story definida com AIOX SM; execução autorizada pelo usuário em 10/11/2026 ao adotar as respostas propostas.

## Critérios de aceitação

1. Registrar o aceite de Marcos para ISO 8601 com offset e exibição em America/Sao_Paulo.
2. Manter PATCH com inicio/fim/recursosIds obrigatórios juntos; identidade/papel vêm da sessão.
3. Manter 409/FORA_DO_EXPEDIENTE e nenhuma repetição automática de escrita.
4. Especificar a fila restrita SOLICITADA: período por sobreposição [inicio,fim), recurso, paginação zero-based, padrão 20, máximo 100, ordem inicio/id.
5. Prever identificação legível dos recursos e identificação mínima autorizada do solicitante, separando projeção de leitura do DTO de escrita.
6. Distinguir aceite do cliente, implementação e revisões de backend/segurança. Não declarar GETs implementados ou Q9 resolvida.
7. Conferir autenticação atual, clientes, documentação, RTM e registrar as verificações reais.

## Tasks / Subtasks

- [x] Registrar aceite de datas, PATCH e 409 no contrato e plano.
- [x] Especificar leitura da fila e dependências pendentes.
- [x] Conferir autenticação e consistência com clientes existentes.
- [x] Atualizar RTM, evidência, checklist e File List.
- [x] Executar gates e preparar commit local desta etapa.

## Dev Notes

Não alterar backend, ativar APIs ou criar provedores falsos. A fila é exclusiva de RESPONSAVEL. Políticas gerais de leitura e revisões dos demais integrantes permanecem pendentes.

## Testing

Revisão documental de verbos, DTOs, datas, erros, filtros e exemplos. Executar npm run build (lint, typecheck, test); não apresentar os testes isolados como validação da API real.

## Dev Agent Record

### Completion Notes

Documentação de cliente concluída. npm run build passou (lint, tipos e 21 testes). [Resultados](../testes/marcos-contrato-1-resultados.md). Nenhum GET, regra de segurança ou aprovação de outro integrante é afirmado como implementado/concluído. Código e aplicação não foram alterados.

### File List

- docs/stories/marcos-contrato-1.md
- docs/api/reservas-contrato.md
- docs/api/reservas-leitura-contrato.md
- docs/planejamento/marcos-plano-de-acao.md
- docs/integracao/dependencias-e-revisores.md
- docs/RTM.md
- docs/testes/marcos-contrato-1-resultados.md

## QA Results

Revisão de backend/segurança e CI pendentes.
