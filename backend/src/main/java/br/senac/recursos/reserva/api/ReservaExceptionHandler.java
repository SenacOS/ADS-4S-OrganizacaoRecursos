package br.senac.recursos.reserva.api;

import br.senac.recursos.reserva.dominio.AlteracaoConcorrenteException;
import br.senac.recursos.reserva.dominio.ConflitoDisponibilidadeException;
import br.senac.recursos.reserva.dominio.ForaDoExpedienteException;
import br.senac.recursos.reserva.dominio.IntervaloInvalidoException;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.RecursoIndisponivelException;
import br.senac.recursos.reserva.dominio.RecursoNaoEncontradoException;
import br.senac.recursos.reserva.dominio.ReservaNaoEncontradaException;
import br.senac.recursos.reserva.dominio.TransicaoInvalidaException;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Converte exceções em {@link ErroApi} conforme o contrato. Mensagens nunca expõem SQL,
 * stack trace nem dados de terceiros; o detalhe de erros inesperados fica só no log.
 * Erros do próprio Spring MVC (405, 415, JSON inválido...) também saem no formato padrão.
 */
@RestControllerAdvice
public class ReservaExceptionHandler extends ResponseEntityExceptionHandler {

    static final String CABECALHO_CORRELACAO = "X-Correlation-Id";
    private static final Pattern CORRELACAO_VALIDA = Pattern.compile("[A-Za-z0-9._-]{1,64}");
    private static final Logger LOG = LoggerFactory.getLogger(ReservaExceptionHandler.class);

    @ExceptionHandler(IntervaloInvalidoException.class)
    ResponseEntity<ErroApi> intervaloInvalido(IntervaloInvalidoException ex, WebRequest req) {
        return erro(HttpStatus.BAD_REQUEST, "REQUISICAO_INVALIDA", ex.getMessage(), req);
    }

