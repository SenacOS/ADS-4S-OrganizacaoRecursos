package br.senac.recursos.reserva.aplicacao;

import static br.senac.recursos.reserva.aplicacao.AmbienteFake.intervalo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.senac.recursos.reserva.dominio.AcaoReserva;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.ConflitoDisponibilidadeException;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.StatusReserva;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;

/**
 * CT19 (concorrência): várias EDIÇÕES simultâneas de reservas DISTINTAS que disputam o mesmo
 * recurso e horário. Garante que somente uma é aceita e que as demais ficam intactas.
 *
 * <p>Limites: usa os locks em memória do {@link AmbienteFake} (valida o algoritmo do ADR-003 para
 * edição: bloqueio da união ordenada de recursos antigos e novos, leitura de ocupações só depois do
 * lock). O fake NÃO faz rollback, então "nada parcial" é verificado pela ausência de gravação antes
 * do conflito. A prova com InnoDB real depende de um teste em MySQL/Testcontainers (Fausto).
 *
 * <p>Não cobre duas atualizações simultâneas da MESMA reserva: esse comportamento não foi decidido.
 */
class ReservaEdicaoConcorrenteTest {

    private static final IntervaloReserva ALVO = intervalo("14:00", "15:00");
    private static final int RODADAS = 20;
    /** Atraso entre ler as ocupações e gravar: sem lock, todos leem "livre" e a corrida aparece. */
    private static final long ATRASO_MS = 30;

    private static AtorReserva dono(int indice) {
        return new AtorReserva(100 + indice, PapelAtor.SOLICITANTE);
    }

    private static Reserva criarNoSetup(AmbienteFake amb, AtorReserva ator, IntervaloReserva i, Long... recursos) {
        return amb.transacao(() -> amb.servico().criar(new ComandoReserva(i, List.of(recursos)), ator));
    }

    private static Callable<Object> editar(AmbienteFake amb, Reserva r, AtorReserva ator, IntervaloReserva novo,
                                           Long... recursos) {
        ReservaService servico = amb.servico();
        return () -> amb.transacao(() -> servico.editar(r.id(), new ComandoReserva(novo, List.of(recursos)), ator));
    }

    private static Callable<Object> criar(AmbienteFake amb, AtorReserva ator, IntervaloReserva i, Long... recursos) {
        ReservaService servico = amb.servico();
        return () -> amb.transacao(() -> servico.criar(new ComandoReserva(i, List.of(recursos)), ator));
    }

    /** Libera todas as tarefas ao mesmo tempo. Estouro de tempo indica deadlock. */
    private static List<Object> disputar(List<Callable<Object>> tarefas) throws Exception {
        int n = tarefas.size();
        CountDownLatch prontos = new CountDownLatch(n);
        CountDownLatch largada = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(n);
        try {
            List<Future<Object>> futuros = new ArrayList<>();
            for (Callable<Object> tarefa : tarefas) {
                futuros.add(pool.submit(() -> {
                    prontos.countDown();
                    largada.await();
                    try {
                        return tarefa.call();
                    } catch (ConflitoDisponibilidadeException e) {
                        return e;
                    }
                }));
            }
            assertTrue(prontos.await(5, TimeUnit.SECONDS), "threads não ficaram prontas");
            largada.countDown();
            List<Object> resultados = new ArrayList<>();
            for (Future<Object> f : futuros) {
                resultados.add(f.get(15, TimeUnit.SECONDS));
            }
            return resultados;
        } finally {
            pool.shutdownNow();
        }
    }

    private static long sucessos(List<Object> resultados) {
        return resultados.stream().filter(r -> r instanceof Reserva).count();
    }

    private static long conflitos(List<Object> resultados) {
        return resultados.stream().filter(r -> r instanceof ConflitoDisponibilidadeException).count();
    }

    private static long edicoesAuditadas(AmbienteFake amb) {
        return amb.auditorias.stream().filter(a -> a.acao() == AcaoReserva.EDICAO).count();
    }

    private static long reservasNoAlvo(AmbienteFake amb) {
        return amb.armazem.values().stream().filter(r -> r.intervalo().equals(ALVO)).count();
    }

    /** Invariante global: nenhum recurso tem duas reservas ativas sobrepostas. */
    private static void assertSemSobreposicao(AmbienteFake amb) {
        List<Reserva> ativas = amb.armazem.values().stream().filter(r -> r.status().ocupaAgenda()).toList();
        for (int a = 0; a < ativas.size(); a++) {
            for (int b = a + 1; b < ativas.size(); b++) {
                Reserva x = ativas.get(a);
                Reserva y = ativas.get(b);
                boolean recursoComum = x.recursoIds().stream().anyMatch(y.recursoIds()::contains);
                assertFalse(recursoComum && x.intervalo().sobrepoe(y.intervalo()),
                        "Dupla reserva entre " + x.id() + " e " + y.id());
            }
        }
    }

