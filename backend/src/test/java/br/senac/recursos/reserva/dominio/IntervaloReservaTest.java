package br.senac.recursos.reserva.dominio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class IntervaloReservaTest {

    private static Instant h(String hhmm) {
        return Instant.parse("2026-11-10T" + hhmm + ":00Z");
    }

    private static IntervaloReserva i(String inicio, String fim) {
        return new IntervaloReserva(h(inicio), h(fim));
    }

    @Test
    void ct01_fimIgualAoInicioEInvalido() {
        assertThatThrownBy(() -> i("09:00", "09:00")).isInstanceOf(IntervaloInvalidoException.class);
    }

    @Test
    void ct02_fimAnteriorAoInicioEInvalido() {
        assertThatThrownBy(() -> i("10:00", "09:00")).isInstanceOf(IntervaloInvalidoException.class);
    }

    @Test
    void inicioOuFimNulosSaoInvalidos() {
        assertThatThrownBy(() -> new IntervaloReserva(null, h("10:00")))
                .isInstanceOf(IntervaloInvalidoException.class);
        assertThatThrownBy(() -> new IntervaloReserva(h("09:00"), null))
                .isInstanceOf(IntervaloInvalidoException.class);
    }

    @ParameterizedTest(name = "{0}-{1} x {2}-{3} => sobrepoe={4}")
    @CsvSource({
            // ct03: apenas encostam
            "09:00, 10:00, 10:00, 11:00, false",
            "10:00, 11:00, 09:00, 10:00, false",
            // ct04: qualquer sobreposição positiva
            "09:00, 10:00, 09:30, 10:30, true",
            "09:30, 10:30, 09:00, 10:00, true",
            // iguais, contido e contendo
            "09:00, 10:00, 09:00, 10:00, true",
            "09:00, 12:00, 10:00, 11:00, true",
            "10:00, 11:00, 09:00, 12:00, true",
            // mesmo início, fins diferentes
            "09:00, 10:00, 09:00, 09:01, true",
            // disjuntos
            "08:00, 09:00, 10:00, 11:00, false"
    })
    void sobreposicaoSemiaberta(String i1, String f1, String i2, String f2, boolean esperado) {
        assertThat(i(i1, f1).sobrepoe(i(i2, f2))).isEqualTo(esperado);
    }

    @Test
    void sobreposicaoEhSimetrica() {
        IntervaloReserva a = i("09:00", "10:00");
        IntervaloReserva b = i("09:30", "10:30");
        assertThat(a.sobrepoe(b)).isEqualTo(b.sobrepoe(a));
    }

    @Test
    void compararComNuloLancaExcecao() {
        assertThatThrownBy(() -> i("09:00", "10:00").sobrepoe(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void duracaoEhFimMenosInicio() {
        assertThat(i("09:00", "10:30").duracao()).isEqualTo(Duration.ofMinutes(90));
    }
}
