# Marcos — dependências para fechar as etapas 1 a 5

Conferência de 12/11/2026 na develop `da5881b`, após merges dos PRs #23 e #24. Marcos confirmou que ainda não recebeu contratos novos de leitura. Este documento prepara o encaminhamento; nenhuma mensagem foi enviada à equipe.

| Entrega necessária | Responsáveis de integração | O que permite retomar |
|---|---|---|
| Contrato HTTP ratificado da listagem: rota, filtros, ordenação, paginação, total, DTO e escopo por perfil | Silva (serviço/HTTP), Fausto (consulta/projeção), Débora (autorização); Marcos revisa consumo | Listar reservas existentes sem inventar parâmetros ou dados |
| Detalhe autorizado com início/fim, todos os recursos, estado e campos necessários ao formulário | Silva/Fausto e Débora | Abrir edição, enviar PATCH completo e cancelar pela interface |
| Exposição HTTP da fila conforme especificação ratificada, com projeção de detalhe suficiente e erros definidos | Silva/Fausto e revisão de Débora | Consumir a fila real e validar aprovação/rejeição pela tela |
| Modelo e consulta do vínculo Responsável/recurso; aplicação do escopo Q9 no servidor | Fausto/Silva e Débora; equipe ratifica vínculo | Restringir leitura da fila e dos detalhes ao escopo autorizado |
| Dados mínimos de identificação do solicitante e regra 403/404 fora do escopo | Débora e responsáveis pelo contrato | Mensagens e projeções coerentes sem exposição desnecessária |
| Remediação do scanner Sonar e nova execução pelos responsáveis | Débora/administradores do projeto | Avaliar Quality Gate real; não se resolve alterando gates ou corrigindo apenas `sort` |
| Revisão de outro integrante, ratificação coletiva e validação integrada dos fluxos restantes | Equipe e Marcos | Encerramento integrado, além dos aceites locais já registrados |

Q9 está decidida como política: Solicitante lê suas próprias reservas; Responsável lê as dos recursos sob sua responsabilidade; Administrador lê todas. Isso não amplia permissões de escrita. A implementação SQL já integrada não equivale a controller HTTP disponível, vínculo modelado ou escopo aplicado. A [especificação da fila](../api/reservas-leitura-contrato.md) é referência de consumo e ainda precisa do fechamento coletivo.

O PATCH atual substitui `inicio`, `fim` e `recursosIds` juntos. A resposta com offset de São Paulo serve ao cliente. `FORA_DO_EXPEDIENTE` permanece 409 conforme contrato atual. Essas decisões não substituem os GETs necessários para reabrir registros. Não se deve preencher um formulário de edição com dados incompletos nem buscar registros diretamente no banco pela interface.

## Evidência para a CI

[Run 43241249745](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43241249745), job `131261917002`, SHA `da5881b`: Maven verify passou com 239 testes unitários/HTTP, 49 integrações e cobertura atendida. O scanner falhou depois com `Not authorized or project not found`. Conferir token configurado, `sonar.projectKey`, `sonar.organization` e permissão de executar análise; o log sozinho não identifica qual deles está incorreto. [Diagnóstico e trecho sanitizado](../testes/marcos-qualidade-1-resultados.md#ci-falha-separada-da-correção).

## Trabalho local autorizado

Marcos está corrigindo a qualidade do frontend e preparando testes reais em base isolada. O ambiente deixa de depender de uma infraestrutura compartilhada, mas não elimina a dependência de APIs ainda ausentes. [Guia de uso](marcos-e2e-local.md) e [resultado real](../testes/marcos-e2e-local-2026-11-12-resultados.md).

A integração identificou FE-004: uma data de movimentação com offset e sem segundos zerados era recusada pelo cliente após uma retirada já persistida. O tratamento fica na [story própria](../stories/marcos-integracao-datas-1.md), com regressão e repetição real, sem alteração de política ou backend.

## Condição de retomada

Quando a equipe entregar contrato e endpoints de leitura, conferir versão e exemplos reais dos três perfis, incluindo acesso fora do escopo. Depois implementar o restante da etapa 3, ligar a fila ao endpoint ratificado e executar E2E dos fluxos completos. Até lá, manter esses itens abertos no [plano](../planejamento/marcos-fechamento-etapas-1-a-5.md). As ações de commit, push, PR e merge dependem das solicitações correspondentes de Marcos.
