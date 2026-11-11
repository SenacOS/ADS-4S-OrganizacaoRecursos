# JMeter — teste de carga e robustez (planos preparados, sem execução)

O guia exige plano, resultados e interpretação: **a simples existência dos arquivos
.jmx não é uma evidência de desempenho**. Estes planos usam a API Spring Boot
local e **nunca devem apontar para produção ou serviços de terceiros**.

## Preparar ambiente antes da execução
- Java 21, Maven, Docker/MySQL 8.4, Apache JMeter 5.6.x.
- Subir backend local com `recursos.api.enabled=true` e
  `reservas.api.enabled=true`. O padrão no `application.yml` é **false**.
- Usar banco de teste isolado e credenciais **fictícias** de Solicitante e
  Administrador com sessão HTTP e cookie (sem tokens reais).
- Criar antes da carga recursos disponíveis e configurar expediente contendo
  todo o intervalo informado. Confirmar que o calendário local e UTC batem.
- Preparar `dados-recursos-exemplo.csv`: os IDs 101–105 são **apenas exemplos**;
  substitua por IDs reais e diferentes que existam no banco de teste.
- Antes de cada execução de disputa, limpar reservas/bloqueios do intervalo
  sem tocar em dados de terceiros. Não faça DELETE em banco compartilhado.
- Use senhas **de teste** nos argumentos JMeter; argumentos de linha de comando
  ficam visíveis para processos locais. Não publique senhas nem cookie em JTL.

## Cenários implementados

| Plano | Grupo(s) | Amostra principal | Esperado |
|---|---|---|---|
| `01-consultas.jmx` | Solicitantes autenticados | GET /api/recursos | 200, tempo p50/p95/p99, taxa de erro |
| `02-disputa-reserva.jmx` | 8 solicitantes simultâneos | POST /api/reservas com mesmo recurso e intervalo | Uma 201, demais 409 sob banco inicial vazio |
| `03-recursos-distintos.jmx` | 5 solicitantes com CSV de recursos distintos | POST /api/reservas | 201 para cada usuário, throughput sem lock global |
| `04-manutencao-vs-reserva.jmx` | Solicitante e Admin | POST /api/reservas e POST /api/recursos/{id}/bloqueios | Uma operação válida e outra conflito 409, sem agenda contraditória |

Cada thread faz GET CSRF → POST login (form URL-encoded) → GET CSRF novamente
(renovado após login) antes da chamada de negócio. As sessões não são compartilhadas
entre usuários virtuais. Os 409 de **disputa/manutenção** são classificados como
resultado de negócio esperado; 409 em **recursos distintos** não é aceito.

**Limite metodológico:** os grupos concorrentes aproximam o instante da disputa,
mas o JMeter não assegura interleaving preciso nem qual thread vencerá.
Valide estados e contagens no MySQL **depois** da execução; não avalie só status HTTP.

## Executar (exemplo local)

Ajustar argumentos de acordo com o ambiente; usar SOMENTE contas artificiais.

