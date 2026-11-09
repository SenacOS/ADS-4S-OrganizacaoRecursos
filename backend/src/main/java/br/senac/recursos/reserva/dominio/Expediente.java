package br.senac.recursos.reserva.dominio;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;

/**
 * Funcionamento configurado pelo Administrador (D04, ADR-006).
 * Uma reserva deve caber inteira em uma janela do mesmo dia local; reservas que atravessam
 * a meia-noite não são aceitas na proposta inicial. Sem janelas, nada é aceito.
 */
public record Expediente(ZoneId zona, List<JanelaFuncionamento> janelas) {

    public Expediente {
        Objects.requireNonNull(zona, "zona");
        janelas = List.copyOf(janelas);
    }

    public boolean comporta(IntervaloReserva intervalo) {
        ZonedDateTime inicio = intervalo.inicio().atZone(zona);
        ZonedDateTime fim = intervalo.fim().atZone(zona);
        if (!inicio.toLocalDate().equals(fim.toLocalDate())) {
            return false;
        }
        return janelas.stream().anyMatch(j ->
                j.dia() == inicio.getDayOfWeek()
                        && !inicio.toLocalTime().isBefore(j.inicio())
                        && !fim.toLocalTime().isAfter(j.fim()));
    }
}
