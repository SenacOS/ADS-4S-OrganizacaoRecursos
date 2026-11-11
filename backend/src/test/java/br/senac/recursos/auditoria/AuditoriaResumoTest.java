package br.senac.recursos.auditoria;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class AuditoriaResumoTest {
    @Test
    void resumoDeUsuarioNuncaContemIdentificacaoPessoalOuSenha() {
        String registro = "perfil=ADMINISTRADOR; ativo=true; "
                + "email=privado@teste.local; nome=Pessoa; senha=secreto";
        String resumo = AuditoriaResumo.seguro("USUARIO", registro);
        assertEquals("perfil=ADMINISTRADOR; ativo=true", resumo);
        assertFalse(resumo.contains("privado"));
        assertFalse(resumo.contains("secreto"));
    }
}
