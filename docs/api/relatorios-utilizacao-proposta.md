# RF12 — proposta de contrato para relatórios de utilização

**Estado: mínimo adotado para desenvolvimento controlado do cliente/tela em13/11/2026. HTTP definitivo, autorização por perfil e integração real permanecem PROPOSTOS/PENDENTES.**

Preparação em **13/11/2026**, base de referência `develop` **c4279b6**, branch `feature/marcos-6-relatorios`. Escopo: etapa6 de Marcos, derivada da RF12 — utilização por recurso, carga horária alocada e conflitos evitados — do [contexto do projeto](../contexto-inicial-agentes.md) e do [plano de responsabilidades](../planejamento/marcos-plano-de-acao.md). API/agregação: Silva e Fausto; segurança: Débora; consumo/frontend: Marcos.

A autorização delegada do fechamento das etapas1a5 no ADR-007 não é ratificação coletiva automática desta nova API. A preparação inicial limitou-se a contrato/plano/story. Depois, Marcos pediu explicitamente “vamos prossegui com o que está proposto em marcos-etapa-6-plano-de-acao.md”, autorizando o recorte controlado do cliente/tela descrito abaixo; isso não implementa ou libera controller, serviço, SQL ou perfis RF12 no backend.

## Checkpoint de aceite mínimo — cliente/tela controlados

O pedido de Marcos permite iniciar o recorte B do [plano da etapa6](../planejamento/marcos-etapa-6-plano-de-acao.md), com a [story Marcos-6](../stories/marcos-6.md) refinada para desenvolvimento. As escolhas desta seção fixam o contrato de teste do cliente; não atribuem aceite coletivo ao futuro contrato HTTP nem anunciam integração real. Divergências futuras da API exigirão conciliação antes do recorte C.

### DTO e duração adotados para o recorte controlado

- Usar o DTO candidato da seção4: `periodo:{inicio,fim}`, `recursoId:null|id`, conjunto fixo `estadosConsiderados`, `reservasConsideradas`, `duracaoReservada`, `porRecurso:[{recursoId,duracaoAlocada}]` e `conflitosEvitados`. Não acrescentar outra agregação, identidade pessoal ou status de envio.
- O eco do período deve representar os mesmos instantes solicitados, preservando até9casas fracionárias; offsets equivalentes são válidos. `recursoId` deve ecoar exatamente o filtro positivo ou `null` quando ausente.
- O conjunto de estados é exatamente APROVADA, EM_USO e CONCLUIDA, sem duplicação. As contagens são inteiros não negativos representáveis com segurança no cliente; IDs de recursos são positivos, únicos e seguros nessa representação JSON. A representação definitiva de valores eventualmente maiores permanece assunto do contrato HTTP, não nova limitação do banco.
- A duração usa o subconjunto temporal não negativo de `java.time.Duration`: prefixo `PT`, componentes inteiros de horas (`H`), minutos (`M`) e segundos (`S`), nessa ordem, com pelo menos um componente. Só segundos admitem fração decimal, com ponto e de1a9dígitos. Componentes podem ser omitidos. Exemplos aceitos: `PT0S`, `PT1H`, `PT1H30M`, `PT2M3.5S`, `PT0.000000001S` e durações superiores a24horas.
- Rejeitar duração vazia/`PT` sem componentes, sinais negativos/positivos, componente de dias/semanas/meses, vírgula decimal, fração de horas/minutos ou mais de9casas de segundos. Duração não é `Date`, horário do relógio ou valor arredondado em horas decimais.
- Preservar a string bruta e o valor exato. Calcular/comparar com aritmética inteira de precisão suficiente, sem passar frações por ponto flutuante que descarte nanossegundos. A apresentação normaliza em horas, minutos e segundos **sem arredondar**, omitindo componentes de valor zero: `PT1H30M` → `1 h 30 min`; `PT0.000000001S` → `0,000000001 s`; duração total zero → `0 s`. Zeros decimais finais podem ser omitidos na apresentação sem mudar o valor; o bruto permanece disponível. Não limitar horas a24 nem apresentar números em notação que perca precisão.

