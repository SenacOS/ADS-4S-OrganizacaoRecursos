package br.senac.recursos.reserva.api;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.senac.recursos.reserva.aplicacao.ComandoReserva;
import br.senac.recursos.reserva.aplicacao.ReservaService;
import br.senac.recursos.reserva.dominio.AlteracaoConcorrenteException;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.ConflitoDisponibilidadeException;
import br.senac.recursos.reserva.dominio.ForaDoExpedienteException;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.Ocupacao;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.OrigemOcupacao;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.RecursoIndisponivelException;
import br.senac.recursos.reserva.dominio.RecursoNaoEncontradoException;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.ReservaNaoEncontradaException;
import br.senac.recursos.reserva.dominio.StatusReserva;
import br.senac.recursos.reserva.dominio.TransicaoInvalidaException;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Testa só a camada HTTP, com o serviço e o provedor de ator simulados. Não valida segurança real
 * (sem Spring Security ainda), concorrência nem banco.
 */
@WebMvcTest(controllers = ReservaController.class, properties = "reservas.api.enabled=true")
@AutoConfigureMockMvc(addFilters = false)
class ReservaControllerTest {

    private static final AtorReserva ANA = new AtorReserva(7, PapelAtor.SOLICITANTE);
    private static final IntervaloReserva INTERVALO = new IntervaloReserva(
            Instant.parse("2026-11-10T16:00:00Z"), Instant.parse("2026-11-10T17:00:00Z"));
    private static final String CORPO_VALIDO = """
            {"inicio":"2026-11-10T13:00:00-03:00","fim":"2026-11-10T14:00:00-03:00","recursosIds":[101,305]}""";

    @Autowired
    MockMvc mvc;

    @MockitoBean
    ReservaService servico;

    @MockitoBean
    AtorAutenticadoProvider atores;

    @BeforeEach
    void preparar() {
        when(atores.atorAtual()).thenReturn(ANA);
    }

    private static Reserva aprovada() {
        return Reserva.solicitar(7, INTERVALO, List.of(101L, 305L), false).comId(1001).aprovarAutomaticamente();
    }

    // ---------- criar ----------

    @Test
    void criarValidoRetorna201ComCorpoEDelegaComAtorDoProvedor() throws Exception {
        when(servico.criar(any(), any())).thenReturn(aprovada());

        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(CORPO_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1001))
                .andExpect(jsonPath("$.status").value("APROVADA"))
                .andExpect(jsonPath("$.solicitanteId").value(7))
                .andExpect(jsonPath("$.inicio").value("2026-11-10T13:00:00-03:00"))
                .andExpect(jsonPath("$.recursosIds[0]").value(101));

