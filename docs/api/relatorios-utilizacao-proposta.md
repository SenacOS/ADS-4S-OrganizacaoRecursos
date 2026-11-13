# RF12 — contrato controlado de relatórios e histórico da proposta

**Estado vigente: adotar o serviço/DTO do PR #39 no cliente/tela controlados, por pedido de Marcos. Endpoint HTTP, registro do bean e integração real continuam pendentes.**

## Checkpoint vigente — compatibilidade com a entrega #39

Em **13/11/2026**, Marcos pediu explicitamente **“vamos usar o que foi feito na #39”**. O [PR #39](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/39), head `9dda8dcbdaf1f4c87ecc458632da227e1edd46e6`, foi mesclado na develop em `acf94fa80b90756905b6908e3a53cdc6d3369259`. Essa entrega passa a orientar o recorte controlado e substitui, para esse desenvolvimento, o candidato anterior baseado em strings Duration e projeção exclusiva do recurso filtrado.

O aceite atual é para adaptar o frontend ao comportamento entregue, incluindo **ADMINISTRADOR provisório**. Não declara endpoint pronto, política definitiva de implantação, integração real executada ou nova autorização para modificar backend/SQL. A proposta ISO anterior permanece no histórico abaixo e não deve ser aplicada como requisito simultâneo ou fallback do DTO atual.

### 1. Entregue e ainda pendente