### Coerência da resposta controlada

As invariantes seguintes decorrem do cálculo existente e do DTO agregado completo, sem paginação de linhas, adotado para esse recorte:

- Zero reservas implica duração total zero e lista `porRecurso` vazia. `conflitosEvitados` pode ser maior que zero nesse mesmo período: são eventos diferentes das reservas consideradas, logo esse resultado continua válido.
- Havendo reservas consideradas, o total e as linhas de recurso têm duração positiva; cada linha é menor ou igual ao total de reservas. Uma reserva válida contribui duração positiva para ao menos um recurso. Na precisão de nanossegundos adotada pelo DTO completo, cada reserva considerada contribui ao menos1ns; portanto, `duracaoReservada` em nanossegundos deve ser maior ou igual a `reservasConsideradas`.
- Sem filtro de recurso, a soma das linhas pode exceder o total, como no exemplo de uma reserva com três recursos; deve ser pelo menos o total, não necessariamente igual. O cliente não substitui o total de reservas por essa soma.
- Com filtro, somente o recurso solicitado pode aparecer na lista; nesse universo, sua duração coincide com o total de reservas consideradas. Ausência de reservas continua retornando lista vazia, sem fabricar uma linha.
- `duracaoReservada`, o total contado **uma vez por reserva**, não excede a duração do período multiplicada pela quantidade de reservas consideradas. Essa restrição não se aplica à soma das linhas de recursos: no exemplo de1reserva de1hora com3recursos, `duracaoReservada` é1hora e a soma por recurso é3horas. Todas as comparações preservam a precisão original.

Uma futura API que defina paginação de recursos, outro universo para totais ou outra projeção precisará de contrato/validação conciliados; não se deve corrigir ou completar números inesperados silenciosamente no navegador.

### Acesso à página e dados controlados

Página estática candidata: `/pages/relatorios-utilizacao.html`, com guarda de sessão pelo fluxo compartilhado de `/api/auth/me`, mesma origem e consulta somente por ação explícita. Não fazer GET automático do relatório ao abrir a página. O acesso direto à página permite desenvolver o cliente autenticado sem criar agora link de menu ou política de navegação por papel RF12 ainda indefinido.

A guarda do cliente não substitui a autorização que o endpoint real precisará impor. Não inferir permissão para todos os perfis, adotar um perfil privilegiado fictício ou apresentar o próprio arquivo estático como proteção do agregado. Negativas reais do servidor continuam tratadas pelo cliente e a política HTTP final permanece com backend/segurança.

Dados mock ficam exclusivamente em interceptações dos testes ou em prévia de desenvolvimento claramente identificada. A tela deve informar o contexto de prévia/integração pendente. O código servido como produto consulta a rota candidata; sua ausência/falha não dispara fallback de números fictícios, habilitação de API simulada ou mensagem de relatório real carregado. Este checkpoint autoriza implementação/testes do cliente, não afirma que código, teste ou aceite visual já foram concluídos.

## 1. Estado real das entregas

