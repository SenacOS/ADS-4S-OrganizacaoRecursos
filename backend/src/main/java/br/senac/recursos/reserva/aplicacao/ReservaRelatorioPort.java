package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.StatusReserva;
import java.util.List;
import java.util.Set;

/**
 * Porta de leitura do relatório de utilização (RF12). Entrega dados persistidos; o cálculo das
 * horas continua em {@code UtilizacaoReservas}.
 *
 * <p>Contrato: período obrigatório; {@code recursoId} nulo consulta todos os recursos e, se
 * informado, deve ser positivo; consulta sem registros devolve lista vazia.
 */
public interface ReservaRelatorioPort {

    /**
     * Reservas que se sobrepõem ao período ({@code inicio_utc < fim} e {@code fim_utc > inicio}),
     * nos estados informados (conjunto não vazio), uma por ID e com todos os vínculos de recurso,
     * ordenadas por início e ID. Com {@code recursoId}, só as que contêm esse vínculo. Os instantes
     * são os originais; o recorte ao período é feito pelo cálculo.
     */
    List<Reserva> buscarReservas(IntervaloReserva periodo, Set<StatusReserva> estados, Long recursoId);

    /**
     * Conflitos evitados com {@code momento >= inicio} e {@code momento < fim}, ordenados por
     * momento e ID. Com {@code recursoId}, filtra o recurso conflitante registrado.
     */
    List<ConflitoEvitadoResumo> buscarConflitosEvitados(IntervaloReserva periodo, Long recursoId);
}
