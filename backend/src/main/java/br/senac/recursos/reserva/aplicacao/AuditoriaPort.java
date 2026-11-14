package br.senac.recursos.reserva.aplicacao;

/** PORTA (implementar: Débora). Deve gravar na MESMA transação da operação de domínio. */
public interface AuditoriaPort {

    void registrar(RegistroAuditoria registro);
}