        ArgumentCaptor<ComandoReserva> comando = ArgumentCaptor.forClass(ComandoReserva.class);
        ArgumentCaptor<AtorReserva> ator = ArgumentCaptor.forClass(AtorReserva.class);
        verify(servico).criar(comando.capture(), ator.capture());
        assertEquals(INTERVALO, comando.getValue().intervalo());
        assertEquals(ANA, ator.getValue());
    }

    @Test
    void solicitanteEnviadoNoCorpoEIgnorado() throws Exception {
        when(servico.criar(any(), any())).thenReturn(aprovada());
        String corpo = """
                {"inicio":"2026-11-10T13:00:00-03:00","fim":"2026-11-10T14:00:00-03:00",
                 "recursosIds":[101],"solicitanteId":999,"papel":"ADMINISTRADOR"}""";

        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated());

        ArgumentCaptor<AtorReserva> ator = ArgumentCaptor.forClass(AtorReserva.class);
        verify(servico).criar(any(), ator.capture());
        assertEquals(ANA, ator.getValue());
    }

    @Test
    void camposObrigatoriosAusentesRetornam400SemChamarOServico() throws Exception {
        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("REQUISICAO_INVALIDA"))
                .andExpect(jsonPath("$.correlationId").value(notNullValue()));
        verifyNoInteractions(servico);
    }

    @Test
    void listaDeRecursosVaziaOuComIdInvalidoRetorna400() throws Exception {
        String vazia = CORPO_VALIDO.replace("[101,305]", "[]");
        String invalido = CORPO_VALIDO.replace("[101,305]", "[-1]");
        for (String corpo : List.of(vazia, invalido)) {
            mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(corpo))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.codigo").value("REQUISICAO_INVALIDA"));
        }
        verifyNoInteractions(servico);
    }

    @Test
    void fimNaoPosteriorAoInicioRetorna400() throws Exception {
        String corpo = CORPO_VALIDO.replace("14:00:00-03:00", "13:00:00-03:00");
        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("REQUISICAO_INVALIDA"));
        verifyNoInteractions(servico);
    }

    @Test
    void jsonMalformadoOuDataForaDoPadraoRetorna400() throws Exception {
        for (String corpo : List.of("{inicio:", CORPO_VALIDO.replace("2026-11-10T13:00:00-03:00", "10/11/2026 13:00"))) {
            mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(corpo))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.codigo").value("REQUISICAO_INVALIDA"));
        }
    }

    @Test
    void tipoDeConteudoNaoJsonRetorna415NoFormatoPadrao() throws Exception {
        mvc.perform(post("/api/reservas").contentType(MediaType.TEXT_PLAIN).content("x"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.codigo").value("TIPO_DE_CONTEUDO_NAO_SUPORTADO"));
    }

    @Test
    void metodoSemMapeamentoRetorna405NoFormatoPadraoEnaoErro500() throws Exception {
        mvc.perform(get("/api/reservas"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.codigo").value("METODO_NAO_PERMITIDO"));
    }

    // ---------- editar ----------

    @Test
    void editarRetorna200EDelegaComId() throws Exception {
        when(servico.editar(anyLong(), any(), any())).thenReturn(aprovada());

        mvc.perform(patch("/api/reservas/1001").contentType(MediaType.APPLICATION_JSON).content(CORPO_VALIDO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1001));
        verify(servico).editar(eq(1001L), any(), eq(ANA));
    }

    @Test
    void editarSemCamposRetorna400() throws Exception {
        mvc.perform(patch("/api/reservas/1001").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        verify(servico, never()).editar(anyLong(), any(), any());
    }

    @Test
    void idNaoNumericoRetorna400() throws Exception {
        mvc.perform(post("/api/reservas/abc/cancelamento"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("REQUISICAO_INVALIDA"));
        verifyNoInteractions(servico);
    }

    // ---------- transições ----------

    @Test
    void cancelarAprovarIniciarConcluirENaoComparecimentoDelegamAoServico() throws Exception {
        Reserva r = aprovada();
        when(servico.cancelar(anyLong(), any(), any())).thenReturn(r);
        when(servico.aprovar(anyLong(), any())).thenReturn(r);
        when(servico.iniciarUso(anyLong(), any())).thenReturn(r);
        when(servico.concluir(anyLong(), any())).thenReturn(r);
        when(servico.registrarNaoComparecimento(anyLong(), any())).thenReturn(r);

        for (String acao : List.of("cancelamento", "aprovacao", "inicio", "conclusao", "nao-comparecimento")) {
            mvc.perform(post("/api/reservas/1001/" + acao)).andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1001));
        }
        verify(servico).cancelar(1001L, ANA, null);
        verify(servico).aprovar(1001L, ANA);
        verify(servico).iniciarUso(1001L, ANA);
        verify(servico).concluir(1001L, ANA);
        verify(servico).registrarNaoComparecimento(1001L, ANA);
    }

    @Test
    void q5CancelamentoRepassaMotivoOpcionalEIgnoraPapelEUsuarioForjadosNoCorpo() throws Exception {
        when(servico.cancelar(anyLong(), any(), any())).thenReturn(aprovada());

        mvc.perform(post("/api/reservas/1001/cancelamento").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivo\":\"obra emergencial\",\"usuarioId\":1,\"papel\":\"ADMINISTRADOR\"}"))
                .andExpect(status().isOk());
        verify(servico).cancelar(1001L, ANA, "obra emergencial");

        mvc.perform(post("/api/reservas/1001/cancelamento").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isOk());
        verify(servico).cancelar(1001L, ANA, null);
    }

    @Test
    void q5CancelamentoRejeitaMotivoComMaisDe500Caracteres() throws Exception {
        String longo = "x".repeat(501);
        mvc.perform(post("/api/reservas/1001/cancelamento").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivo\":\"" + longo + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("REQUISICAO_INVALIDA"));
        verify(servico, never()).cancelar(anyLong(), any(), any());
    }

    @Test
    void q5FaltaDeJustificativaDoAdministradorViraRequisicaoInvalida() throws Exception {
        doThrow(new IllegalArgumentException("Informe a justificativa do cancelamento."))
                .when(servico).cancelar(anyLong(), any(), any());
        mvc.perform(post("/api/reservas/1001/cancelamento"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("REQUISICAO_INVALIDA"));
    }

    @Test
    void rejeitarEnviaMotivoEExigeMotivo() throws Exception {
        Reserva rejeitada = Reserva.solicitar(7, INTERVALO, List.of(5L), true).comId(1001)
                .rejeitar(new AtorReserva(3, PapelAtor.RESPONSAVEL), "sem disponibilidade");
        when(servico.rejeitar(anyLong(), any(), any())).thenReturn(rejeitada);

        mvc.perform(post("/api/reservas/1001/rejeicao").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motivo\":\"sem disponibilidade\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJEITADA"))
                .andExpect(jsonPath("$.motivoDecisao").value("sem disponibilidade"));
        verify(servico).rejeitar(1001L, ANA, "sem disponibilidade");

        for (String corpo : List.of("{}", "{\"motivo\":\"  \"}")) {
            mvc.perform(post("/api/reservas/1001/rejeicao").contentType(MediaType.APPLICATION_JSON).content(corpo))
                    .andExpect(status().isBadRequest());
        }
    }

    // ---------- exceções de domínio ----------

    private record Caso(RuntimeException excecao, int http, String codigo) {
    }

    @Test
    void excecoesDeDominioViramStatusECodigoDoContrato() throws Exception {
        List<Caso> casos = List.of(
                new Caso(new OperacaoNaoPermitidaException("Você não pode cancelar esta reserva."), 403, "OPERACAO_NAO_PERMITIDA"),
                new Caso(new ReservaNaoEncontradaException(1), 404, "NAO_ENCONTRADO"),
                new Caso(new RecursoNaoEncontradoException(2), 404, "NAO_ENCONTRADO"),
                new Caso(new ConflitoDisponibilidadeException(
                        new Ocupacao(1, INTERVALO, OrigemOcupacao.MANUTENCAO, null)), 409, "RECURSO_INDISPONIVEL"),
                new Caso(new RecursoIndisponivelException(3), 409, "RECURSO_DESATIVADO"),
                new Caso(new ForaDoExpedienteException(), 409, "FORA_DO_EXPEDIENTE"),
                new Caso(new TransicaoInvalidaException(StatusReserva.EM_USO, StatusReserva.CANCELADA), 409, "TRANSICAO_INVALIDA"),
                new Caso(new AlteracaoConcorrenteException(), 409, "TENTE_NOVAMENTE"),
                new Caso(new IllegalArgumentException("detalhe interno"), 400, "REQUISICAO_INVALIDA"));

        for (Caso c : casos) {
            doThrow(c.excecao()).when(servico).cancelar(anyLong(), any(), any());
            mvc.perform(post("/api/reservas/1/cancelamento"))
                    .andExpect(status().is(c.http()))
                    .andExpect(jsonPath("$.codigo").value(c.codigo()))
                    .andExpect(jsonPath("$.mensagem").isNotEmpty())
                    .andExpect(jsonPath("$.correlationId").value(notNullValue()));
        }
    }

    @Test
    void conflitoNaoRevelaQuemOcupaORecurso() throws Exception {
        doThrow(new ConflitoDisponibilidadeException(new Ocupacao(1, INTERVALO, OrigemOcupacao.RESERVA, 55L)))
                .when(servico).criar(any(), any());

        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(CORPO_VALIDO))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value(not(containsString("55"))));
    }

    @Test
    void erroInesperadoRetorna500GenericoSemVazarDetalhes() throws Exception {
        doThrow(new RuntimeException("segredo-interno SELECT * FROM usuarios")).when(servico).aprovar(anyLong(), any());

        mvc.perform(post("/api/reservas/1/aprovacao"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.codigo").value("ERRO_INTERNO"))
                .andExpect(jsonPath("$.mensagem").value(not(containsString("segredo"))))
                .andExpect(jsonPath("$.correlationId").value(notNullValue()));
    }

    @Test
    void correlationIdSimplesDoClienteEPreservadoEOSuspeitoESubstituido() throws Exception {
        doThrow(new ReservaNaoEncontradaException(1)).when(servico).cancelar(anyLong(), any(), any());

        mvc.perform(post("/api/reservas/1/cancelamento").header("X-Correlation-Id", "abc-123"))
                .andExpect(jsonPath("$.correlationId").value("abc-123"));
        mvc.perform(post("/api/reservas/1/cancelamento").header("X-Correlation-Id", "x\ny <script>"))
                .andExpect(jsonPath("$.correlationId").value(not(containsString("script"))));
    }
}
