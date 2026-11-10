# CenÃ¡rio de comportamento ligado a Item18MysqlIT.retiradaConcorrenteUmaVence
# AsserÃ§Ãµes executadas em JUnit/Testcontainers; este arquivo nÃ£o requer Cucumber.
Funcionalidade: impedir dupla retirada de uma unidade
  CenÃ¡rio: dois responsÃ¡veis tentam retirar o mesmo patrimÃ´nio
    Dado um material ativo ligado a uma reserva aprovada dentro do horÃ¡rio
    Quando duas transaÃ§Ãµes independentes tentam registrar a retirada simultaneamente
    EntÃ£o exatamente uma movimentaÃ§Ã£o aberta Ã© persistida
    E a segunda operaÃ§Ã£o Ã© recusada
    E o material permanece indisponÃ­vel atÃ© a devoluÃ§Ã£o

  CenÃ¡rio: devoluÃ§Ã£o mantÃ©m a agenda
    Dado um material retirado com reserva ativa
    Quando o responsÃ¡vel registra a devoluÃ§Ã£o duas vezes
    EntÃ£o somente um retorno e um evento de devoluÃ§Ã£o sÃ£o registrados
    E novos perÃ­odos voltam a considerar expediente, reservas e manutenÃ§Ã£o

# Evidência BDD de comportamento; não se declara TDD retroativo.