| Parte | Estado conferido | Limite |
|---|---|---|
| [PR #37](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/37) | Porta `ReservaRelatorioPort`, projeção `ConflitoEvitadoResumo`, adaptador `ReservaRelatorioMysql` e7testes MySQL entregues | Não entrega endpoint, DTO HTTP, autorização RF12 ou serviço que coordene/agregue as leituras. |
| [UtilizacaoReservas](../../backend/src/main/java/br/senac/recursos/reserva/dominio/UtilizacaoReservas.java) | Cálculo puro existente, com `Duration`, total por reserva, duração por recurso/estado e quantidade de reservas | Não busca dados, não aplica ator autenticado nem projeta uma resposta autorizada. |
| HTTP/frontend da etapa6 | Recorte controlado de cliente/tela autorizado no checkpoint acima | A rota e a política HTTP definitiva permanecem candidatas. Implementação/testes do cliente têm registro próprio na story; não há integração real disponível declarada aqui. |

Fontes técnicas: [porta](../../backend/src/main/java/br/senac/recursos/reserva/aplicacao/ReservaRelatorioPort.java), [projeção de conflitos](../../backend/src/main/java/br/senac/recursos/reserva/aplicacao/ConflitoEvitadoResumo.java), [adaptador](../../backend/src/main/java/br/senac/recursos/reserva/infraestrutura/ReservaRelatorioMysql.java), [teste MySQL](../../backend/src/test/java/br/senac/recursos/reserva/infraestrutura/ReservaRelatorioMysqlIT.java) e [teste do cálculo](../../backend/src/test/java/br/senac/recursos/reserva/dominio/UtilizacaoReservasTest.java). Ler código/testes não equivale a nova execução deles nesta preparação.

## 2. Requisição candidata — PROPOSTA

Rota sugerida, a confirmar por Silva/Fausto:

```http
GET /api/relatorios/utilizacao?inicio=2026-11-17T10%3A00%3A00-03%3A00&fim=2026-11-17T11%3A00%3A00-03%3A00
```

| Parâmetro candidato | Base existente / decisão que falta |
|---|---|
| `inicio`, `fim` | Obrigatórios e juntos, ISO8601 com offset, fim posterior ao início. A porta exige `IntervaloReserva`; esse nome/formato HTTP ainda depende de confirmação. |
| `recursoId` | Opcional, inteiro positivo. Na porta, nulo significa consulta sem esse filtro; o futuro endpoint ainda deverá limitar os recursos ao escopo autorizado. |
| Estados | Primeiro recorte sugerido usa o padrão existente APROVADA, EM_USO e CONCLUIDA. Não propor filtro HTTP de estados customizados sem decisão explícita. |

Períodos são comparados por instantes, com apresentação no fuso `America/Sao_Paulo`, coerente com os contratos existentes. Não há limite máximo de período ou quantidade de recursos definido nesta proposta; limites de consulta, eventual paginação e comportamento em volume precisam de decisão concreta, não de números escolhidos pelo frontend.

O método proposto é somente leitura, usa a sessão da mesma origem e não recebe `usuarioId`, papel ou lista de permissões no corpo/query. Isso descreve a intenção do contrato candidato; não é prova de filtro de segurança já implementado para RF12.

## 3. Semântica rastreada às funções existentes

### Horas alocadas por reserva e por recurso

- A porta busca reservas que sobrepõem o período: `reserva.inicio < fim` e `reserva.fim > inicio`. Os instantes retornados são os originais; `UtilizacaoReservas` recorta a duração à interseção com `[inicio,fim)`.
- `horasReservadas` é uma `Duration`, apesar do nome. Soma a duração recortada **uma vez por reserva** e informa `reservasConsideradas`. Não é contagem de horas de relógio distintas nem união dos intervalos de reservas diferentes.
- `porRecurso` soma essa duração em cada recurso da reserva. Uma reserva de1hora com3recursos produz1hora no total de reservas e1hora em cada recurso. Somar essas três linhas e chamar o resultado de “total de horas reservadas” daria outra medida.
- `porStatus` também existe no cálculo puro, mas sua exposição/gráfico não é requisito acrescentado ao primeiro DTO por este documento. Se for exposto, precisa de campo/unidade/semântica confirmados.
- Estados padrão: APROVADA, EM_USO e CONCLUIDA. SOLICITADA bloqueia a agenda no domínio, mas não entra no padrão desse cálculo RF12. Não adicionar/cortar estados silenciosamente no cliente.
- A duração representa **alocação prevista/registrada nas reservas**, não medição do tempo efetivo de retirada/devolução. Percentual de ocupação, capacidade disponível, taxa por expediente e outros indicadores não são derivados automaticamente por esta proposta.

### Risco específico do filtro e do escopo

`ReservaRelatorioMysql.buscarReservas(..., recursoId)` seleciona reservas que contêm o recurso filtrado, mas devolve **todos os vínculos dessas reservas**. O teste MySQL confirma esse comportamento: filtrar pelo recurso12 pode devolver os vínculos11/12/13; passar o resultado diretamente ao cálculo produz durações para os outros recursos também.

Assim, a futura camada de aplicação/DTO precisa combinar autorização e projeção antes de expor o relatório. Uma resposta filtrada pelo recurso12 não deve revelar os outros recursos da reserva só porque a porta interna os devolveu. Tampouco se deve buscar tudo e esconder linhas apenas no navegador: totais e contagens também podem revelar dados fora do escopo.

Proposta para discussão: total de reservas calculado uma vez por reserva elegível ao filtro/escopo confirmado; linhas de recursos limitadas ao recurso selecionado ou aos recursos efetivamente autorizados quando não há filtro. A semântica exata de reservas multirrecurso para perfis restritos ainda precisa ser decidida. Não adaptar a regra Q9 ou liberar todos os recursos por inferência.

### Conflitos evitados

- A porta seleciona eventos por **momento da ocorrência**: `momento >= inicio` e `momento < fim`. O intervalo solicitado na tentativa é contexto e pode estar fora do período do relatório.
- O filtro de recurso se aplica ao `recursoId` conflitante registrado no evento. Ordem interna: momento e ID.
- A contagem candidata corresponde aos registros/eventos selecionados, não a horas economizadas, usuários distintos ou todas as ocupações que poderiam conflitar. A projeção atual não contém identidade do solicitante e ela não deve ser acrescentada ao DTO por conveniência da interface.
- O número final e qualquer detalhamento precisam obedecer ao mesmo escopo autorizado definido para RF12. A porta não recebe ator; não existe segurança HTTP RF12 comprovada pelo fato de a consulta MySQL funcionar.

## 4. Resposta candidata — PROPOSTA

Sugestão mínima para permitir discussão de campos e, depois de aceite do recorte controlado, fixtures do frontend:

```json
{
  "periodo": {
    "inicio": "2026-11-17T10:00:00-03:00",
    "fim": "2026-11-17T11:00:00-03:00"
  },
  "recursoId": null,
  "estadosConsiderados": ["APROVADA", "EM_USO", "CONCLUIDA"],
  "reservasConsideradas": 1,
  "duracaoReservada": "PT1H",
  "porRecurso": [
    {"recursoId": 1, "duracaoAlocada": "PT1H"},
    {"recursoId": 2, "duracaoAlocada": "PT1H"},
    {"recursoId": 3, "duracaoAlocada": "PT1H"}
  ],
  "conflitosEvitados": 0
}
```

**Exemplo fictício:** exatamente uma reserva de10h–11h, nos recursos1/2/3, inteiramente no período, sem eventos de conflito. Ilustra o caso de não duplicação do teste de cálculo; não é resposta capturada de endpoint nem fixture da integração MySQL do #37. Um relatório filtrado pelo recurso2, para esse mesmo exemplo e com acesso autorizado confirmado, retornaria somente a linha do recurso2; o total por reserva continuaria1hora/1reserva.

| Campo candidato | Sentido e ponto a confirmar |
|---|---|
| `periodo` / `recursoId` | Eco do filtro validado. Recurso inexistente ou fora do escopo ainda precisa de convenção HTTP. |
| `estadosConsiderados` | Torna explícito o conjunto do cálculo; não declara opção de alterar estados pela UI. |
| `reservasConsideradas` | Quantidade de reservas elegíveis com interseção positiva no cálculo e no escopo confirmado, uma vez por ID. |
| `duracaoReservada` | Nome HTTP sugerido para a `Duration` total; não altera o nome do record Java existente. |
| `porRecurso` | Duração alocada apenas dos recursos do filtro/escopo; identificação legível depende de projeção de recurso ainda a contratar. Não exigir chamada por linha nem divulgar dados de outro recurso. |
| `conflitosEvitados` | Quantidade de eventos selecionados pelo momento da tentativa e pelo escopo, sem identidade do solicitante. Agregação ainda precisa do serviço. |

**Unidade/precisão:** o recorte controlado já adota as strings temporais de Duration e a apresentação exata fixadas no checkpoint. Para a integração real, o backend ainda deve confirmar precisão/serialização do HTTP. Se o contrato final preferir número, deverá especificar unidade, precisão e arredondamento, com ajuste do cliente antes da integração. Não somar valores já arredondados no navegador para reconstruir o total.

Para período sem registros elegíveis e sem conflitos, a resposta candidata traz `reservasConsideradas:0`, `duracaoReservada:"PT0S"`, `porRecurso:[]` e `conflitosEvitados:0`. Isso não define como responder a recurso inexistente/não autorizado nem exige linhas com zero para todos os recursos cadastrados. Essas decisões permanecem abertas.

Não há campos de e-mail, motivo de reserva, solicitante, sessão, outbox ou status de envio no candidato. RF11 foi fechada no modo simulado por decisão própria e não cria uma “caixa de notificações” para esta etapa.

## 5. Segurança e erros — decisões ainda necessárias

Não existe perfil RF12 liberado por esta proposta. Silva/Fausto e Débora precisam definir quem pode solicitar o relatório, qual universo cada papel pode consultar e como a autorização será aplicada antes dos totais/contagens. O fato de Administrador consultar todas as reservas na Q9 não é, sozinho, autorização implementada para um novo endpoint. Solicitante/Responsável também não recebem acesso RF12 por herança da navegação.

Recomenda-se reaproveitar o envelope de erro existente `{codigo,mensagem,correlationId}` e os tratamentos de sessão já usados pelo frontend. Convenções candidatas:400 para filtros inválidos,401 para sessão ausente e403 para operação não autorizada; recurso fora do escopo/inexistente deve ter decisão explícita entre a convenção404 adotada nas consultas e o comportamento escolhido para o relatório. Não informar uma resposta como real antes de haver controller e testes.

## 6. Perguntas objetivas para fechar o contrato

| Responsáveis | Confirmação necessária |
|---|---|
| Silva + Fausto | Rota/método e parâmetros; DTO agregado; quem coordena porta e cálculo; semântica de total/linhas ao filtrar um recurso; conjunto de estados padrão; retorno vazio. |
| Silva + Fausto | Duração ISO8601 ou unidade numérica; precisão/serialização e regra de apresentação; identificação legível dos recursos; quantidade/limites/paginação somente se necessários e contratados. |
| Débora + Silva/Fausto | Perfis autorizados e escopo de reservas/recursos/conflitos para cada um; multirrecurso; filtro arbitrário de recurso; total/contagem sem vazamento; convenção de negativas. |
| Silva + Fausto | Confirmar conflitos por momento da ocorrência e contagem por evento; definir se apenas agregado basta ou se haverá detalhamento próprio em outro recorte. |
| Silva + Fausto | Consistência da leitura agregada quando as duas consultas são feitas: cada método do adaptador tem transação própria; a coordenação/snapshot da resposta ainda precisa do serviço, não é presumida pela preparação. |
| Marcos + equipe | Mínimo controlado aceito pelo pedido de continuidade registrado acima; backend/segurança ainda confirmam o contrato HTTP definitivo. Registrar divergências antes da integração real. |

## 7. Primeiro recorte do frontend e evidência futura

O aceite mínimo do recorte controlado foi recebido e registrado neste checkpoint; com a story pronta para desenvolvimento, segue a implementação da tela de período/recurso com resumo por reserva, duração por recurso, conflitos evitados, unidades claras, carregamento, vazio e erro. Qualquer demonstração contra mock deve ser identificada como dados simulados e conservar sua origem. Não criar fallback fictício em produção que transforme falha/ausência de API em relatório de sucesso.

Antes da integração real: contrato confirmado, serviço/DTO/controller e autorização entregues por seus responsáveis; então validar sessão/perfis, período/offset, exemplo multirrecurso, filtro sem vazamento, duração/precisão, limites semiabertos, vazio e conflitos pelo momento correto. Casos controlados não demonstram HTTP/SQL reais. Não são novos testes executados por este documento.

CSV é opcional nos artefatos originais e fica fora do primeiro recorte. Notificações/RF11, novos relatórios ou gráficos sem requisito, taxa de ocupação e decisões de novas permissões também não são acrescentados ao escopo desta preparação.
