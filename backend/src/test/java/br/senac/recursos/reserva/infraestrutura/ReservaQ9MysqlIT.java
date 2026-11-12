package br.senac.recursos.reserva.infraestrutura;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.senac.recursos.reserva.aplicacao.ConsultaInvalidaException;
import br.senac.recursos.reserva.dominio.AtorReserva;
import br.senac.recursos.reserva.dominio.IntervaloReserva;
import br.senac.recursos.reserva.dominio.OperacaoNaoPermitidaException;
import br.senac.recursos.reserva.dominio.PapelAtor;
import br.senac.recursos.reserva.dominio.Reserva;
import br.senac.recursos.reserva.dominio.ReservaNaoEncontradaException;
import br.senac.recursos.seguranca.UsuarioPrincipal;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Q9 com MySQL real: restrição antes de COUNT/paginação e detalhes indistinguíveis. */
@SpringBootTest(properties = "reservas.api.enabled=true")
@AutoConfigureMockMvc
@Testcontainers
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class ReservaQ9MysqlIT {
    @Container static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void banco(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired ReservaConsultaMysql consulta;
    @Autowired ReservaAcessoMysql acesso;
    @Autowired MockMvc mvc;

    private static final AtorReserva SOLICITANTE1 = new AtorReserva(1, PapelAtor.SOLICITANTE);
    private static final AtorReserva RESPONSAVEL31 = new AtorReserva(31, PapelAtor.RESPONSAVEL);
    private static final AtorReserva RESPONSAVEL32 = new AtorReserva(32, PapelAtor.RESPONSAVEL);
    private static final AtorReserva ADMIN = new AtorReserva(99, PapelAtor.ADMINISTRADOR);

    @BeforeEach
    void dados() {
        for (String tabela : List.of("responsaveis_recursos", "reserva_recursos", "reservas",
                "salas", "professores", "materiais", "recursos", "usuarios")) {
            jdbc.update("DELETE FROM " + tabela);
        }
        jdbc.update("""
                INSERT INTO usuarios(id,nome,email,senha_hash,perfil,ativo) VALUES
                (1,'Nome confidencial 1','privado1@example.org','hash','SOLICITANTE',TRUE),
                (2,'Nome confidencial 2','privado2@example.org','hash','SOLICITANTE',TRUE),
                (31,'Resp A','responsavel31@example.org','hash','RESPONSAVEL',TRUE),
                (32,'Resp B','responsavel32@example.org','hash','RESPONSAVEL',TRUE),
                (99,'Admin','admin99@example.org','hash','ADMINISTRADOR',TRUE)
                """);
        jdbc.update("""
                INSERT INTO recursos(id,tipo,codigo,ativo,restrito) VALUES
                (11,'SALA','SALA-11',TRUE,TRUE),(12,'SALA','SALA-12',TRUE,TRUE)
                """);
        jdbc.update("""
                INSERT INTO reservas(id,solicitante_id,inicio_utc,fim_utc,restrita,status) VALUES
                (101,1,'2026-11-12 15:00:00','2026-11-12 16:00:00',TRUE,'SOLICITADA'),
                (102,2,'2026-11-12 16:00:00','2026-11-12 17:00:00',TRUE,'SOLICITADA'),
                (103,2,'2026-11-12 17:00:00','2026-11-12 18:00:00',TRUE,'SOLICITADA')
                """);
        jdbc.update("""
                INSERT INTO reserva_recursos(reserva_id,recurso_id) VALUES
                (101,11),(102,12),(103,11),(103,12)
                """);
        jdbc.update("""
                INSERT INTO responsaveis_recursos(recurso_id,usuario_id) VALUES (11,31),(12,32)
                """);
    }

    @Test
    void filaHttpUsaProjecoesEAplicaVinculoAntesDaPaginacao() throws Exception {
        var responsavel = new UsuarioPrincipal(31, "responsavel31@example.org", "hash",
                PapelAtor.RESPONSAVEL, true);
        jdbc.update("""
                INSERT INTO reservas(id,solicitante_id,inicio_utc,fim_utc,restrita,status)
                VALUES (104,2,'2026-11-12 18:00:00','2026-11-12 19:00:00',FALSE,'SOLICITADA')
                """);
        jdbc.update("INSERT INTO reserva_recursos(reserva_id,recurso_id) VALUES (104,11)");

        mvc.perform(get("/api/reservas").param("status", "SOLICITADA")
                        .param("tamanho", "1").with(user(responsavel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.itens[0].id").value(101))
                .andExpect(jsonPath("$.itens[0].inicio").value("2026-11-12T12:00:00-03:00"))
                .andExpect(jsonPath("$.itens[0].solicitante.identificacao").value("Solicitante 1"))
                .andExpect(jsonPath("$.itens[0].solicitante.email").doesNotExist())
                .andExpect(jsonPath("$.itens[0].recursos[0].identificacao").value("SALA-11"));

        mvc.perform(get("/api/reservas").param("status", "SOLICITADA")
                        .param("pagina", "1").param("tamanho", "1").with(user(responsavel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens").isEmpty())
                .andExpect(jsonPath("$.total").value(1));

        jdbc.update("DELETE FROM responsaveis_recursos WHERE usuario_id=31");
        mvc.perform(get("/api/reservas").param("status", "SOLICITADA").with(user(responsavel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void solicitanteSoEnxergaSuasReservasEAcessoAlheioParece404() {
        var pagina = consulta.listar(SOLICITANTE1, null, null, null, null, 0, 20);
        assertEquals(List.of(101L), pagina.itens().stream().map(r -> r.id()).toList());
        assertEquals(1L, pagina.total());
        assertThrows(ReservaNaoEncontradaException.class,
                () -> consulta.detalhe(102, SOLICITANTE1));
        assertEquals(101L, consulta.detalhe(101, SOLICITANTE1).id());
    }

    @Test
    void responsavelSemVinculoNaoRecebeReservaNemNoTotalDaFila() {
        var pagina = consulta.listar(RESPONSAVEL31, "SOLICITADA", null, null, null, 0, 20);
        assertEquals(List.of(101L), pagina.itens().stream().map(r -> r.id()).toList());
        assertEquals(1L, pagina.total());
        assertThrows(ReservaNaoEncontradaException.class,
                () -> consulta.detalhe(102, RESPONSAVEL31));
        assertThrows(ReservaNaoEncontradaException.class,
                () -> consulta.detalhe(103, RESPONSAVEL31));
        assertEquals(List.of(102L), consulta.listar(RESPONSAVEL32,
                "SOLICITADA", null, null, null, 0, 20)
                .itens().stream().map(r -> r.id()).toList());
    }

    @Test
    void reservaComDoisRecursosExigeDoisVinculosParaLeituraEDecisao() {
        var reserva = Reserva.solicitar(2, new IntervaloReserva(
                Instant.parse("2026-11-12T17:00:00Z"), Instant.parse("2026-11-12T18:00:00Z")),
                List.of(11L, 12L), true).comId(103);
        assertThrows(OperacaoNaoPermitidaException.class,
                () -> acesso.exigirResponsavelDeTodos(reserva, RESPONSAVEL31));
        jdbc.update("INSERT INTO responsaveis_recursos(recurso_id,usuario_id) VALUES (12,31)");
        assertDoesNotThrow(() -> acesso.exigirResponsavelDeTodos(reserva, RESPONSAVEL31));
        assertEquals(103L, consulta.detalhe(103, RESPONSAVEL31).id());
        assertEquals(3L, consulta.listar(RESPONSAVEL31, "SOLICITADA", null, null, null, 0, 20).total());
    }

    @Test
    void administradorLeTudoMasNaoPodeAprovarPorSerAdmin() {
        assertEquals(3L, consulta.listar(ADMIN, null, null, null, null, 0, 20).total());
        assertEquals(103L, consulta.detalhe(103, ADMIN).id());
        var reserva = Reserva.solicitar(2, new IntervaloReserva(
                Instant.parse("2026-11-12T17:00:00Z"), Instant.parse("2026-11-12T18:00:00Z")),
                List.of(11L, 12L), true).comId(103);
        assertThrows(OperacaoNaoPermitidaException.class,
                () -> acesso.exigirResponsavelDeTodos(reserva, ADMIN));
    }

    @Test
    void projeçãoNaoExibeNomeEmailOuDadosPrivados() {
        var resposta = consulta.detalhe(101, SOLICITANTE1);
        assertEquals("Solicitante 1", resposta.solicitante().identificacao());
        assertEquals(List.of("SALA-11"),
                resposta.recursos().stream().map(r -> r.identificacao()).toList());
        assertEquals(List.of(11L), resposta.recursosIds());
        assertFalse(resposta.toString().contains("@example.org"));
        assertFalse(resposta.toString().contains("Nome confidencial"));
    }

    @Test
    void paginacaoTotalEParametrosInvalidosNaoVazamInformacoes() {
        var paginaVazia = consulta.listar(SOLICITANTE1, null, null, null, null, 5, 1);
        assertTrue(paginaVazia.itens().isEmpty());
        assertEquals(1L, paginaVazia.total());
        assertThrows(ConsultaInvalidaException.class,
                () -> consulta.listar(ADMIN, "INVALIDO", null, null, null, 0, 20));
        assertThrows(ConsultaInvalidaException.class,
                () -> consulta.listar(ADMIN, null, null, null, -2L, 0, 20));
        assertThrows(ConsultaInvalidaException.class,
                () -> consulta.listar(ADMIN, null, null, null, null, 0, 101));
    }

    @Test
    void responsavelInativoOuComPerfilAlteradoPerdePermissao() {
        var reserva = Reserva.solicitar(1, new IntervaloReserva(
                Instant.parse("2026-11-12T15:00:00Z"), Instant.parse("2026-11-12T16:00:00Z")),
                List.of(11L), true).comId(101);
        jdbc.update("UPDATE usuarios SET ativo=FALSE WHERE id=31");
        assertThrows(OperacaoNaoPermitidaException.class,
                () -> acesso.exigirResponsavelDeTodos(reserva, RESPONSAVEL31));
        assertEquals(0L, consulta.listar(RESPONSAVEL31,
                "SOLICITADA", null, null, null, 0, 20).total());
    }
}
