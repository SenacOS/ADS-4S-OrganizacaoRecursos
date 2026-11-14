package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.AcaoReserva;
import br.senac.recursos.reserva.dominio.AlteracaoConcorrenteException;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.ConflitoDisponibilidadeException;
import br.senac.recursos.reserva.dominio.DetectorConflitos;
import br.senac.recursos.reserva.dominio.ForaDoExpedienteException;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.Ocupacao;
import br.senac.recursos.reserva.dominio.RecursoIndisponivelException;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.ReservaNaoEncontradaException;
import java.time.Clock;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.UnaryOperator;
import java.util.stream.Stream;

/**
 * Casos de uso de reserva (RF04, RF05, RF06, RF07).
 *
 * <p>Esta classe NÃO abre transação: o adaptador Spring (PR de integração) deve anotar cada método
 * público com {@code @Transactional(isolation = READ_COMMITTED)}. Quando houver erro, a transação
 * inteira sofre rollback e nada fica gravado (nenhum vínculo ou auditoria órfãos).
 *
 * <p>Protocolo (ADR-003): validar entrada e expediente, ordenar IDs, bloquear, só então ler
 * ocupações, decidir, gravar, auditar e registrar notificação.
 */
public class ReservaService {


    private final RecursosPort recursos;
    private final ReservaRepositorio reservas;
    private final OcupacoesPort ocupacoes;
    private final ExpedientePort expediente;
    private final AuditoriaPort auditoria;
    private final NotificacaoPort notificacoes;
    private final ConflitosEvitadosPort conflitosEvitados;
    private final Clock clock;

    public ReservaService(RecursosPort recursos, ReservaRepositorio reservas, OcupacoesPort ocupacoes,
                          ExpedientePort expediente, AuditoriaPort auditoria, NotificacaoPort notificacoes,
                          ConflitosEvitadosPort conflitosEvitados, Clock clock) {
        this.recursos = recursos;
        this.reservas = reservas;
        this.ocupacoes = ocupacoes;
        this.expediente = expediente;
        this.auditoria = auditoria;
        this.notificacoes = notificacoes;
        this.conflitosEvitados = conflitosEvitados;
        this.clock = clock;
    }

    public Reserva criar(ComandoReserva comando, AtorReserva ator) {
        String correlacao = novaCorrelacao();
        exigirExpediente(comando.intervalo());
        List<Long> ids = normalizar(comando.recursoIds());

        List<RecursoInfo> bloqueados = recursos.bloquear(ids);
        validarAtivos(bloqueados);
        boolean restrita = bloqueados.stream().anyMatch(RecursoInfo::restrito);
        verificarConflitos(comando.intervalo(), ids, null, ator);

        Reserva criada = reservas.salvar(
                Reserva.solicitar(ator.usuarioId(), comando.intervalo(), ids, restrita));
        auditar(AcaoReserva.CRIACAO, ator, null, criada.resumo(), criada, correlacao);
        notificar(TipoEventoNotificacao.RESERVA_CRIADA, criada, correlacao);

        if (restrita) {
            return criada;
        }
        Reserva aprovada = reservas.salvar(criada.aprovarAutomaticamente());
        auditar(AcaoReserva.APROVACAO_AUTOMATICA, ator, criada.status().name(), aprovada.status().name(),
                aprovada, correlacao);
        notificar(TipoEventoNotificacao.RESERVA_APROVADA, aprovada, correlacao);
        return aprovada;
    }

    public Reserva editar(long reservaId, ComandoReserva comando, AtorReserva ator) {
        String correlacao = novaCorrelacao();
        exigirExpediente(comando.intervalo());
        List<Long> novos = normalizar(comando.recursoIds());

        Bloqueada bloqueada = carregarBloqueando(reservaId, novos);
        List<RecursoInfo> dosNovos = bloqueada.recursos().stream().filter(r -> novos.contains(r.id())).toList();
        validarAtivos(dosNovos);
        boolean novaRestrita = dosNovos.stream().anyMatch(RecursoInfo::restrito);

        Reserva antes = bloqueada.reserva();
        Reserva editada = antes.reagendar(ator, comando.intervalo(), novos, novaRestrita);
        verificarConflitos(comando.intervalo(), novos, reservaId, ator);

        Reserva salva = reservas.salvar(editada);
        auditar(AcaoReserva.EDICAO, ator, antes.resumo(), salva.resumo(), salva, correlacao);
        return salva;
    }

