# Organização de Recursos

> **Resumo:** Sistema para gerenciar a alocação de salas, professores e materiais, impedindo conflitos de horário e demonstrando, com evidências objetivas, a qualidade, a segurança, a rastreabilidade e o desempenho da solução.

## Contexto Acadêmico

- **Instituição:** Senac
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Semestre:** 2026.2
- **Disciplina(s):** Qualidade de Software

A especificação oficial do projeto está em:
[especificacao-projeto](https://afonsolelis.github.io/aulas_senac/pages/qualidade2/especificacao-projeto.html)

## Integrantes da Equipe

| Nome | GitHub | Papel/Foco |
|---|---|---|
| Gabriel Silva Gomes | [@jovemOG-Dev](https://github.com/jovemOG-Dev) | A definir |
| Gabriel Rodrigues Fausto | [@gabriel-fausto](https://github.com/gabriel-fausto) | A definir |
| Marcos Boé | [@marcosboe](https://github.com/marcosboe) | A definir |
| Débora dos Santos | [@debbySantos](https://github.com/debbySantos) | A definir |

## Escopo do Sistema

O sistema atende a três perfis de acesso:

- **Solicitante:** professor ou coordenador que consulta a disponibilidade e cria, altera ou cancela reservas.
- **Responsável:** aprova solicitações especiais, valida a alocação de docentes e acompanha retiradas e devoluções de materiais.
- **Administrador:** gerencia salas, professores, materiais, usuários, bloqueios e períodos de manutenção.

Ciclo de vida de uma reserva (matriz de transições em análise):
`SOLICITADA → APROVADA → EM_USO → CONCLUÍDA`, com os estados alternativos `REJEITADA`, `CANCELADA` e `NÃO_COMPARECEU`.

## Tecnologias Utilizadas

Definidas pela especificação:

- **Linguagem e framework:** Java 21 e Spring Boot 3.x
- **Testes:** JUnit 5, Testcontainers e WireMock
- **Qualidade e integração contínua:** GitHub Actions, JaCoCo e SonarCloud
- **Testes de carga:** JMeter

Ainda não decididas pela equipe (registradas em `docs/` quando aprovadas):

- **Interface (frontend):** a definir
- **Banco de dados:** a definir
- **Ferramenta de build:** a definir
- **Autenticação e autorização:** a definir

## Arquitetura e Documentação

A arquitetura está em definição. A organização final de diretórios será registrada aqui quando decidida. Estrutura prevista pelo template, a confirmar:

```
backend/    <-- código-fonte do backend (API, regras de negócio)
frontend/   <-- código-fonte do frontend
docs/       <-- documentação técnica do projeto
```

A pasta `docs/` reúne a documentação técnica. Hoje contém o contexto inicial do projeto e, conforme as fases avançarem, passará a incluir:

- Requisitos, regras de negócio e critérios de aceitação
- Matriz de rastreabilidade (`RTM.md`)
- Diagramas de contexto, componentes e sequências críticas
- Decisões de arquitetura (ADRs)
- Plano e relatório de testes
- Plano e resultado do teste de carga
- Registro de defeitos e relatório final de qualidade

## Metas de Qualidade

| Indicador | Meta |
|---|---|
| Cobertura de linhas | 80% ou mais |
| Cobertura de branches | 70% ou mais |
| Requisitos críticos na RTM | 100% |
| Bugs ou vulnerabilidades críticos | Zero |

## Estado do Projeto

O projeto está na fase de análise de domínio. Ainda não há aplicação executável. As decisões de domínio, arquitetura e tecnologia seguem em análise pela equipe.

## Como Executar o Projeto

As instruções completas serão publicadas quando houver uma versão executável. O passo a passo abaixo é provisório.

### Pré-requisitos

- Java 21
- Git
- Docker (necessário para os testes com Testcontainers)
- Demais requisitos: a definir com as decisões de banco de dados, interface e build

### Passo a Passo

1. Clone o repositório:
   ```bash
   git clone https://github.com/SenacOS/nome-do-repositorio.git
   ```
2. Configure as variáveis de ambiente (renomeie `.env.example` para `.env`, se houver).
3. Instalação das dependências: a definir.
4. Execução da aplicação: a definir.

## Screenshots

<!-- Prints da interface, se houver -->

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

*Projeto acadêmico desenvolvido como parte da formação em tecnologia no Senac Brasil, hospedado na organização [SenacOS](https://github.com/SenacOS).*