```bash
# Exemplo: teste de consulta com 5 threads, 10 consultas por thread
jmeter -n -t docs/qualidade/jmeter/01-consultas.jmx \
  -l consulta.jtl -e -o relatorio-consulta \
  -Jhost=localhost -Jport=8080 -Jprotocol=http \
  -Jemail=solicitante@teste.local -Jsenha=SENHA_TESTE \
  -Jthreads=5 -Jramp=5 -Jloops=10

# Disputa de mesmo recurso: ambiente limpo e intervalo configurado
jmeter -n -t docs/qualidade/jmeter/02-disputa-reserva.jmx \
  -l disputa.jtl -e -o relatorio-disputa \
  -Jhost=localhost -Jport=8080 \
  -Jemail=solicitante@teste.local -Jsenha=SENHA_TESTE \
  -JrecursoConflito=101 -Jthreads=8 -Jramp=1 \
  -Jinicio=2026-11-13T10:00:00-03:00 -Jfim=2026-11-13T11:00:00-03:00

# Reservas de recursos diferentes: preparar CSV com IDs reais
jmeter -n -t docs/qualidade/jmeter/03-recursos-distintos.jmx \
  -l distintos.jtl -e -o relatorio-distintos \
  -Jemail=solicitante@teste.local -Jsenha=SENHA_TESTE \
  -Jcsv=docs/qualidade/jmeter/dados-recursos-exemplo.csv \
  -Jthreads=5 -Jramp=1 \
  -Jinicio=2026-11-13T12:00:00-03:00 -Jfim=2026-11-13T13:00:00-03:00

# Manutenção: duas contas de teste com perfis distintos
jmeter -n -t docs/qualidade/jmeter/04-manutencao-vs-reserva.jmx \
  -l manutencao.jtl -e -o relatorio-manutencao \
  -Jemail=solicitante@teste.local -Jsenha=SENHA_TESTE \
  -JemailAdmin=admin@teste.local -JsenhaAdmin=SENHA_ADMIN_TESTE \
  -JrecursoConflito=101 -Jthreads=1 -JthreadsAdmin=1 -Jramp=1 \
  -Jinicio=2026-11-13T14:00:00-03:00 -Jfim=2026-11-13T15:00:00-03:00
```

As datas acima são **exemplos**: devem estar no futuro em relação ao relógio da
aplicação e dentro do expediente. Caso o período já tenha passado, troque por datas
futuras. Os relatórios HTML exigem diretório de saída ainda inexistente.

## Consolidar métricas
```bash
python3 docs/qualidade/jmeter/analisar_jtl.py consulta.jtl --cenario consultas
python3 docs/qualidade/jmeter/analisar_jtl.py disputa.jtl --cenario disputa
python3 docs/qualidade/jmeter/analisar_jtl.py distintos.jtl --cenario distintos
python3 docs/qualidade/jmeter/analisar_jtl.py manutencao.jtl --cenario manutencao
```

O analisador informa throughput, p50/p95/p99, sucessos HTTP, 409 esperados e
falhas inesperadas por amostra, sem inventar números. Anexar saída, `.jtl` e
dashboard HTML **somente após executar**. Sem .jtl não há medição.

## Consultas SQL após a disputa (em banco isolado)

```sql
-- Contagem de reservas ativas para recurso e período de teste
SELECT r.status, COUNT(*) AS quantidade
FROM reservas r
JOIN reserva_recursos rr ON rr.reserva_id = r.id
WHERE rr.recurso_id = 101
  AND r.inicio_utc = '2026-11-13 13:00:00'
  AND r.fim_utc = '2026-11-13 14:00:00'
GROUP BY r.status;

-- Inspecionar bloqueios de manutenção que colidiriam com a reserva
SELECT id, recurso_id, status, inicio_utc, fim_utc
FROM bloqueios_recursos
WHERE recurso_id = 101 AND status = 'ATIVO';
```

**Corrigir datas UTC** e ID ao seu cenário (10h–11h -03:00 = 13h–14h UTC).
Uma única reserva ativa deve existir no cenário de mesmo recurso/horário; no
cenário manutenção, conferir que não há reserva e bloqueio ativos sobrepostos.

## Critérios de aceite a combinar com a equipe

O guia não exige SLA universal. Proposta **para ratificação da equipe**:
- Sem HTTP 5xx inesperado; 401/403 são esperados apenas no cenário negativo.
- GET consulta p95 abaixo de 1000 ms para 5 usuários virtuais no ambiente descrito.
- Disputa no mesmo intervalo: uma única reserva ativa/uma operação vencedora.
- Recursos distintos: todos válidos aceitos e sem espera global desproporcional.
- Registrar throughput, p50/p95/p99, % erros inesperados, configurações de
  Hikari, versão do MySQL, CPU/RAM do host, duração, ramp-up, tamanho da base.
Nenhum critério de latência está **aprovado/medido** até a equipe avaliar os dados.

## Atenção à cobertura
A pesquisa de disponibilidade pela agenda usa GET /api/recursos e filtros,
mas o projeto ainda não possui GET /api/reservas/{id}. A instrumentação de
sessão/CSRF garante tráfego autenticado, não simula a experiência do navegador.