    @ExceptionHandler(br.senac.recursos.reserva.aplicacao.ConsultaInvalidaException.class)
    ResponseEntity<ErroApi> consultaInvalida(
            br.senac.recursos.reserva.aplicacao.ConsultaInvalidaException ex, WebRequest req) {
        return erro(HttpStatus.BAD_REQUEST, "REQUISICAO_INVALIDA", "Parâmetros de consulta inválidos.", req);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ErroApi> argumentoInvalido(IllegalArgumentException ex, WebRequest req) {
        return erro(HttpStatus.BAD_REQUEST, "REQUISICAO_INVALIDA", "Requisição inválida.", req);
    }

    @ExceptionHandler(OperacaoNaoPermitidaException.class)
    ResponseEntity<ErroApi> naoPermitida(OperacaoNaoPermitidaException ex, WebRequest req) {
        return erro(HttpStatus.FORBIDDEN, "OPERACAO_NAO_PERMITIDA", ex.getMessage(), req);
    }

    @ExceptionHandler({ReservaNaoEncontradaException.class, RecursoNaoEncontradoException.class})
    ResponseEntity<ErroApi> naoEncontrado(RuntimeException ex, WebRequest req) {
        return erro(HttpStatus.NOT_FOUND, "NAO_ENCONTRADO", ex.getMessage(), req);
    }

    @ExceptionHandler(ConflitoDisponibilidadeException.class)
    ResponseEntity<ErroApi> conflito(ConflitoDisponibilidadeException ex, WebRequest req) {
        return erro(HttpStatus.CONFLICT, "RECURSO_INDISPONIVEL", ex.getMessage(), req);
    }

    @ExceptionHandler(RecursoIndisponivelException.class)
    ResponseEntity<ErroApi> recursoDesativado(RecursoIndisponivelException ex, WebRequest req) {
        return erro(HttpStatus.CONFLICT, "RECURSO_DESATIVADO", ex.getMessage(), req);
    }

    /** Código HTTP a confirmar (Q6): hoje 409. */
    @ExceptionHandler(ForaDoExpedienteException.class)
    ResponseEntity<ErroApi> foraDoExpediente(ForaDoExpedienteException ex, WebRequest req) {
        return erro(HttpStatus.CONFLICT, "FORA_DO_EXPEDIENTE", ex.getMessage(), req);
    }

    @ExceptionHandler(TransicaoInvalidaException.class)
    ResponseEntity<ErroApi> transicaoInvalida(TransicaoInvalidaException ex, WebRequest req) {
        return erro(HttpStatus.CONFLICT, "TRANSICAO_INVALIDA", ex.getMessage(), req);
    }

    @ExceptionHandler(AlteracaoConcorrenteException.class)
    ResponseEntity<ErroApi> alteracaoConcorrente(AlteracaoConcorrenteException ex, WebRequest req) {
        return erro(HttpStatus.CONFLICT, "TENTE_NOVAMENTE", ex.getMessage(), req);
    }

    @ExceptionHandler(br.senac.recursos.shared.ErroDominio.class)
    ResponseEntity<ErroApi> dominio(br.senac.recursos.shared.ErroDominio ex, WebRequest req) {
      return erro(HttpStatus.valueOf(ex.status()), ex.codigo(), ex.getMessage(), req);
    }

    @ExceptionHandler(org.springframework.dao.PessimisticLockingFailureException.class)
    ResponseEntity<ErroApi> lock(RuntimeException ex, WebRequest req) {
      return erro(
          HttpStatus.CONFLICT, "TENTE_NOVAMENTE", "OperaÃ§Ã£o concorrente; tente novamente.", req);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    ResponseEntity<ErroApi> integridade(RuntimeException ex, WebRequest req) {
      return erro(
          HttpStatus.CONFLICT,
          "INTEGRIDADE_DOS_DADOS",
          "CÃ³digo, patrimÃ´nio ou vÃ­nculo incompatÃ­vel com os dados existentes.",
          req);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErroApi> inesperado(Exception ex, WebRequest req) {
        String correlacao = correlacao(req);
        LOG.error("Erro inesperado [correlationId={}]", correlacao, ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErroApi("ERRO_INTERNO", mensagemPara(HttpStatus.INTERNAL_SERVER_ERROR), correlacao));
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String campos = ex.getBindingResult().getFieldErrors().stream()
                .map((FieldError f) -> f.getField() + " " + f.getDefaultMessage())
                .sorted()
                .collect(Collectors.joining("; "));
        return corpo(HttpStatus.BAD_REQUEST, "REQUISICAO_INVALIDA", "Dados inválidos: " + campos, request);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return corpo(HttpStatus.BAD_REQUEST, "REQUISICAO_INVALIDA",
                "Corpo da requisição ausente, malformado ou com data fora do padrão ISO 8601.", request);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
            HttpStatusCode statusCode, WebRequest request) {
        HttpStatus status = HttpStatus.valueOf(statusCode.value());
        ErroApi erro = new ErroApi(codigoPara(status), mensagemPara(status), correlacao(request));
        return ResponseEntity.status(statusCode).headers(headers).body(erro);
    }

    private static ResponseEntity<ErroApi> erro(HttpStatus status, String codigo, String mensagem, WebRequest req) {
        return ResponseEntity.status(status).body(new ErroApi(codigo, mensagem, correlacao(req)));
    }

    private static ResponseEntity<Object> corpo(HttpStatus status, String codigo, String mensagem, WebRequest req) {
        return ResponseEntity.status(status).body(new ErroApi(codigo, mensagem, correlacao(req)));
    }

    /** Aceita o ID do cliente só se for simples; caso contrário gera um novo (evita injeção em logs). */
    private static String correlacao(WebRequest req) {
        String recebido = req.getHeader(CABECALHO_CORRELACAO);
        return recebido != null && CORRELACAO_VALIDA.matcher(recebido).matches()
                ? recebido
                : UUID.randomUUID().toString();
    }

    private static String codigoPara(HttpStatus status) {
        return switch (status.value()) {
            case 404 -> "NAO_ENCONTRADO";
            case 405 -> "METODO_NAO_PERMITIDO";
            case 406, 415 -> "TIPO_DE_CONTEUDO_NAO_SUPORTADO";
            default -> status.is4xxClientError() ? "REQUISICAO_INVALIDA" : "ERRO_INTERNO";
        };
    }

    private static String mensagemPara(HttpStatus status) {
        return switch (status.value()) {
            case 404 -> "Recurso não encontrado.";
            case 405 -> "Método não permitido para este endereço.";
            case 406, 415 -> "Tipo de conteúdo não suportado.";
            default -> status.is4xxClientError()
                    ? "Requisição inválida."
                    : "Erro interno. Informe o código de correlação ao suporte.";
        };
    }
}