    /**
     * Aprovação com revalidação (Q8). Na mesma transação e sob os locks dos recursos da reserva:
     * autorização (Q9), regra de domínio (papel, autoaprovação e estado), recursos ativos,
     * expediente atual e ocupações atuais (reservas, manutenção e retiradas abertas), ignorando a
     * própria reserva. Só depois de tudo válido a aprovação é gravada, auditada e notificada.
     * Qualquer recusa lança exceção e a transação sofre rollback, mantendo a reserva SOLICITADA.
     */
    public Reserva aprovar(long reservaId, AtorReserva ator) {
        String correlacao = novaCorrelacao();
        Bloqueada bloqueada = carregarBloqueando(reservaId, List.of());
        Reserva antes = bloqueada.reserva();
        validarAutorizacaoReserva(antes, ator, AcaoReserva.APROVACAO);

        // Domínio primeiro (em memória, nada é gravado): estado/permissão inválidos não viram 409.
        Reserva aprovada = antes.aprovar(ator);

        validarAtivos(bloqueada.recursos());
        exigirExpediente(antes.intervalo());
        verificarConflitos(antes.intervalo(), antes.recursoIds(), reservaId, ator);

        Reserva salva = reservas.salvar(aprovada);
        auditar(AcaoReserva.APROVACAO, ator, antes.status().name(), salva.status().name(), salva, correlacao);
        notificar(TipoEventoNotificacao.RESERVA_APROVADA, salva, correlacao);
        return salva;
    }

    public Reserva rejeitar(long reservaId, AtorReserva ator, String motivo) {
        return transicionar(reservaId, ator, AcaoReserva.REJEICAO, r -> r.rejeitar(ator, motivo),
                TipoEventoNotificacao.RESERVA_REJEITADA);
    }

    /** Q5: {@code motivo} é obrigatório quando o Administrador cancela reserva de terceiro. */
    public Reserva cancelar(long reservaId, AtorReserva ator, String motivo) {
        return transicionar(reservaId, ator, AcaoReserva.CANCELAMENTO, r -> r.cancelar(ator, motivo),
                TipoEventoNotificacao.RESERVA_CANCELADA);
    }

    public Reserva iniciarUso(long reservaId, AtorReserva ator) {
        return transicionar(reservaId, ator, AcaoReserva.INICIO_DE_USO, r -> r.iniciarUso(ator), null);
    }

    public Reserva concluir(long reservaId, AtorReserva ator) {
        return transicionar(reservaId, ator, AcaoReserva.CONCLUSAO, r -> r.concluir(ator), null);
    }

    public Reserva registrarNaoComparecimento(long reservaId, AtorReserva ator) {
        return transicionar(reservaId, ator, AcaoReserva.NAO_COMPARECIMENTO,
                r -> r.registrarNaoComparecimento(ator), null);
    }

    /**
     * Consulta informativa (S4): sem lock, sem gravação, sem auditoria e sem contar "conflito evitado".
     * Reusa o {@link DetectorConflitos}. Não verifica existência nem se o recurso está ativo
     * (isso é a pesquisa de recursos, RF03). Devolve só a origem do bloqueio, nunca quem ocupa.
     * {@code ignorarReservaId}: reserva em edição, que não conflita consigo mesma (pode ser nulo).
     */
    public ResultadoDisponibilidade consultarDisponibilidade(Collection<Long> recursoIds,
                                                             IntervaloReserva intervalo, Long ignorarReservaId) {
        List<Long> ids = normalizar(recursoIds);
        boolean dentro = expediente.atual().comporta(intervalo);
        List<Ocupacao> existentes = ocupacoes.buscar(ids, intervalo);
        List<DisponibilidadeRecurso> situacao = ids.stream().map(id -> {
            Optional<Ocupacao> conflito =
                    DetectorConflitos.primeiroConflito(intervalo, List.of(id), existentes, ignorarReservaId);
            return new DisponibilidadeRecurso(id, conflito.isEmpty(), conflito.map(Ocupacao::origem).orElse(null));
        }).toList();
        return new ResultadoDisponibilidade(dentro, situacao);
    }

