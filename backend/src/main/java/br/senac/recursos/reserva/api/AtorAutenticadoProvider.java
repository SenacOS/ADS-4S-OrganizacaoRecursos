package br.senac.recursos.reserva.api;

import br.senac.recursos.reserva.dominio.AtorReserva;

/**
 * PONTO DE INTEGRAÇÃO (implementar: Débora, D1).
 *
 * <p>Devolve o usuário autenticado e seu perfil a partir do contexto do Spring Security.
 * Nunca deve ler identidade ou papel do corpo, parâmetros ou cabeçalhos da requisição.
 * Requisições sem sessão válida devem ser recusadas (401) pelo Spring Security antes do controller.
 */
public interface AtorAutenticadoProvider {

    AtorReserva atorAtual();
}
