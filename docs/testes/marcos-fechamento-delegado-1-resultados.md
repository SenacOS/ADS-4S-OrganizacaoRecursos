# Fechamento delegado — contratos, vínculos e RF11 simulada

**Aceite posterior do autor — 13/11/2026:** Marcos aprovou o pacote e solicitou o commit local, sem ajustes. O commit que inclui este registro identifica a entrega na branch `feature/marcos-fechamento-delegado`. Revisão do autor concluída; push/PR/merge e implantação permanecem separados. As referências abaixo à revisão pendente descrevem o momento da preparação e não anulam este aceite. Nenhuma nova execução de testes nesta atualização documental.

Execução em **13/11/2026**, America/Sao_Paulo. Branch `feature/marcos-fechamento-delegado`, base **ab50d26**, contendo a conciliação documental do PR #35, ainda aberto na conferência de preparação. Implementação local sem commit. Autorização e critérios na [story](../stories/marcos-fechamento-delegado-1.md); decisões no [ADR-007](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md).

Marcos comunicou carta branca da equipe para resolver as pendências. O contrato atual, a operação restrita dos vínculos e o modo simulado da RF11 foram adotados sob essa delegação. Não são assinaturas individuais de Silva/Fausto/Débora, prova de implantação compartilhada ou autorização de merge/publicação automática.