    public ResultadoDisponibilidade consultarDisponibilidade(Collection<Long> recursoIds, IntervaloReserva intervalo) {
        return consultarDisponibilidade(recursoIds, intervalo, null);
    }

    private Reserva transicionar(long reservaId, AtorReserva ator, AcaoReserva acao,
                                 UnaryOperator<Reserva> operacao, TipoEventoNotificacao evento) {
        String correlacao = novaCorrelacao();
        Reserva antes = carregarBloqueando(reservaId, List.of()).reserva();
        validarAutorizacaoReserva(antes, ator, acao);
        Reserva salva = reservas.salvar(operacao.apply(antes));
        auditar(acao, ator, antes.status().name(), salva.status().name(), salva, correlacao);
        if (evento != null) {
            notificar(evento, salva, correlacao);
        }
        return salva;
    }

    /**
     * Extensão para validar a responsabilidade após bloquear e reler a reserva.
     * Os testes de domínio usam a implementação pura; o bean transacional
     * sempre aplica a política SQL antes de qualquer decisão.
     */
    protected void validarAutorizacaoReserva(Reserva reserva, AtorReserva ator, AcaoReserva acao) {
        // A implementação transacional associa o ator aos recursos da reserva.
    }

    /**
     * Lê a reserva, bloqueia a união ordenada dos recursos atuais e novos e relê a reserva já sob lock.
     * Se o conjunto de recursos mudou entre as duas leituras, aborta a transação (ADR-003, "Edição").
     */
    private Bloqueada carregarBloqueando(long reservaId, List<Long> recursosExtras) {
        {
            Reserva previa = buscar(reservaId);
            List<Long> uniao = Stream.concat(previa.recursoIds().stream(), recursosExtras.stream())
                    .distinct().sorted().toList();
            List<RecursoInfo> bloqueados = recursos.bloquear(uniao);
            Reserva fresca = buscar(reservaId);
            if (fresca.recursoIds().equals(previa.recursoIds())) {
                return new Bloqueada(fresca, bloqueados);
            }
        }
        throw new AlteracaoConcorrenteException();
    }

    private Reserva buscar(long reservaId) {
        Optional<Reserva> reserva = reservas.buscarPorId(reservaId);
        return reserva.orElseThrow(() -> new ReservaNaoEncontradaException(reservaId));
    }

    private void verificarConflitos(IntervaloReserva intervalo, List<Long> ids, Long ignorarReservaId,
                                    AtorReserva ator) {
        List<Ocupacao> existentes = ocupacoes.buscar(ids, intervalo);
        Optional<Ocupacao> conflito = DetectorConflitos.primeiroConflito(intervalo, ids, existentes, ignorarReservaId);
        if (conflito.isPresent()) {
            Ocupacao o = conflito.get();
            conflitosEvitados.registrar(new RegistroConflitoEvitado(
                    ids, intervalo, ator.usuarioId(), o.recursoId(), o.origem(), clock.instant()));
            throw new ConflitoDisponibilidadeException(o);
        }
    }

    private void exigirExpediente(IntervaloReserva intervalo) {
        if (!expediente.atual().comporta(intervalo)) {
            throw new ForaDoExpedienteException();
        }
    }

    private static void validarAtivos(List<RecursoInfo> recursos) {
        for (RecursoInfo r : recursos) {
            if (!r.ativo()) {
                throw new RecursoIndisponivelException(r.id());
            }
        }
    }

    private static List<Long> normalizar(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("Informe ao menos um recurso.");
        }
        return ids.stream().distinct().sorted().toList();
    }

    private void auditar(AcaoReserva acao, AtorReserva ator, String antes, String depois, Reserva reserva,
                         String correlacao) {
        auditoria.registrar(new RegistroAuditoria("RESERVA", reserva.id(), ator.usuarioId(), acao,
                antes, depois, correlacao, clock.instant()));
    }

    private void notificar(TipoEventoNotificacao tipo, Reserva reserva, String correlacao) {
        notificacoes.registrarPendente(new EventoNotificacao(reserva.id(), tipo, correlacao, clock.instant()));
    }

    private static String novaCorrelacao() {
        return UUID.randomUUID().toString();
    }

    private record Bloqueada(Reserva reserva, List<RecursoInfo> recursos) {
    }
}