| Parte | Estado e fonte |
|---|---|
| Leitura persistida | Porta/projeção/adaptador do [PR #37](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/37), usados pelo caso de uso. |
| Serviço e filtro | [ConsultarRelatorioUtilizacao](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/9dda8dcbdaf1f4c87ecc458632da227e1edd46e6/backend/src/main/java/br/senac/recursos/reserva/aplicacao/ConsultarRelatorioUtilizacao.java): período/estados/recurso, padrão de estados, guarda ADMINISTRADOR e coordenação da porta/cálculo. |
| Fronteira transacional | [RelatorioUtilizacaoTransacional](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/9dda8dcbdaf1f4c87ecc458632da227e1edd46e6/backend/src/main/java/br/senac/recursos/reserva/infraestrutura/RelatorioUtilizacaoTransacional.java): classe com `executar` somente leitura em REPEATABLE_READ. |
| DTO | [RelatorioUtilizacaoResponse](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/9dda8dcbdaf1f4c87ecc458632da227e1edd46e6/backend/src/main/java/br/senac/recursos/reserva/api/RelatorioUtilizacaoResponse.java): datas com offset de São Paulo, minutos inteiros e listas de grupos/conflitos. |
| Registro e HTTP | Não entregues no #39: não há controller de relatório nem bean desse serviço registrado em `Item18Config`. O comentário do caso de uso que cita um bean não comprova esse wiring. |
| Frontend | Compatibilidade controlada autorizada neste checkpoint; execução/testes e aceite da mudança têm registros próprios na [story Marcos-6](../stories/marcos-6.md). |

O nome da branch do #39 contém “endpoint”, mas a entrega exclui a exposição REST. O cliente continua usando **GET `/api/relatorios/utilizacao` como rota candidata**, com `inicio`, `fim` e `recursoId` opcional. O formato das datas do formulário/apresentação permanece o já adotado em São Paulo. Backend/segurança ainda precisam entregar wiring, controller, testes HTTP e confirmação da política aplicável ao endpoint.

### 2. DTO adotado para a compatibilidade controlada

| Campo do #39 | Forma e sentido |
|---|---|
| `inicio`, `fim` | Datas ISO com offset no topo da resposta; eco do período por instante. Não existe `periodo:{inicio,fim}` no DTO atual. |
| `recursoId` | ID positivo ou `null`, ecoando o filtro. |
| `estados` | Lista de nomes de estados. O serviço aceita conjunto de estados, mas o frontend deste recorte não envia seletor novo e usa APROVADA, EM_USO e CONCLUIDA, o padrão quando omitidos. |
| `minutosReservados` | `long` Java: `Duration.toMinutes()` do total contado uma vez por reserva. |
| `reservasConsideradas` | `int` Java: quantidade de reservas com interseção positiva no cálculo. |
| `porRecurso` | Lista `{recursoId,minutos}`. Inclui os recursos das reservas selecionadas, não necessariamente apenas o recurso do filtro. |
| `porStatus` | Lista `{status,minutos}`, presente no DTO e validada pelo cliente, sem novo gráfico/tabela de estados neste recorte. |
| `conflitosEvitados` | Lista `{id,recursoId,origem,momento,intervaloInicio,intervaloFim}`; a quantidade apresentada é o tamanho da lista validada, não um escalar recebido nem uma soma de minutos. |

`estadosConsiderados`, `duracaoReservada` e `duracaoAlocada` pertencem ao candidato histórico. O cliente não deve aceitar simultaneamente os dois modelos, converter silenciosamente uma resposta antiga ou inventar campos ausentes do #39.

Exemplo fictício coerente com o DTO, para uma reserva de1hora contendo recursos1/2/3, filtro pelo recurso2 e um evento de conflito no período:

```json
{
  "inicio": "2026-11-17T10:00:00-03:00",
  "fim": "2026-11-17T11:00:00-03:00",
  "recursoId": 2,
  "estados": ["APROVADA", "EM_USO", "CONCLUIDA"],
  "minutosReservados": 60,
  "reservasConsideradas": 1,
  "porRecurso": [
    {"recursoId": 1, "minutos": 60},
    {"recursoId": 2, "minutos": 60},
    {"recursoId": 3, "minutos": 60}
  ],
  "porStatus": [{"status": "APROVADA", "minutos": 60}],
  "conflitosEvitados": [{
    "id": 91,
    "recursoId": 2,
    "origem": "MANUTENCAO",
    "momento": "2026-11-17T10:15:00-03:00",
    "intervaloInicio": "2026-11-17T17:00:00-03:00",
    "intervaloFim": "2026-11-17T18:00:00-03:00"
  }]
}
```

Este exemplo não é resposta HTTP capturada. O evento de conflito pertence ao período pelo `momento`, embora o intervalo da tentativa esteja fora dele. As três linhas de recursos são intencionais no serviço #39, mesmo com filtro2.

### 3. Minutos inteiros e truncamento

O DTO converte **cada Duration agregada** com `toMinutes()`: total, grupo por recurso e grupo por estado são truncados separadamente. O frontend exibe os minutos inteiros recebidos, com unidade e indicação de truncamento quando pertinente; não recupera segundos/frações descartados nem aplica o formatador histórico de Duration como se a precisão ainda estivesse no DTO.

Consequências verificáveis do formato:

- Uma reserva de59segundos pode produzir `reservasConsideradas:1`, `minutosReservados:0`, linhas de recurso/status com `minutos:0`. Isso é válido; uma quantidade de reservas positiva não exige minutos positivos.
- Duas reservas de59segundos em recursos distintos e estados distintos totalizam118segundos: o total convertido pode ser1minuto, enquanto cada grupo convertido é0. Logo, a soma de linhas pode ser **inferior** ao total, inclusive sem filtro de recurso; não reutilizar a desigualdade do candidato Duration.
- Uma reserva de1hora com três recursos continua contando60minutos no total por reserva e60em cada recurso. Somar as três linhas e chamar180de total por reserva muda a métrica.
- Datas/offset e o recorte original do período permanecem; a perda de segundos decorre da conversão do DTO, não de mudança do formato de data escolhida por Marcos.

### 4. Validação de coerência no recorte atual

Validar os tipos/campos do DTO atual e recusar resposta incoerente sem corrigir números ou completar grupos com dados fictícios. Números JSON precisam ser inteiros não negativos representáveis com segurança pelo cliente; IDs são positivos/seguros e únicos dentro de cada lista. Isso limita uma representação inválida no cliente, não redefine a capacidade de `long` do backend.

- `inicio`/`fim` representam os instantes consultados, aceitando offsets equivalentes e preservando até9casas das datas; `recursoId` ecoa exatamente o ID ou `null` solicitado. Como este recorte não envia filtro de estados, `estados` deve ser o conjunto padrão APROVADA, EM_USO e CONCLUIDA, sem duplicatas.
- Zero reservas exige total0 e listas `porRecurso`/`porStatus` vazias. Com reservas consideradas, as duas listas são não vazias, mas valores0 são válidos. Os conflitos são independentes e podem existir sem reserva considerada.
- Cada linha de recurso/status tem minutos menores ou iguais a `minutosReservados`. Não exigir soma dos recursos maior ou igual ao total: o truncamento por grupo pode reduzi-la.
- Os grupos `porStatus` são únicos e pertencem ao conjunto `estados`. Como particionam o mesmo total bruto, a soma dos seus minutos não ultrapassa o total e a diferença de truncamento é menor que a quantidade de grupos. Usar somas/comparações exatas, inclusive quando somar valores individuais seguros ultrapassaria a precisão de ponto flutuante.
- O teto do total é `floor(duracaoExataDoPeriodoEmNs × reservasConsideradas / 60000000000)`. Não truncar primeiro o período para minutos e então multiplicá-lo; isso recusaria totais válidos de reservas subminuto. O mínimo histórico de1ns por reserva não é testável no DTO já truncado e não se aplica como limite positivo em minutos.
- Quando há filtro e reservas consideradas, a linha do recurso selecionado está presente e seus minutos coincidem com o total por reserva. **As outras linhas vinculadas continuam permitidas** no comportamento #39 adotado para ADMINISTRADOR; não exigir exclusividade nem removê-las silenciosamente no cliente.
- Em `conflitosEvitados`, validar IDs únicos, `recursoId`, origem, instante e intervalo. Origens são RESERVA, MANUTENCAO ou RETIRADA_ABERTA, conforme o enum existente. Exigir `momento >= inicioConsultado` e `momento < fimConsultado`, além de `intervaloInicio < intervaloFim`; não exigir que o intervalo solicitado se sobreponha ao período do relatório. Com filtro, o recurso conflitante registrado corresponde ao recurso selecionado.

A quantidade de conflitos exibida é `conflitosEvitados.length` após a validação. A lista não autoriza expor identidade do solicitante, e seu tamanho não é prova de contagem de todas as ocupações que poderiam causar um conflito.

### 5. Filtro multirrecurso e acesso ADMINISTRADOR provisório

O serviço #39 passa para o cálculo todas as reservas devolvidas pela porta, com os seus vínculos completos. Por isso, filtrar o recurso2 significa **selecionar reservas que contêm o recurso2**, e o relatório dessas reservas pode listar recursos1/2/3. Essa semântica, identificada na entrega, foi aceita por Marcos para a compatibilidade controlada com ADMINISTRADOR.

A tela deve tornar esse comportamento claro e manter todas as linhas recebidas/validadas. Não esconder os outros recursos para fingir que o servidor já faz a projeção exclusiva sugerida anteriormente. A política de relatórios por recursos para Responsável/Solicitante continua fora deste recorte; não ampliar os perfis para acomodar a diferença.

Acesso à página estática `/pages/relatorios-utilizacao.html` por URL direta, guarda de sessão compartilhada e **somente ADMINISTRADOR** neste recorte. Sem novo link de menu enquanto não existir o endpoint/política HTTP. Não alterar o formato de datas ou criar filtro de estados, gráfico/tabela por status, paginação, CSV, notificações ou novas métricas.

A consulta continua exigindo ação explícita, sem GET automático do relatório ao abrir a página. A guarda do cliente não substitui a autorização do futuro controller. O serviço já nega os demais perfis, mas não existe ainda evidência HTTP desse endpoint nem formalização definitiva da política no ADR-007 por este documento.

### 6. Limite de integração e próximos responsáveis

Testes e prévia usam interceptação/ambiente controlado claramente identificado; o produto não recebe fallback fictício, backend simulado embutido ou liberação forçada de papel. A rota candidata permanece `/api/relatorios/utilizacao`; erros reais de ausência/negativa não são transformados em sucesso.

Silva/Fausto ainda precisam registrar/configurar o serviço transacional no contexto, entregar controller/contrato HTTP e respectivos testes. Backend/segurança confirmam a política HTTP. O frontend adapta DTO/unidade/guarda ao #39 agora e mantém integração real para um incremento posterior, conferindo essas entregas e divergências antes de declarar E2E real. Ler patches/fontes neste alinhamento não é executar testes ou comprovar novo bean/endpoint funcionando.

Fontes atuais incluem [teste de truncamento do DTO](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/9dda8dcbdaf1f4c87ecc458632da227e1edd46e6/backend/src/test/java/br/senac/recursos/reserva/api/RelatorioUtilizacaoResponseTest.java), [enum de origens](../../backend/src/main/java/br/senac/recursos/reserva/dominio/OrigemOcupacao.java), [plano da etapa6](../planejamento/marcos-etapa-6-plano-de-acao.md) e [story](../stories/marcos-6.md). Os resultados do cliente anterior permanecem associados à versão anterior e não são reatribuídos à compatibilidade #39 sem nova execução.

<details>
<summary>Histórico da preparação e do candidato ISO Duration — superado para o recorte atual pelo DTO do #39</summary>

**Estado histórico: mínimo anteriormente adotado para desenvolvimento controlado; não aplicar os campos/invariantes abaixo ao DTO atual de minutos do #39.**

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

</details>
