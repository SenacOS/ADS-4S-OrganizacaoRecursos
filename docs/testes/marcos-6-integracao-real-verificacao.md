# Marcos-6 — roteiro humano da integração real

Base da massa preservada em13/11/2026. [Resultados e limites](marcos-6-integracao-real-resultados.md), [massa/horários exatos](marcos-6-integracao-real/resultados.json).

**Aceite do autor em13/11/2026:** Marcos informou ter seguido o passo a passo e obtido os resultados esperados, sem ajuste solicitado. [Registro do aceite](marcos-6-integracao-real-aceite-2026-11-13.md).

1. Na raiz, conferir `git branch --show-current`: `feature/marcos-6-integracao-real`. Executar `node tests/e2e-local/controle.cjs status` ou `iniciar` se os processos próprios estiverem parados. Não usar o worktree m4 para este recorte.
2. Abrir `http://127.0.0.1:18080/login.html` e entrar com a conta de teste **admin** definida no arquivo privado `.aiox-core/local/e2e/credentials.json`. Não compartilhar suas senhas nem usar contas reais. Abrir **Relatórios** pelo menu.
3. Informar **04/12/2026,00:00:00 até04/12/2026,02:00:00**, horários de São Paulo, sem recurso: esperar **3 reservas/61min/0 conflitos**, linhas71/72/73 com60min e74/75 com0min.
4. Manter o período e filtrar o recurso **71**: esperar **1 reserva/60min**, três linhas71/72/73 com60min e explicação dos outros vínculos. Filtrar **74**: **1 reserva/0min**, sem mensagem de ausência de reservas. Filtrar **77**: vazio legítimo,0reservas/0min.
5. Consultar **13/11/2026,19:26:00 até19:29:00**, recurso **71**: esperar **0 reservas/0min/1 conflito**. O conflito ocorreu nessa data, embora a tentativa fosse para04/12; não mudar os dados para reproduzir.
6. Alterar filtros e conferir que o resultado anterior desaparece; consultar por teclado, conferir foco, referência de erro se aplicável, layout desktop/celular e logout. Falha de API deve ser erro, nunca dados simulados.
7. Entrar com as contas de teste Solicitante e Responsável: Relatórios não aparece no menu; a URL direta `/pages/relatorios-utilizacao.html` recusa acesso ao formulário. Encerrar as sessões ao terminar.

- [x] Valores, filtros e conflito conferidos pelo autor.
- [x] Navegação, mensagens, teclado e layout aprovados pelo autor.
- [x] Perfis e saída conferidos pelo autor.

As capturas automatizadas e o PASS técnico local não preenchem este aceite. Registrar ajustes solicitados ou confirmação de Marcos antes do commit. Se a massa for alterada posteriormente, consultar o inventário/JSON da rodada ou executar o auxiliar para nova massa, preservando o histórico.

Para revisar apenas a apresentação com dados fictícios, usar `node tests/browser/relatorios-utilizacao-preview.mjs`, porta4174. Essa prévia identifica **Dados simulados** e não substitui os passos acima com Spring/MySQL reais.
