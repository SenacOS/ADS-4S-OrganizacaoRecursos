package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.IntervaloReserva;
import java.time.Instant;

public record FiltroFilaAprovacao(IntervaloReserva periodo, Long recursoId, int pagina, int tamanho) {

    public static FiltroFilaAprovacao de(Instant inicio, Instant fim, Long recursoId, Integer pagina,
                                         Integer tamanho) {
        throw new UnsupportedOperationException("não implementado");
    }
}
