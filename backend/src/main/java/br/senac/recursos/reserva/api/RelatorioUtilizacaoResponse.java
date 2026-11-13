package br.senac.recursos.reserva.api;

import br.senac.recursos.reserva.aplicacao.ConsultarRelatorioUtilizacao;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

/** Resposta do relatório RF12: durações em minutos inteiros; datas com offset de America/Sao_Paulo. */
public record RelatorioUtilizacaoResponse(
        OffsetDateTime inicio,
        OffsetDateTime fim,
        Long recursoId,
        List<String> estados,
        long minutosReservados,
        int reservasConsideradas,
        List<TotalPorRecurso> porRecurso,
        List<TotalPorStatus> porStatus,
        List<ConflitoEvitado> conflitosEvitados) {

    private static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");

    public record TotalPorRecurso(long recursoId, long minutos) {
    }

    public record TotalPorStatus(String status, long minutos) {
    }

    /** Sem a identidade do solicitante. */
    public record ConflitoEvitado(long id, long recursoId, String origem, OffsetDateTime momento,
                                  OffsetDateTime intervaloInicio, OffsetDateTime intervaloFim) {
    }

    public static RelatorioUtilizacaoResponse de(ConsultarRelatorioUtilizacao.Resultado r) {
        var u = r.utilizacao();
        var f = r.filtro();
        return new RelatorioUtilizacaoResponse(
                local(f.periodo().inicio()), local(f.periodo().fim()), f.recursoId(),
                f.estados().stream().map(Enum::name).toList(),
                u.horasReservadas().toMinutes(), u.reservasConsideradas(),
                u.porRecurso().entrySet().stream()
                        .map(e -> new TotalPorRecurso(e.getKey(), minutos(e.getValue()))).toList(),
                u.porStatus().entrySet().stream()
                        .map((Map.Entry<?, Duration> e) -> new TotalPorStatus(String.valueOf(e.getKey()),
                                minutos(e.getValue()))).toList(),
                r.conflitosEvitados().stream().map(c -> new ConflitoEvitado(
                        c.id(), c.recursoId(), String.valueOf(c.origem()), local(c.momento()),
                        local(c.intervaloSolicitado().inicio()), local(c.intervaloSolicitado().fim()))).toList());
    }

    private static long minutos(Duration d) {
        return d.toMinutes();
    }

    private static OffsetDateTime local(Instant i) {
        return i.atZone(ZONA).toOffsetDateTime();
    }
}
