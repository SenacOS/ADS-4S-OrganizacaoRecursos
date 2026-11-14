package br.senac.recursos.reserva.aplicacao;

/**
 * PORTA (implementar: Fausto/Débora). Deve gravar em transação INDEPENDENTE (REQUIRES_NEW),
 * pois a transação da tentativa sofre rollback (RF12).
 */
public interface ConflitosEvitadosPort {

    void registrar(RegistroConflitoEvitado registro);
}
