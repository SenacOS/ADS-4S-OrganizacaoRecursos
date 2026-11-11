package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.IntervaloReserva;
import java.time.Instant;

public record FiltroFilaAprovacao(IntervaloReserva periodo, Long recursoId, int pagina, int tamanho) {

    public FiltroFilaAprovacao {
        if (recursoId != null && recursoId <= 0) {
            throw new ConsultaInvalidaException("O recurso informado é inválido.");
        }
        if (pagina < 0) {
            throw new ConsultaInvalidaException("A página deve ser maior ou igual a zero.");
        }
        if (tamanho < 1 || tamanho > 100) {
            throw new ConsultaInvalidaException("O tamanho da página deve estar entre 1 e 100.");
        }
    }

    public static FiltroFilaAprovacao de(Instant inicio, Instant fim, Long recursoId, Integer pagina,
                                         Integer tamanho) {
        if ((inicio == null) != (fim == null)) {
            throw new ConsultaInvalidaException("Informe início e fim do período juntos.");
        }
        IntervaloReserva periodo = inicio == null ? null : new IntervaloReserva(inicio, fim);
        return new FiltroFilaAprovacao(periodo, recursoId, pagina == null ? 0 : pagina,
                tamanho == null ? 20 : tamanho);
    }
}
