package br.senac.recursos.reserva.infraestrutura;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.senac.recursos.config.Item18Config;
import br.senac.recursos.reserva.aplicacao.ConflitoEvitadoResumo;
import br.senac.recursos.reserva.aplicacao.ConsultarRelatorioUtilizacao;
import br.senac.recursos.reserva.aplicacao.ReservaRelatorioPort;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.StatusReserva;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.SimpleTransactionStatus;

/**
 * Prova a fronteira transacional do RF12 no container Spring: o bean declarado em
 * {@link Item18Config} é um proxy, abre UMA transação somente leitura em REPEATABLE_READ e as duas
 * consultas da porta rodam dentro dela. Usa um gerenciador de transação registrador (sem banco);
 * a semântica SQL das consultas é coberta por {@code ReservaRelatorioMysqlIT}.
 */
@SpringJUnitConfig(RelatorioUtilizacaoTransacaoSpringTest.Config.class)
class RelatorioUtilizacaoTransacaoSpringTest {

    private static final AtorReserva ADMIN = new AtorReserva(1, PapelAtor.ADMINISTRADOR);
    private static final ConsultarRelatorioUtilizacao.Filtro FILTRO = ConsultarRelatorioUtilizacao.Filtro.de(
            Instant.parse("2026-11-01T03:00:00Z"), Instant.parse("2026-12-01T03:00:00Z"), null, null);

    @Autowired ConsultarRelatorioUtilizacao relatorio;
    @Autowired TmRegistrador tm;
    @Autowired PortaRegistradora porta;

    @BeforeEach
    void limpar() {
        tm.limpar();
        porta.limpar();
    }

    @Test
    void beanDoSpringEProxyDoWrapperTransacional() {
        assertTrue(AopUtils.isAopProxy(relatorio));
        assertInstanceOf(RelatorioUtilizacaoTransacional.class, relatorio);
    }

    @Test
    void executarAbreUmaUnicaTransacaoSomenteLeituraEmRepeatableRead() {
        relatorio.executar(FILTRO, ADMIN);

        assertEquals(1, tm.definicoes.size());
        var def = tm.definicoes.get(0);
        assertTrue(def.isReadOnly());
        assertEquals(TransactionDefinition.ISOLATION_REPEATABLE_READ, def.getIsolationLevel());
        assertEquals(1, tm.commits);
        assertEquals(0, tm.rollbacks);
    }

    @Test
    void asDuasConsultasDaPortaParticipamDaMesmaTransacao() {
        relatorio.executar(FILTRO, ADMIN);

        assertEquals(List.of(true, true), porta.transacaoAtivaNaChamada);
        assertFalse(tm.ativa);
    }

    @Test
    void papelNaoAdministradorFazRollbackSemConsultarAPorta() {
        var solicitante = new AtorReserva(2, PapelAtor.SOLICITANTE);

        assertThrows(OperacaoNaoPermitidaException.class, () -> relatorio.executar(FILTRO, solicitante));

        assertEquals(1, tm.rollbacks);
        assertEquals(0, tm.commits);
        assertTrue(porta.transacaoAtivaNaChamada.isEmpty());
    }

    static class TmRegistrador implements PlatformTransactionManager {
        final List<TransactionDefinition> definicoes = new ArrayList<>();
        int commits;
        int rollbacks;
        volatile boolean ativa;

        @Override
        public TransactionStatus getTransaction(TransactionDefinition definition) {
            definicoes.add(definition);
            ativa = true;
            return new SimpleTransactionStatus(true);
        }

        @Override
        public void commit(TransactionStatus status) {
            commits++;
            ativa = false;
        }

        @Override
        public void rollback(TransactionStatus status) {
            rollbacks++;
            ativa = false;
        }

        void limpar() {
            definicoes.clear();
            commits = 0;
            rollbacks = 0;
            ativa = false;
        }
    }

    static class PortaRegistradora implements ReservaRelatorioPort {
        private final TmRegistrador tm;
        final List<Boolean> transacaoAtivaNaChamada = new ArrayList<>();

        PortaRegistradora(TmRegistrador tm) {
            this.tm = tm;
        }

        @Override
        public List<Reserva> buscarReservas(IntervaloReserva periodo, Set<StatusReserva> estados, Long recursoId) {
            transacaoAtivaNaChamada.add(tm.ativa);
            return List.of();
        }

        @Override
        public List<ConflitoEvitadoResumo> buscarConflitosEvitados(IntervaloReserva periodo, Long recursoId) {
            transacaoAtivaNaChamada.add(tm.ativa);
            return List.of();
        }

        void limpar() {
            transacaoAtivaNaChamada.clear();
        }
    }

    @Configuration
    @EnableTransactionManagement
    static class Config {
        @Bean
        TmRegistrador transactionManager() {
            return new TmRegistrador();
        }

        @Bean
        PortaRegistradora porta(TmRegistrador tm) {
            return new PortaRegistradora(tm);
        }

        /** Usa a MESMA fábrica de produção, para provar o wiring real de Item18Config. */
        @Bean
        ConsultarRelatorioUtilizacao consultarRelatorioUtilizacao(PortaRegistradora porta) {
            return new Item18Config().consultarRelatorioUtilizacao(porta);
        }
    }
}
