package br.senac.recursos.reserva.infraestrutura;

import static org.junit.jupiter.api.Assertions.*;

import br.senac.recursos.reserva.aplicacao.ConflitoEvitadoResumo;
import br.senac.recursos.reserva.aplicacao.ConflitosEvitadosPort;
import br.senac.recursos.reserva.aplicacao.ConsultaInvalidaException;
import br.senac.recursos.reserva.aplicacao.RegistroConflitoEvitado;
import br.senac.recursos.reserva.aplicacao.ReservaRelatorioPort;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.OrigemOcupacao;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.reserva.dominio.UtilizacaoReservas;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** RF12 com MySQL real: porta de leitura do relatório de utilização e de conflitos evitados. */
@SpringBootTest
@Testcontainers
class ReservaRelatorioMysqlIT {
    @Container static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void banco(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired ReservaRelatorioPort relatorio;
    @Autowired ConflitosEvitadosPort conflitos;
    @Autowired PlatformTransactionManager tm;

    private static final Set<StatusReserva> PADRAO = UtilizacaoReservas.ESTADOS_PADRAO;

    @BeforeEach
    void dados() {
        for (String t : List.of("notificacoes", "conflitos_evitados", "movimentacoes",
                "bloqueios_recursos", "auditoria", "responsaveis_recursos", "reserva_recursos",
                "reservas", "materiais", "horarios_funcionamento", "recursos", "usuarios")) {
            jdbc.update("DELETE FROM " + t);
        }
        jdbc.update("INSERT INTO usuarios(id,nome,email,senha_hash,perfil,ativo)"
                + " VALUES (1,'Sol 1','s1@example.org','hash','SOLICITANTE',TRUE)");
        jdbc.update("INSERT INTO recursos(id,tipo,codigo,ativo,restrito) VALUES"
                + " (11,'SALA','SALA-11',TRUE,FALSE),(12,'SALA','SALA-12',TRUE,FALSE),"
                + "(13,'SALA','SALA-13',TRUE,FALSE)");
        reserva(201, "APROVADA", "13:00", "14:00", 11, 12, 13); // três vínculos
        reserva(202, "CONCLUIDA", "14:00", "15:00", 11);       // começa quando o período termina
        reserva(203, "CANCELADA", "13:00", "14:00", 11);       // fora dos estados padrão
        reserva(204, "APROVADA", "12:00", "13:00", 12);        // termina quando o período começa
        reserva(205, "EM_USO", "12:30", "13:30", 12);          // atravessa o início
    }

    private static Instant t(String hhmm) {
        return Instant.parse("2026-11-17T" + hhmm + ":00Z");
    }

    private static String sql(String hhmm) {
        return "2026-11-17 " + hhmm + ":00";
    }

    private static IntervaloReserva periodo(String ini, String fim) {
        return new IntervaloReserva(t(ini), t(fim));
    }

    private void reserva(long id, String status, String ini, String fim, long... recursos) {
        jdbc.update("INSERT INTO reservas(id,solicitante_id,inicio_utc,fim_utc,restrita,status)"
                + " VALUES (?,1,?,?,FALSE,?)", id, sql(ini), sql(fim), status);
        for (long r : recursos) {
            jdbc.update("INSERT INTO reserva_recursos(reserva_id,recurso_id) VALUES (?,?)", id, r);
        }
    }

    private void conflito(long recurso, String ini, String fim, String origem, String momento) {
        jdbc.update("INSERT INTO conflitos_evitados(solicitante_id,recurso_id,inicio_utc,fim_utc,"
                + "origem,momento) VALUES (1,?,?,?,?,?)", recurso, sql(ini), sql(fim), origem, sql(momento));
    }

    private static List<Long> ids(List<Reserva> reservas) {
        return reservas.stream().map(Reserva::id).toList();
    }

    @Test
    void bordasDoPeriodoSaoSemiabertas() {
        // [13:00,14:00): 202 (inicia em 14:00) e 204 (termina em 13:00) apenas encostam.
        var r = relatorio.buscarReservas(periodo("13:00", "14:00"), PADRAO, null);
        assertEquals(List.of(205L, 201L), ids(r)); // ordenadas por início e ID
    }

    @Test
    void reservaComVariosVinculosVemUmaVezComTodosOsRecursos() {
        var todas = relatorio.buscarReservas(periodo("13:00", "14:00"), PADRAO, null);
        assertEquals(1, todas.stream().filter(x -> x.id() == 201L).count());
        var filtrada = relatorio.buscarReservas(periodo("13:00", "14:00"), PADRAO, 12L);
        var r201 = filtrada.stream().filter(x -> x.id() == 201L).findFirst().orElseThrow();
        assertEquals(List.of(11L, 12L, 13L), r201.recursoIds()); // vínculos completos, não só o filtrado
        assertEquals(t("13:00"), r201.intervalo().inicio());      // instantes originais
        assertEquals(t("14:00"), r201.intervalo().fim());
        // Total: 201 conta 1h uma vez (não 3h) + 205 recortada ao período (30 min).
        var res = UtilizacaoReservas.calcular(filtrada, periodo("13:00", "14:00"), PADRAO);
        assertEquals(Duration.ofMinutes(90), res.horasReservadas());
        assertEquals(Duration.ofHours(1), res.porRecurso().get(13L));
    }

    @Test
    void filtroCombinadoDeEstadoERecurso() {
        var p = periodo("13:00", "15:00");
        assertEquals(List.of(203L), ids(relatorio.buscarReservas(p, EnumSet.of(StatusReserva.CANCELADA), 11L)));
        assertEquals(List.of(201L), ids(relatorio.buscarReservas(p, EnumSet.of(StatusReserva.APROVADA), 11L)));
        assertEquals(List.of(201L, 202L), ids(relatorio.buscarReservas(
                p, EnumSet.of(StatusReserva.APROVADA, StatusReserva.CONCLUIDA), 11L)));
        assertEquals(List.of(), ids(relatorio.buscarReservas(p, EnumSet.of(StatusReserva.CANCELADA), 13L)));
    }

    @Test
    void semRegistrosDevolveListaVazia() {
        assertEquals(List.of(), relatorio.buscarReservas(periodo("13:00", "14:00"), PADRAO, 99L));
        assertEquals(List.of(), relatorio.buscarReservas(periodo("01:00", "02:00"), PADRAO, null));
        assertEquals(List.of(), relatorio.buscarConflitosEvitados(periodo("01:00", "02:00"), null));
    }

    @Test
    void parametrosInvalidosSaoRecusados() {
        var p = periodo("13:00", "14:00");
        assertThrows(ConsultaInvalidaException.class, () -> relatorio.buscarReservas(null, PADRAO, null));
        assertThrows(ConsultaInvalidaException.class, () -> relatorio.buscarReservas(p, Set.of(), null));
        assertThrows(ConsultaInvalidaException.class, () -> relatorio.buscarReservas(p, null, null));
        assertThrows(ConsultaInvalidaException.class, () -> relatorio.buscarReservas(p, PADRAO, 0L));
        assertThrows(ConsultaInvalidaException.class, () -> relatorio.buscarConflitosEvitados(null, null));
        assertThrows(ConsultaInvalidaException.class, () -> relatorio.buscarConflitosEvitados(p, -1L));
    }

    @Test
    void conflitosUsamMomentoSemiabertoOrdemEFiltroDeRecurso() {
        conflito(11, "20:00", "21:00", "RESERVA", "13:00");     // momento == início: entra
        conflito(12, "20:00", "21:00", "MANUTENCAO", "13:30");
        conflito(11, "20:00", "21:00", "RETIRADA_ABERTA", "13:30"); // mesmo momento: desempata por ID
        conflito(11, "20:00", "21:00", "RESERVA", "14:00");     // momento == fim: não entra
        conflito(11, "20:00", "21:00", "RESERVA", "12:59");     // antes do período: não entra

        var todos = relatorio.buscarConflitosEvitados(periodo("13:00", "14:00"), null);
        assertEquals(3, todos.size());
        assertEquals(List.of(OrigemOcupacao.RESERVA, OrigemOcupacao.MANUTENCAO,
                OrigemOcupacao.RETIRADA_ABERTA), todos.stream().map(ConflitoEvitadoResumo::origem).toList());
        assertEquals(t("13:00"), todos.get(0).momento());
        assertEquals(periodo("20:00", "21:00"), todos.get(0).intervaloSolicitado());

        var doRecurso11 = relatorio.buscarConflitosEvitados(periodo("13:00", "14:00"), 11L);
        assertEquals(2, doRecurso11.size());
        assertTrue(doRecurso11.stream().allMatch(c -> c.recursoId() == 11L));
    }

    @Test
    void eventoPermaneceGravadoAposRollbackDaTentativa() {
        var momento = t("13:15");
        new TransactionTemplate(tm).executeWithoutResult(s -> {
            conflitos.registrar(new RegistroConflitoEvitado(List.of(11L), periodo("20:00", "21:00"),
                    1L, 11L, OrigemOcupacao.RESERVA, momento));
            s.setRollbackOnly(); // a tentativa falha; o evento é gravado em transação independente
        });
        var lidos = relatorio.buscarConflitosEvitados(periodo("13:00", "14:00"), 11L);
        assertEquals(1, lidos.size());
        assertEquals(momento, lidos.get(0).momento());
        assertEquals(OrigemOcupacao.RESERVA, lidos.get(0).origem());
    }
}
