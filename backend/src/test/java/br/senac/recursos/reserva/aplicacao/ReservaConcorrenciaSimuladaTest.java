package br.senac.recursos.reserva.aplicacao;

import static br.senac.recursos.reserva.aplicacao.AmbienteFake.intervalo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.ConflitoDisponibilidadeException;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;

/**
 * Valida o ALGORITMO do RF06 (ordem de lock + leitura depois do lock) com locks em memória.
 * NÃO substitui o teste com MySQL/Testcontainers (CT09/CT10), que prova o InnoDB real.
 * O controle negativo mostra que, sem lock, a corrida realmente acontece.
 */
class ReservaConcorrenciaSimuladaTest {

    private static final IntervaloReserva MESMO_HORARIO = intervalo("13:00", "14:00");

    /** Dispara uma criação por lista de recursos, todas liberadas ao mesmo tempo. */
    private static List<Object> disputar(AmbienteFake amb, List<List<Long>> recursosPorThread,
                                         List<IntervaloReserva> intervalos) throws Exception {
        int n = recursosPorThread.size();
        ReservaService servico = amb.servico();
        CountDownLatch prontos = new CountDownLatch(n);
        CountDownLatch largada = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(n);
        try {
            List<Future<Object>> futuros = new ArrayList<>();
            for (int t = 0; t < n; t++) {
                final int idx = t;
                Callable<Object> tarefa = () -> {
                    prontos.countDown();
                    largada.await();
                    AtorReserva ator = new AtorReserva(100 + idx, PapelAtor.SOLICITANTE);
                    try {
                        return amb.transacao(() -> servico.criar(
                                new ComandoReserva(intervalos.get(idx), recursosPorThread.get(idx)), ator));
                    } catch (ConflitoDisponibilidadeException e) {
                        return e;
                    }
                };
                futuros.add(pool.submit(tarefa));
            }
            assertTrue(prontos.await(5, TimeUnit.SECONDS));
            largada.countDown();
            List<Object> resultados = new ArrayList<>();
            for (Future<Object> f : futuros) {
                resultados.add(f.get(15, TimeUnit.SECONDS)); // estouro de tempo = deadlock
            }
            return resultados;
        } finally {
            pool.shutdownNow();
        }
    }

    private static long sucessos(List<Object> resultados) {
        return resultados.stream().filter(r -> r instanceof Reserva).count();
    }

    private static List<IntervaloReserva> repetir(IntervaloReserva i, int n) {
        return java.util.Collections.nCopies(n, i);
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
    void ct09_mesmoRecursoEIntervalo_exatamenteUmaVence() throws Exception {
        for (int rodada = 0; rodada < 20; rodada++) {
            AmbienteFake amb = new AmbienteFake().comRecursos(1);
            List<Object> r = disputar(amb, java.util.Collections.nCopies(8, List.of(1L)), repetir(MESMO_HORARIO, 8));
            assertEquals(1, sucessos(r), "rodada " + rodada);
            assertEquals(7, r.stream().filter(o -> o instanceof ConflitoDisponibilidadeException).count());
            assertEquals(1, amb.armazem.size());
            assertEquals(7, amb.conflitos.size());
            assertEquals(2, amb.auditorias.size()); // só a vencedora: criação + aprovação automática
        }
    }

    @Test
    void ordensOpostasDeRecursosNaoCausamDeadlockEUmaVence() throws Exception {
        for (int rodada = 0; rodada < 20; rodada++) {
            AmbienteFake amb = new AmbienteFake().comRecursos(1, 2);
            List<List<Long>> listas = new ArrayList<>();
            for (int t = 0; t < 8; t++) {
                listas.add(t % 2 == 0 ? List.of(1L, 2L) : List.of(2L, 1L));
            }
            List<Object> r = disputar(amb, listas, repetir(MESMO_HORARIO, 8));
            assertEquals(1, sucessos(r), "rodada " + rodada);
            assertTrue(amb.ordensDeBloqueio.stream().allMatch(o -> o.equals(List.of(1L, 2L))));
        }
    }

    @Test
    void recursosDistintosNaoSeSerializamEtodosPassam() throws Exception {
        AmbienteFake amb = new AmbienteFake().comRecursos(1, 2, 3, 4, 5, 6);
        List<List<Long>> listas = new ArrayList<>();
        for (long id = 1; id <= 6; id++) {
            listas.add(List.of(id));
        }
        List<Object> r = disputar(amb, listas, repetir(MESMO_HORARIO, 6));
        assertEquals(6, sucessos(r));
        assertSemSobreposicao(amb);
    }

    @Test
    void multiRecursoParcialmenteSobrepostoNuncaGeraDuplaReserva() throws Exception {
        for (int rodada = 0; rodada < 20; rodada++) {
            AmbienteFake amb = new AmbienteFake().comRecursos(1, 2, 3, 4);
            // A={1,2}, B={2,3}, C={3,4}: A conflita com B, B conflita com C
            List<List<Long>> listas = List.of(List.of(1L, 2L), List.of(2L, 3L), List.of(3L, 4L));
            List<Object> r = disputar(amb, listas, repetir(MESMO_HORARIO, 3));
            long ok = sucessos(r);
            assertTrue(ok == 1 || ok == 2, "sucessos=" + ok + " rodada " + rodada);
            assertSemSobreposicao(amb);
        }
    }

    @Test
    void controleNegativo_semLockACorridaProduzDuplaReserva() throws Exception {
        AmbienteFake amb = new AmbienteFake().comRecursos(1);
        amb.usarLocks = false;
        amb.atrasoAposLeituraMs = 150; // todos leem "livre" antes de qualquer gravação
        List<Object> r = disputar(amb, java.util.Collections.nCopies(4, List.of(1L)), repetir(MESMO_HORARIO, 4));
        assertTrue(sucessos(r) > 1, "sem lock esperava-se mais de uma reserva, houve " + sucessos(r));
    }
}
