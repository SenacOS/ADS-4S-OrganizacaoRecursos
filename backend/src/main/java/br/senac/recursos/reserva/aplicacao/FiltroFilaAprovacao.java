package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.IntervaloReserva;
import java.time.Instant;

public record FiltroFilaAprovacao(IntervaloReserva periodo, Long recursoId, int pagina, int tamanho) {

    public static final int TAMANHO_PADRAO = 20;
    public static final int TAMANHO_MAXIMO = 100;

    public FiltroFilaAprovacao {
        if (recursoId != null && recursoId <= 0) {
            throw new ConsultaInvalidaException("O recurso informado é inválido.");
        }
        if (pagina < 0) {
            throw new ConsultaInvalidaException("A página deve ser maior ou igual a zero.");
        }
        if (tamanho < 1 || tamanho > TAMANHO_MAXIMO) {
            throw new ConsultaInvalidaException("O tamanho da página deve estar entre 1 e " + TAMANHO_MAXIMO + ".");
        }
    }

    public static FiltroFilaAprovacao de(Instant inicio, Instant fim, Long recursoId, Integer pagina,
                                         Integer tamanho) {
        if ((inicio == null) != (fim == null)) {
            throw new ConsultaInvalidaException("Informe início e fim do período juntos.");
        }
        IntervaloReserva periodo = inicio == null ? null : new IntervaloReserva(inicio, fim);
        return new FiltroFilaAprovacao(periodo, recursoId, pagina == null ? 0 : pagina,
                tamanho == null ? TAMANHO_PADRAO : tamanho);
    }
}
