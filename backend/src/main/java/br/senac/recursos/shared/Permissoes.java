package br.senac.recursos.shared;

import br.senac.recursos.reserva.dominio.*;

public final class Permissoes {
  private Permissoes() {}

  public static void exigir(AtorReserva ator, PapelAtor... papeis) {
    if (ator == null) throw new ErroDominio(401, "NAO_AUTENTICADO", "Autenticação necessária.");
    for (var p : papeis) if (ator.papel() == p) return;
    throw new ErroDominio(403, "OPERACAO_NAO_PERMITIDA", "Perfil sem permissão.");
  }
}