Conferência posterior de publicação: [PR #35](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/35) já mesclado. O relato de aberto acima descreve a preparação; as execuções e seus hashes conservam a baseab50d26, sem reatribuição ao commit de merge posterior. Este incremento ainda aguarda sua revisão/commit/publicação próprios.

## Resultado final

**8 PASS / 0 FAIL** na rodada `2026-11-13T16-55-02-031Z`, com Spring/HTTP/MySQL reais e `GatewayNotificacaoPadrao` real no modo simulado. [Resultado completo sanitizado](marcos-fechamento-delegado-1/resultado-final.json), [manifesto/digests](marcos-fechamento-delegado-1/manifesto.json).

| Cenário | Prova observada |
|---|---|
| Base/contas exclusivas | Schema novo `qs_fechamento_<nonce>` no MySQL local cuja identidade já foi conferida; Spring18082, seis migrações, conta própria de migração/runtime e operador de vínculos separado. Nenhuma concessão em contas existentes. |
| Sessão/recursos | Bootstrap administrativo no perfil local, cadastro dos demais usuários pela API, três perfis/quatro usuários, CSRF/cookie de sessão reais, dois recursos restritos e reserva SOLICITADA; saída com offset de São Paulo. |
| Negativas administrativas | Procedimento recusou Solicitante, usuário inativo, recurso inativo, alvo ausente, ação inválida, referência vazia e IDs0/-1; nenhum vínculo criado. Conta operadora não pode atualizar perfil nem ler e-mail/hash de senha. SELECT limitado às colunas do procedimento. |
| Sem/parcial/idempotência | Dono e Administrador consultam; outro Solicitante e Responsável sem vínculo/parcial recebem404. Conceder o mesmo par duas vezes mantém um vínculo. Saída identifica operador/base/referência/antes/depois. |
| Completo/revogação/reconcessão | Vínculo em ambos permite detalhe/fila; revogar um remove leitura404 e aprovação403, preservando SOLICITADA. Revogação repetida mantém ausência. Reconcessão permite aprovação200. |
| Vínculo obsoleto | Revogação remove par com usuário inativo e depois com perfil alterado, sem permitir concessão incompatível. A alteração de fixture ocorreu somente na base própria, não pela conta operadora. |
| Antes do worker | Após ações HTTP/commit, eventos RESERVA_CRIADA e RESERVA_APROVADA em PENDENTE/tentativas0; auditoria real com a mesma correlação de domínio por evento. IDs/correlação/criado_em registrados. |
| Worker/gateway reais | Java próprio reiniciado na mesma base exclusiva com worker habilitado e URL explicitamente vazia. Cada evento aparece no log simulado e no SQL ENVIADA, com uma tentativa, mesmo ID/reserva/correlação/criado_em e enviado_em >= criado_em. Sem Mockito, WireMock ou destino externo. |

Após a prova: Java temporário encerrado por handle do filho criado pelo próprio auxiliar, porta liberada, principal pronto, arquivo de estado principal e digest de sua outbox preservados. A base/contas da demonstração foram mantidas para inspeção privada, sem DROP ou limpeza de dados anteriores. A prova não opera o ambiente da equipe automaticamente.

## Verificações e comandos

`node --check tests/e2e-local/demonstrar-fechamento.cjs` aprovado. Execução final: `node tests/e2e-local/demonstrar-fechamento.cjs`.

`PLAYWRIGHT_CHANNEL=chrome npm.cmd run build` executado uma vez nesta entrega: **lint/typecheck aprovados, 81 unitários e 278 execuções de navegador aprovados**. [Resumo extraído do log](marcos-fechamento-delegado-1/frontend-build.txt). Ajustes posteriores no helper de demonstração não alteraram produto ou testes dessa regressão; sintaxe e demonstração pertinente foram repetidas, sem repetir o build sem motivo.

JAR SHA256 **4b8633a55e59f5f2b5d11865338cb7658eb0f943b50b35d6baa0eb2ebfb0def5**, já reconstruído na entrega anterior; código Java de produção permanece igual à base62cd48f. #34 acrescentou teste de integração e #35 documentação; nenhum Java/configuração persistente de produção foi alterado nesta story. Não houve novo Maven clean verify/Testcontainers local, scanner remoto ou CodeRabbit aprovado presumido. As provas compartilhadas de MySQL/rollback/retry/HTTP controlado conservam seus logs da CI do #34.

## Tentativas e correções preservadas

1. [Tentativa inicial2/1](marcos-fechamento-delegado-1/tentativa-inicial.json): o MySQL8.4 recusou SELECT com locking para a conta operadora com SELECT apenas. Diagnóstico subsequente identificou erro1142. Corrigido com UPDATE(id) nos registros travados e UPDATE(recurso_id) no vínculo para a operação idempotente, sem conceder alteração de perfil/atividade. SQL de recusa passou a encerrar explicitamente por ROLLBACK; nenhum dado principal foi alterado.
2. [Resultado intermediário8/0](marcos-fechamento-delegado-1/resultado-intermediario.json): operação e RF11 passaram antes do reforço da revisão QA. Seus hashes não foram atualizados para fingir a versão final do helper.
3. A revisão QA pediu prova de IDs inválidos, correlação/tempos da outbox e cleanup em falha precoce. [Tentativa de rastreabilidade6/1](marcos-fechamento-delegado-1/tentativa-rastreabilidade.json) expôs uma expectativa incorreta do teste: a correlação de domínio é gerada pelo servidor, não igual ao cabeçalho HTTP enviado. O helper foi corrigido para conferir a correlação real contra auditoria e preservá-la no envio, sem mudar o produto.
4. [Falha inicial controlada](marcos-fechamento-delegado-1/falha-inicial-controlada.json): comando `node tests/e2e-local/demonstrar-fechamento.cjs --verificar-falha-inicial` sai com código1 **esperado**, logo após spawn e antes de CIM. Conserva erro original, encerra o filho próprio e comprova principal/outbox preservados. Não é contado como cenário funcional aprovado ou ocultado como sucesso. A versão final do helper foi usada novamente nessa prova.
5. [Tentativa com MySQL indisponível0/1](marcos-fechamento-delegado-1/tentativa-indisponibilidade-mysql.json): Java temporário encerrou antes da prontidão e foi confirmado encerrado, mas o principal não confirmou prontidão e a inspeção de outbox não pôde completar. O JSON original rotula essa última falha como divergência; o diagnóstico mostrou conexão recusada e não há comparação obtida que comprove mudança de dados. O MySQL deixou de responder por causa não determinada nesta prova. Foi reiniciado com o mesmo mysql.ini/datadir, UUID/porta conferidos e Java principal pronto; somente o PID do MySQL foi atualizado no estado privado. Essa tentativa permanece FAIL e não recebe isolamento aprovado retroativamente. A telemetria final distingue digest diferente de inspeção indisponível.
6. A revisão QA restringiu SELECT da conta operadora a usuarios(id,perfil,ativo) e recursos(id,codigo,ativo), mantendo as escritas mínimas já descritas. Resultado final8/0 acima, com negativas reais de leitura de hash/e-mail. Falha na liberação de um contexto HTTP não impede as demais tentativas de cleanup. O auxiliar usa handle do ChildProcess próprio, sem encerrar processos por PID arbitrário. A falha precoce controlada foi novamente executada nessa versão final; o resultado/manifesto identificam sua própria rodada. Digests de estado/outbox antes/depois estão explícitos na prova final e iguais.

## Procedimento e limite de aceite

[Operação dos vínculos](../operacao/vinculos-responsaveis.md) e [demonstração reproduzível](../operacao/demonstracao-fechamento.md) definem autorização, conta SQL restrita, parâmetros, referência, rollback, consulta antes/depois e configuração temporária.

RF11 aceita aqui o modo simulado previsto no ADR-006 e adotado no ADR-007. ENVIADA comprova retorno bem-sucedido do gateway simulado; não significa e-mail/HTTP recebido por pessoa ou serviço externo. O worker real não foi habilitado sobre a outbox histórica. Não há garantia exactly-once nem certificação de todas as corridas, HTTPS/cookie Secure, imutabilidade contra SQL privilegiado ou grants de produção.

As pendências de decisão/operação listadas anteriormente foram resolvidas no recorte delegado e demonstradas localmente. A conferência documental aprovou29arquivos,370links locais existentes,JSON válido,10digests no manifesto e7artefatos da prova final correspondentes às fontes atuais; File List conferida e nenhuma credencial das rodadas encontrada na entrega. `git diff --check` sem erros. A revisão independente QA registrou PASS técnico local e a story está Ready for Review; revisão do autor e commit/publicação/integração mantêm seus checkpoints. Nenhuma mensagem externa, novo PR ou merge executado nesta rodada de implementação.
