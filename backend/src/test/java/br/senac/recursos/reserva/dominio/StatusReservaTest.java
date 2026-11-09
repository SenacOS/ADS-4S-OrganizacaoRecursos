package br.senac.recursos.reserva.dominio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static br.senac.recursos.reserva.dominio.StatusReserva.*;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.MethodSource;

class StatusReservaTest {

    private static final Map<StatusReserva, Set<StatusReserva>> PERMITIDAS = Map.of(
            SOLICITADA, EnumSet.of(APROVADA, REJEITADA, CANCELADA),
            APROVADA, EnumSet.of(EM_USO, CANCELADA, NAO_COMPARECEU),
            EM_USO, EnumSet.of(CONCLUIDA),
            CONCLUIDA, EnumSet.noneOf(StatusReserva.class),
            REJEITADA, EnumSet.noneOf(StatusReserva.class),
            CANCELADA, EnumSet.noneOf(StatusReserva.class),
            NAO_COMPARECEU, EnumSet.noneOf(StatusReserva.class));

    static Stream<Arguments> todosOsPares() {
        return Stream.of(StatusReserva.values()).flatMap(o ->
                Stream.of(StatusReserva.values()).map(d -> Arguments.of(o, d, PERMITIDAS.get(o).contains(d))));
    }

    @ParameterizedTest(name = "{0} -> {1} permitido={2}")
    @MethodSource("todosOsPares")
    void matrizCompletaDeTransicoes(StatusReserva origem, StatusReserva destino, boolean permitido) {
        assertThat(origem.podeTransitarPara(destino)).isEqualTo(permitido);
        if (permitido) {
            assertThat(origem.transitarPara(destino)).isEqualTo(destino);
        } else {
            assertThatThrownBy(() -> origem.transitarPara(destino))
                    .isInstanceOf(TransicaoInvalidaException.class);
        }
    }

    @Test
    void emUsoNaoPodeSerCancelada() {
        assertThat(EM_USO.podeTransitarPara(CANCELADA)).isFalse();
    }

    @ParameterizedTest
    @EnumSource(StatusReserva.class)
    void destinoNuloNuncaEPermitido(StatusReserva origem) {
        assertThat(origem.podeTransitarPara(null)).isFalse();
    }

    @ParameterizedTest
    @EnumSource(value = StatusReserva.class, names = {"SOLICITADA", "APROVADA", "EM_USO"})
    void estadosQueBloqueiamAgenda(StatusReserva status) {
        assertThat(status.ocupaAgenda()).isTrue();
    }

    @ParameterizedTest
    @EnumSource(value = StatusReserva.class, names = {"CONCLUIDA", "REJEITADA", "CANCELADA", "NAO_COMPARECEU"})
    void estadosFinaisLiberamAgendaEsaoTerminais(StatusReserva status) {
        assertThat(status.ocupaAgenda()).isFalse();
        assertThat(status.terminal()).isTrue();
    }
}
