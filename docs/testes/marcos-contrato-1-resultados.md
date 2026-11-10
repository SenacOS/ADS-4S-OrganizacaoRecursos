# Marcos-contrato-1 — verificação do aceite de cliente

Data: 10/11/2026. Estado: documentação validada localmente; revisão de backend/segurança pendente.

- Datas ISO com offset e exibição America/Sao_Paulo conferidas com ReservaRequest e clientes JS existentes.
- PATCH mantém inicio, fim e recursosIds obrigatórios; identidade/papel continuam na sessão.
- 409/FORA_DO_EXPEDIENTE mantido, conforme escolha adotada pelo usuário.
- Fila especificada separadamente, com campos adicionais de leitura, paginação, filtros e acesso de RESPONSAVEL. Endpoint não implementado por esta etapa; Q9 continua pendente.
- Autenticação mantém login form-urlencoded, 204 e cabeçalho CSRF dinâmico.
- npm run build: exit code 0; lint e typecheck sem diagnósticos, 21 testes aprovados. A primeira tentativa foi bloqueada pelo sandbox (spawn EPERM); a execução autorizada fora dele passou.
- git diff --check: verificar antes do commit. Nenhum código de produção mudou nesta etapa.

Não se afirma aprovação dos demais autores, integração real, CI ou E2E. Esta etapa encerra a decisão do cliente, não a implementação dos GETs. Evidências da suíte-base: [Marcos-1](marcos-1-resultados.md).
