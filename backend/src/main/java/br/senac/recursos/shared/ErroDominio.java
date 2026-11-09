package br.senac.recursos.shared;

public class ErroDominio extends RuntimeException {
  private final int status;
  private final String codigo;

  public ErroDominio(int status, String codigo, String mensagem) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }

  public int status() {
    return status;
  }

  public String codigo() {
    return codigo;
  }

  public static ErroDominio conflito(String mensagem) {
    return new ErroDominio(409, "RECURSO_INDISPONIVEL", mensagem);
  }

  public static ErroDominio ausente() {
    return new ErroDominio(404, "NAO_ENCONTRADO", "Registro não encontrado.");
  }
}
