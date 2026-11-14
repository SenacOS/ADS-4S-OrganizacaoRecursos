package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.Reserva;
import java.util.Optional;

/** PORTA (implementar: Fausto/Silva com JPA). {@code salvar} atribui o id quando nulo. */
public interface ReservaRepositorio {

    Reserva salvar(Reserva reserva);

    /** Deve ler dados atuais (sem snapshot antigo), pois é usada logo após o lock. */
    Optional<Reserva> buscarPorId(long id);
}
