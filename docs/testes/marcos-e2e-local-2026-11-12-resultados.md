# Marcos — integração local real de 12/11/2026

Branch `fix/marcos-qualidade-frontend`, base develop `da5881bcb65dcf048678b784ed14ae3013feabc2`. Código corrigido ainda **sem commit**. O [JSON final](marcos-e2e-local-2026-11-12/resultados.json) registra hashes das fontes, auxiliares e JAR, além do SHA base. Não atribuir as mudanças novas a um commit que ainda não existe.

## Resultado

**16 cenários aprovados, zero falhas e um bloqueio**, em 12/11/2026, 12:32:44–12:32:52 (America/Sao_Paulo). Sem retries automáticos de rodada. Chrome headless + Spring + MySQL reais, sem interceptação de API. `node --check` passou nos dois auxiliares.

| Camada | Verificação efetivamente executada |
|---|---|
| SQL | Flyway V1–V5 com sucesso; base/UUID/datadir/porta próprios |
| Proveniência | SHA256 dos dois módulos alterados servidos pelo JAR igual às fontes |
| HTTP | Sem sessão: 401 NAO_AUTENTICADO; falta de CSRF: 403; Solicitante cadastrando recurso e Administrador retirando: 403 |
| HTTP + Chrome | Login/logout dos três perfis; cookie JSESSIONID HttpOnly/SameSite Lax; `/me` 401 após logout |
| Chrome | Cadastro dos três tipos, edição de competências, expediente de sete dias preservando frações |
| Chrome | Criar/cancelar manutenção e desativar sala |
| Chrome | Pesquisa por período/patrimônio e criação comum APROVADA com offset -03:00 |
| HTTP | Reserva restrita SOLICITADA, PATCH completo e cancelamento por ID conhecido; conflito 409 RECURSO_INDISPONIVEL |
| Chrome | Retirada e devolução do material pelo Responsável; confirmação e pendências reais |
| SQL | Recursos/reservas/movimentação persistidos; auditoria e outbox PENDENTE reais; worker desligado |

IDs da rodada final: material comum #10, restrito #11; reserva comum #5, restrita #6 posteriormente cancelada; movimentação #3 devolvida pelo operador #3, atraso final 0. Os IDs são dados da instância local, não fixtures para uma nova rodada. Conferir o JSON para a evidência exata.

Capturas com dados exclusivamente fictícios: [reserva](marcos-e2e-local-2026-11-12/reserva-comum.png), [retirada](marcos-e2e-local-2026-11-12/retirada-real.png), [devolução](marcos-e2e-local-2026-11-12/devolucao-real.png). São evidências automatizadas; não representam novo aceite visual humano de Marcos.

## Reexecução pelo autor — 13:19 de São Paulo

Marcos forneceu a saída de `controle.cjs status`, `controle.cjs iniciar` e `validar.cjs`. O controle identificou o banco isolado e informou que o ambiente já estava pronto. A execução de **12/11/2026, 13:19:42–13:19:50 (-03:00)** terminou com **16 PASS, 0 FAIL e 1 BLOQUEADO**, conforme [JSON original do autor](marcos-e2e-local-2026-11-12/resultados-marcos.json), copiado sem alterações da pasta privada datada `2026-11-12T16-19-42-981Z`.

Os nove hashes de fontes/testes/auxiliares/JAR foram conferidos contra os arquivos atuais e coincidem com a rodada anterior. Esta reexecução não substitui nem soma suas contagens às anteriores. O bloqueio continua sendo fila/lista/detalhe e autorização Q9: o PASS do cenário diagnóstico significa que a ausência das leituras foi registrada, não que os fluxos ausentes passaram.

Confirmação de execução automatizada pelo autor, sem inferir nova revisão visual, aceite de interface, revisão da equipe ou autorização de commit/push. Produto e auxiliares não foram alterados para registrar o resultado.

## Aceite visual posterior do autor

Em 12/11/2026, Marcos informou **“revisão visual aprovada”** após abrir o Chrome com três sessões reais e roteiro de gestão, criação de reserva e retirada/devolução. [Preparação, dados e limites do aceite](marcos-qualidade-aceite-visual-2026-11-12.md). Aceite global do autor, sem detalhamento individual de todos os caminhos; não substitui revisão de outro integrante, checks remotos ou GETs/Q9. Registro somente documental, sem nova suíte/alteração de produto ou commit.

