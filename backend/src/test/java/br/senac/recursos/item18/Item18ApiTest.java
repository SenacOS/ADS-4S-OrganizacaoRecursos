package br.senac.recursos.item18;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.senac.recursos.movimentacao.api.*;
import br.senac.recursos.movimentacao.aplicacao.*;
import br.senac.recursos.recurso.api.*;
import br.senac.recursos.recurso.aplicacao.*;
import br.senac.recursos.reserva.api.*;
import br.senac.recursos.reserva.dominio.*;
import br.senac.recursos.shared.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
    controllers = {RecursoController.class, MovimentacaoController.class},
    properties = {"recursos.api.enabled=true", "movimentacoes.api.enabled=true"})
class Item18ApiTest {
  @Autowired MockMvc mvc;
  @MockitoBean RecursoService recursos;
  @MockitoBean MovimentacaoService movimentos;
  @MockitoBean AtorAutenticadoProvider atores;

  @BeforeEach
  void ator() {
    when(atores.atorAtual()).thenReturn(new AtorReserva(1, PapelAtor.ADMINISTRADOR));
  }

  @Test
  void pesquisaPadraoEDtoInvalidos() throws Exception {
    when(recursos.pesquisar(any(), any())).thenReturn(new Pagina<>(java.util.List.of(), 0, 20, 0));
    mvc.perform(get("/api/recursos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(0));
    mvc.perform(
            post("/api/recursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"tipo\":\"SALA\",\"codigo\":\"S\",\"capacidade\":0}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void conflitoNaoExibeSql() throws Exception {
    when(movimentos.retirar(anyLong(), anyLong(), any()))
        .thenThrow(new org.springframework.dao.DuplicateKeyException("SQL segredo"));
    mvc.perform(
            post("/api/movimentacoes/retiradas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reservaId\":1,\"recursoId\":2}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.codigo").value("INTEGRIDADE_DOS_DADOS"))
        .andExpect(jsonPath("$.correlationId").exists());
  }

  @Test
  void ausenciaPermissaoEIdsAusentes() throws Exception {
    when(recursos.obter(eq(99L), any())).thenThrow(ErroDominio.ausente());
    mvc.perform(get("/api/recursos/99")).andExpect(status().isNotFound());
    doThrow(new ErroDominio(403, "OPERACAO_NAO_PERMITIDA", "Perfil sem permissão."))
        .when(recursos)
        .desativar(anyLong(), any());
    mvc.perform(delete("/api/recursos/1")).andExpect(status().isForbidden());
  }

  @Test
  void timeoutPrevisivel() throws Exception {
    when(movimentos.devolver(anyLong(), any()))
        .thenThrow(new org.springframework.dao.CannotAcquireLockException("SQL"));
    mvc.perform(post("/api/movimentacoes/1/devolucao"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.codigo").value("TENTE_NOVAMENTE"));
  }
}
