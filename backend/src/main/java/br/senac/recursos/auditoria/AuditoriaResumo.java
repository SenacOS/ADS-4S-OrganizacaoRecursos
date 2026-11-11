package br.senac.recursos.auditoria;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Lista branca de campos historicos. Nunca persiste o toString() bruto do dominio:
 * nomes de professores, motivos livres, credenciais e observacoes nao entram na trilha.
 */
final class AuditoriaResumo {
    private AuditoriaResumo() {}

    static String seguro(String entidade, String valor) {
        if (valor == null) return null;
        if ("RESERVA".equals(entidade)) {
            if (valor.matches("SOLICITADA|APROVADA|EM_USO|CONCLUIDA|REJEITADA|CANCELADA|NAO_COMPARECEU")) {
                return valor;
            }
            var campos = campos(valor, "status", "inicio", "fim");
            var ids = Pattern.compile("recursos=\\[([0-9, ]*)\\]").matcher(valor);
            if (ids.find()) campos.add("recursos=[" + ids.group(1) + "]");
            return resumo(campos);
        }
        if ("USUARIO".equals(entidade)) {
            // Somente dados de autorização. Exclui email, nome e credenciais.
            return resumo(campos(valor, "perfil", "ativo"));
        }
        if ("RECURSO".equals(entidade)) {
            return resumo(campos(valor, "tipo", "ativo", "restrito", "capacidade"));
        }
        if ("MOVIMENTACAO".equals(entidade)) {
            return resumo(campos(valor, "recursoId", "reservaId", "retiradoEm",
                    "devolvidoEm", "atrasoSegundos"));
        }
        if ("BLOQUEIO".equals(entidade)) {
            return resumo(campos(valor, "recurso_id", "inicio_utc", "fim_utc", "status"));
        }
        if ("EXPEDIENTE".equals(entidade)) {
            var janelas = Pattern.compile(
                    "JanelaFuncionamento\\[dia=([A-Z]+), inicio=([0-9:.]+), fim=([0-9:.]+)\\]")
                    .matcher(valor);
            List<String> resumos = new ArrayList<>();
            while (janelas.find() && resumos.size() < 20) {
                resumos.add(janelas.group(1) + " " + janelas.group(2) + "-" + janelas.group(3));
            }
            return resumo(resumos);
        }
        return "[detalhes omitidos]";
    }

    private static List<String> campos(String texto, String... nomes) {
        List<String> resultado = new ArrayList<>();
        for (String nome : nomes) {
            var encontrado = Pattern.compile("\\b" + nome + "=([A-Za-z0-9_.:/+\\-]+)")
                    .matcher(texto);
            if (encontrado.find()) resultado.add(nome + "=" + encontrado.group(1));
        }
        return resultado;
    }

    private static String resumo(List<String> campos) {
        return campos.isEmpty() ? "[detalhes omitidos]" : String.join("; ", campos);
    }
}