## Ambiente e build

Temurin 21.0.13+9, Maven 3.9.16, MySQL 8.4.13 ZIP; Node/Chrome instalados. Ferramentas, cache, banco, configuração privada e logs sob `.aiox-core/local/`, ignorado pelo Git. [Inventário com fontes e hashes](marcos-e2e-local-2026-11-12/inventario.json), [guia e comandos](../integracao/marcos-e2e-local.md).

Backend em `127.0.0.1:18080`; MySQL em `127.0.0.1:13307`, base nova `qs_marcos_e2e`. Endereços de escuta foram conferidos. O MySQL usa processo monitor/pai e filho de escuta; seu encerramento é autenticado por `mysqladmin` após validar a instância, sem matar um PID genérico. Java é verificado por executável, JAR e data de criação. O ciclo real `parar → package → iniciar` foi executado com dados preservados.

O primeiro package compilou 95 fontes com Java21 e terminou `BUILD SUCCESS` (28,189 s). Após FE-004 houve novo package, também `BUILD SUCCESS` (5,627 s). Ambos omitiram testes Maven explicitamente por `-Dmaven.test.skip=true -DskipITs`; não são uma execução local de `clean verify`. Na tentativa inicial, PowerShell dividiu um argumento `-D` não citado; corrigir as aspas resolveu a invocação sem mudar POM/Java. [Extrato sanitizado de empacotamento](marcos-e2e-local-2026-11-12/empacotamento.txt).

A regressão frontend é separada: [72 unitários/240 navegador](marcos-integracao-datas-1-resultados.md). Os 239 unitários/HTTP e 49 integrações MySQL da [CI](marcos-qualidade-1-resultados.md#ci-falha-separada-da-correção) pertencem à execução remota da develop, não a este computador.

## Tentativas anteriores preservadas

1. [Primeira rodada](marcos-e2e-local-2026-11-12/primeira-rodada.json): registro parcial de 9 cenários aprovados, 2 falhos e 1 bloqueado; execução interrompida antes do encerramento/SQL final, sem estatística final. Um erro era do auxiliar (procurava “Editar” onde o botão é “Gerenciar”); outro revelou **FE-004**, retirada 201 já persistida recusada pelo frontend por prazo sem segundos. O registro antigo continua na base, sem reenvio ou exclusão automática.
2. [Segunda rodada](marcos-e2e-local-2026-11-12/segunda-rodada.json), após corrigir datas/reempacotar: 14 aprovados, 1 falha, 1 bloqueado. Retirada/devolução já passaram; a falha restante era uma expectativa errada no auxiliar de logout, que omitia `?sessao=encerrada`. Ajustou-se apenas o teste. Sem mudança adicional no produto.
3. Rodada final: corrigida a expectativa do logout, adicionada a conferência dos arquivos servidos e executados 16 cenários aprovados. As duas primeiras evidências não foram sobrescritas. A correção FE-004 também tem [regressão unitária anterior à mudança](marcos-integracao-datas-1-red.txt).

## Bloqueios e limites

As consultas reais `GET /api/reservas`, `GET /api/reservas/5` e `GET /api/reservas?status=SOLICITADA&pagina=0&tamanho=20` retornaram **405**. O cenário diagnóstico passou porque registrou a ausência; o fluxo funcional continua **BLOQUEADO**, não aprovado. Sem novo contrato recebido, não foram criados GETs, preenchidas filas falsas ou presumida autorização Q9.

Não foram validados: fila/aprovação/rejeição pela interface, consulta por escopo Q9, reabertura de edição/cancelamento, expiração por timeout, todas as combinações de filtros/páginas, recurso indisponível/vazio na UI real, manutenção/permissões em todos os estados, pendência após o prazo, atraso final positivo, concorrência ou envio externo de notificações. PATCH/cancelamento por ID conhecido é prova HTTP limitada, não substitui a tela pendente. Segurança por grants de produção e imutabilidade completa de auditoria também não são provadas pela conta desta base.

O ambiente preparado e os fluxos disponíveis avançaram; o passo 7 completo e as etapas 1 a 5 continuam abertos nos pontos acima. [Responsáveis e condição de retomada](../integracao/marcos-pendencias-2026-11-12.md). Nenhum commit/push/PR ou mensagem à equipe foi realizado nesta execução.
