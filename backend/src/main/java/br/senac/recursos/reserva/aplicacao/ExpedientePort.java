package br.senac.recursos.reserva.aplicacao;

import br.senac.recursos.reserva.dominio.Expediente;

/** PORTA (implementar: Fausto). Devolve o funcionamento vigente configurado pelo Administrador. */
public interface ExpedientePort {

    Expediente atual();
}