    @Test
    void seisEdicoesParaOMesmoRecursoEHorario_exatamenteUmaVenceEAsOutrasFicamIntactas() throws Exception {
        int n = 6;
        for (int rodada = 0; rodada < RODADAS; rodada++) {
            AmbienteFake amb = new AmbienteFake().comRecursos(1);
            Map<Long, IntervaloReserva> originais = new HashMap<>();
            List<Callable<Object>> tarefas = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                IntervaloReserva original = intervalo(String.format("%02d:00", 7 + i), String.format("%02d:00", 8 + i));
                Reserva r = criarNoSetup(amb, dono(i), original, 1L);
                originais.put(r.id(), original);
                tarefas.add(editar(amb, r, dono(i), ALVO, 1L));
            }
            amb.atrasoAposLeituraMs = ATRASO_MS;

            List<Object> resultados = disputar(tarefas);

            String contexto = "rodada " + rodada;
            assertEquals(1, sucessos(resultados), contexto);
            assertEquals(n - 1, conflitos(resultados), contexto);
            assertEquals(n, amb.armazem.size(), contexto);
            assertEquals(1, reservasNoAlvo(amb), contexto);
            for (Reserva r : amb.armazem.values()) {
                if (!r.intervalo().equals(ALVO)) {
                    assertEquals(originais.get(r.id()), r.intervalo(), contexto + ": perdedora alterada");
                }
                assertEquals(StatusReserva.APROVADA, r.status(), contexto);
                assertEquals(List.of(1L), r.recursoIds(), contexto);
            }
            assertEquals(n - 1, amb.conflitos.size(), contexto);
            assertEquals(1, edicoesAuditadas(amb), contexto);
            assertSemSobreposicao(amb);
        }
    }

    @Test
    void edicoesQueTrocamRecursosEmOrdemOpostaNaoCausamDeadlockEAmbasPassam() throws Exception {
        for (int rodada = 0; rodada < RODADAS; rodada++) {
            AmbienteFake amb = new AmbienteFake().comRecursos(1, 2);
            Reserva a = criarNoSetup(amb, dono(0), intervalo("09:00", "10:00"), 1L);
            Reserva b = criarNoSetup(amb, dono(1), intervalo("11:00", "12:00"), 2L);
            amb.ordensDeBloqueio.clear();
            amb.atrasoAposLeituraMs = ATRASO_MS;

            // A vai do recurso 1 para o 2; B vai do 2 para o 1; no fim ocupam recursos diferentes.
            List<Object> resultados = disputar(List.of(
                    editar(amb, a, dono(0), ALVO, 2L),
                    editar(amb, b, dono(1), ALVO, 1L)));

            String contexto = "rodada " + rodada;
            assertEquals(2, sucessos(resultados), contexto);
            assertEquals(List.of(2L), amb.armazem.get(a.id()).recursoIds(), contexto);
            assertEquals(List.of(1L), amb.armazem.get(b.id()).recursoIds(), contexto);
            assertEquals(2, amb.ordensDeBloqueio.size(), contexto);
            assertTrue(amb.ordensDeBloqueio.stream().allMatch(o -> o.equals(List.of(1L, 2L))),
                    contexto + ": ordem de bloqueio " + amb.ordensDeBloqueio);
            assertSemSobreposicao(amb);
        }
    }

    @Test
    void edicoesComRecursosOriginaisDiferentesQueDisputamUmRecursoComumUmaVence() throws Exception {
        for (int rodada = 0; rodada < RODADAS; rodada++) {
            AmbienteFake amb = new AmbienteFake().comRecursos(1, 2, 3, 4);
            Reserva a = criarNoSetup(amb, dono(0), intervalo("09:00", "10:00"), 1L);
            Reserva b = criarNoSetup(amb, dono(1), intervalo("09:00", "10:00"), 3L);
            Reserva c = criarNoSetup(amb, dono(2), intervalo("09:00", "10:00"), 4L);
            amb.atrasoAposLeituraMs = ATRASO_MS;

            // Só compartilham o recurso 2 DEPOIS da edição: o lock precisa cobrir os recursos novos.
            List<Object> resultados = disputar(List.of(
                    editar(amb, a, dono(0), ALVO, 2L),
                    editar(amb, b, dono(1), ALVO, 2L),
                    editar(amb, c, dono(2), ALVO, 2L, 4L)));

            String contexto = "rodada " + rodada;
            assertEquals(1, sucessos(resultados), contexto);
            assertEquals(2, conflitos(resultados), contexto);
            assertEquals(1, reservasNoAlvo(amb), contexto);
            assertEquals(2, amb.conflitos.size(), contexto);
            assertEquals(1, edicoesAuditadas(amb), contexto);
            assertSemSobreposicao(amb);
        }
    }

    @Test
    void edicaoContraCriacaoNoMesmoRecursoEHorarioUmaVence() throws Exception {
        for (int rodada = 0; rodada < RODADAS; rodada++) {
            AmbienteFake amb = new AmbienteFake().comRecursos(1);
            Reserva existente = criarNoSetup(amb, dono(0), intervalo("09:00", "10:00"), 1L);
            amb.atrasoAposLeituraMs = ATRASO_MS;

            List<Object> resultados = disputar(List.of(
                    editar(amb, existente, dono(0), ALVO, 1L),
                    criar(amb, dono(1), ALVO, 1L)));

            String contexto = "rodada " + rodada;
            assertEquals(1, sucessos(resultados), contexto);
            assertEquals(1, conflitos(resultados), contexto);
            assertEquals(1, reservasNoAlvo(amb), contexto);
            assertEquals(1, amb.conflitos.size(), contexto);
            assertSemSobreposicao(amb);
        }
    }

    @Test
    void controleNegativo_semLockDuasEdicoesProduzemDuplaReserva() throws Exception {
        AmbienteFake amb = new AmbienteFake().comRecursos(1);
        Reserva a = criarNoSetup(amb, dono(0), intervalo("09:00", "10:00"), 1L);
        Reserva b = criarNoSetup(amb, dono(1), intervalo("11:00", "12:00"), 1L);
        amb.usarLocks = false;
        amb.atrasoAposLeituraMs = 150; // ambas leem "livre" antes de qualquer gravação

        List<Object> resultados = disputar(List.of(
                editar(amb, a, dono(0), ALVO, 1L),
                editar(amb, b, dono(1), ALVO, 1L)));

        assertTrue(sucessos(resultados) > 1, "sem lock esperava-se mais de uma edição aceita");
        assertEquals(2, reservasNoAlvo(amb));
    }
}
