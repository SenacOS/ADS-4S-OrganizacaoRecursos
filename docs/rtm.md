# Matriz de rastreabilidade — caminho solicitado na Aula 14

**Situação em 14/11/2026:** PR #50 integrado; CI do PR aprovada. A execução da `main` no commit `5e9b9ea` ocorreu, mas terminou com falha de autorização do SonarCloud (`Not authorized or project not found`). A release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) foi publicada; a CI verde e o Quality Gate do SHA da tag não estão comprovados. Clone limpo independente ainda não foi realizado (limitação do ambiente de verificação); o projeto usa `mvn` instalado, não `./mvnw`.


A **matriz completa e mantida pelo grupo** está em [`docs/RTM.md`](RTM.md), com os requisitos RF01–RF14, contratos, implementação e evidências por requisito. Este arquivo disponibiliza o caminho em letras minúsculas `docs/rtm.md` exigido na entrega, sem criar duas matrizes divergentes.

- [Consultar a RTM canônica](RTM.md).
- [Ver evidências por execução e por commit](evidencias/README.md).
- [Ver a avaliação de release](decisao-qualidade.md).

**Estado:** a RTM original traz referências a commits da `develop` anteriores à integração via PR #47. A presença na `main` não substitui reexecução de testes no commit de release.
