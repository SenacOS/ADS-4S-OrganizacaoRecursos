# Q9 — controles de acesso em consultas e decisões de reservas

## Implementado neste PR

- GET /api/reservas e GET /api/reservas/{id}, sob reservas.api.enabled=true, usam sempre o ator autenticado da sessão.
- SOLICITANTE: apenas reservas próprias.
- ADMINISTRADOR: consulta todas; NÃO pode aprovar ou rejeitar.
- RESPONSAVEL: somente reservas para as quais tem vínculo com **todos** os recursos envolvidos.
- Paginação e total são calculados no SQL já com a restrição aplicada. O filtro do cliente não amplia a visibilidade.
- GET /api/reservas?status=SOLICITADA para RESPONSAVEL funciona como fila de aprovação: somente reservas restritas solicitadas.
- O DTO de leitura não retorna email, nome real, telefone, senha ou contato do solicitante: apenas id e identificador mínimo "Solicitante <id>".
- Uma reserva fora do escopo ou inexistente devolve 404 NAO_ENCONTRADO no GET de detalhe; ausência de autenticação: 401; parâmetros inválidos: 400.
- Aprovação, rejeição, início de uso, conclusão e não comparecimento por RESPONSAVEL validam os vínculos após a releitura/bloqueio da reserva e antes de salvar, auditar ou notificar.
- A tabela Flyway V6 `responsaveis_recursos(recurso_id,usuario_id)` é intencionalmente criada vazia: nenhuma permissão automática é atribuída.

## Regra conservadora para reservas com vários recursos

**Proposta sujeita a ratificação de Silva, Fausto e Marcos:** acesso de RESPONSAVEL à leitura completa e às decisões exige vínculo com todos os recursos da reserva. Exemplo: se A responde pela sala e B pelo projetor, nenhum dos dois pode consultar os detalhes completos nem decidir até que exista um responsável autorizado para ambos. Isto evita vazamento de informações de recursos alheios e decisões parciais sem contrato de aprovação conjunta.

Essa regra é mais restritiva que a frase geral "vê reservas dos seus recursos". A equipe deve decidir se futuramente precisa de um mecanismo de aprovação parcial por recurso; **não se deve trocar para OR/permissão de qualquer recurso** sem projeto e testes apropriados.

## Dependências de integração e administração

1. Fausto/Silva devem manter os vínculos na tabela `responsaveis_recursos` via processo administrativo restrito (o PR não expõe POST público de concessão).
2. Rota da fila é o GET geral com status SOLICITADA. Para RESPONSAVEL, isso limita a pendentes restritas; demais perfis recebem a própria consulta conforme Q9.
3. Recursos sem responsável explicitamente vinculado não podem ser aprovados. Necessário povoar vínculos com pessoas e recursos reais antes do E2E.
4. Revisar a política multi-recurso com a equipe e realizar E2E com sessões reais. O frontend deve respeitar o comportamento 404 para detalhes fora do escopo.
5. SonarCloud não é alterado por este PR; falha de token/chave e limitações de plano são independentes.
