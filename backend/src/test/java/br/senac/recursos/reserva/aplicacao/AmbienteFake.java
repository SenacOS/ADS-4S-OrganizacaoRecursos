package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.Expediente;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.JanelaFuncionamento;
import br.senac.recursos.reserva.dominio.Ocupacao;
import br.senac.recursos.reserva.dominio.OrigemOcupacao;
import br.senac.recursos.reserva.dominio.RecursoNaoEncontradoException;
import br.senac.recursos.reserva.dominio.Reserva;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

/**
 * Implementação em memória de TODAS as portas, só para testes do serviço.
 *
 * <p>ATENÇÃO: os locks aqui são {@link ReentrantLock}, não InnoDB. Servem para validar o ALGORITMO
 * (ordem de aquisição, leitura depois do lock). A prova real continua sendo o teste com MySQL em
 * Testcontainers (CT09/CT10), que depende do adaptador do Fausto.
 */
public class AmbienteFake implements RecursosPort, ReservaRepositorio, OcupacoesPort, ExpedientePort,
        AuditoriaPort, NotificacaoPort, ConflitosEvitadosPort {

    public final Map<Long, RecursoInfo> cadastro = new ConcurrentHashMap<>();
    public final Map<Long, Reserva> armazem = new ConcurrentHashMap<>();
    public final List<Ocupacao> bloqueiosExternos = new CopyOnWriteArrayList<>();
    public final List<List<Long>> ordensDeBloqueio = new CopyOnWriteArrayList<>();
    public final List<RegistroAuditoria> auditorias = new CopyOnWriteArrayList<>();
    public final List<EventoNotificacao> eventos = new CopyOnWriteArrayList<>();
    public final List<RegistroConflitoEvitado> conflitos = new CopyOnWriteArrayList<>();

    public volatile boolean usarLocks = true;
    public volatile long atrasoAposLeituraMs = 0;
    public volatile Runnable aposPrimeiraBusca;

    public final Clock clock = Clock.fixed(Instant.parse("2026-11-09T12:00:00Z"), ZoneOffset.UTC);

    private final Map<Long, ReentrantLock> locks = new ConcurrentHashMap<>();
    private final ThreadLocal<List<ReentrantLock>> seguros = ThreadLocal.withInitial(ArrayList::new);
    private final AtomicLong sequencia = new AtomicLong(1000);
    private final AtomicInteger buscas = new AtomicInteger();
    private final Expediente expediente = new Expediente(ZoneId.of("America/Sao_Paulo"),
            List.of(DayOfWeek.values()).stream()
                    .map(d -> new JanelaFuncionamento(d, LocalTime.of(7, 0), LocalTime.of(22, 0)))
                    .toList());

    public AmbienteFake comRecursos(long... ids) {
        for (long id : ids) {
            cadastro.put(id, new RecursoInfo(id, true, false));
        }
        return this;
    }

    public AmbienteFake comRecursoRestrito(long id) {
        cadastro.put(id, new RecursoInfo(id, true, true));
        return this;
    }

    public AmbienteFake comRecursoInativo(long id) {
        cadastro.put(id, new RecursoInfo(id, false, false));
        return this;
    }

    public ReservaService servico() {
        return new ReservaService(this, this, this, this, this, this, this, clock);
    }

    /** Simula a transação: libera os locks ao final, como o commit/rollback do InnoDB. */
    public <T> T transacao(Supplier<T> corpo) {
        try {
            return corpo.get();
        } finally {
            List<ReentrantLock> adquiridos = seguros.get();
            for (int i = adquiridos.size() - 1; i >= 0; i--) {
                adquiridos.get(i).unlock();
            }
            adquiridos.clear();
        }
    }

    public static Instant instante(String hhmm) {
        return OffsetDateTime.parse("2026-11-10T" + hhmm + ":00-03:00").toInstant();
    }

    public static IntervaloReserva intervalo(String inicio, String fim) {
        return new IntervaloReserva(instante(inicio), instante(fim));
    }

    @Override
    public List<RecursoInfo> bloquear(List<Long> idsOrdenados) {
        ordensDeBloqueio.add(List.copyOf(idsOrdenados));
        List<RecursoInfo> infos = new ArrayList<>();
        for (Long id : idsOrdenados) {
            RecursoInfo info = cadastro.get(id);
            if (info == null) {
                throw new RecursoNaoEncontradoException(id);
            }
            if (usarLocks) {
                ReentrantLock lock = locks.computeIfAbsent(id, k -> new ReentrantLock());
                try {
                    if (!lock.tryLock(5, TimeUnit.SECONDS)) {
                        throw new IllegalStateException("Timeout aguardando lock do recurso " + id);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(e);
                }
                seguros.get().add(lock);
            }
            infos.add(info);
        }
        return infos;
    }

    @Override
    public Reserva salvar(Reserva reserva) {
        Reserva persistida = reserva.id() == null ? reserva.comId(sequencia.incrementAndGet()) : reserva;
        armazem.put(persistida.id(), persistida);
        return persistida;
    }

    @Override
    public Optional<Reserva> buscarPorId(long id) {
        Optional<Reserva> encontrada = Optional.ofNullable(armazem.get(id));
        if (buscas.incrementAndGet() == 1 && aposPrimeiraBusca != null) {
            aposPrimeiraBusca.run();
        }
        return encontrada;
    }

    @Override
    public List<Ocupacao> buscar(Collection<Long> recursoIds, IntervaloReserva intervalo) {
        List<Ocupacao> resultado = new ArrayList<>();
        for (Reserva r : armazem.values()) {
            if (!r.status().ocupaAgenda()) {
                continue;
            }
            for (Long rid : r.recursoIds()) {
                if (recursoIds.contains(rid)) {
                    resultado.add(new Ocupacao(rid, r.intervalo(), OrigemOcupacao.RESERVA, r.id()));
                }
            }
        }
        bloqueiosExternos.stream().filter(o -> recursoIds.contains(o.recursoId())).forEach(resultado::add);
        if (atrasoAposLeituraMs > 0) {
            try {
                Thread.sleep(atrasoAposLeituraMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        return resultado;
    }

    @Override
    public Expediente atual() {
        return expediente;
    }

    @Override
    public void registrar(RegistroAuditoria registro) {
        auditorias.add(registro);
    }

    @Override
    public void registrarPendente(EventoNotificacao evento) {
        eventos.add(evento);
    }

    @Override
    public void registrar(RegistroConflitoEvitado registro) {
        conflitos.add(registro);
    }
}
