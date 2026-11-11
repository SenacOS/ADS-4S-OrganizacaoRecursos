package br.senac.recursos.auditoria;

import static org.junit.jupiter.api.Assertions.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * RF10: prova de privilégios mínimos em MySQL 8.4 Testcontainers.
 * Esta conta existe APENAS no banco de teste, não na infraestrutura real.
 */
@SpringBootTest
@Testcontainers
class AuditoriaPrivilegiosMysqlIT {
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void banco(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Test
    void contaRestritaInsereEConsultaMasNaoPodeAlterarOuApagar() throws Exception {
        String schema = mysql.getDatabaseName();
        assertTrue(Pattern.matches("[A-Za-z0-9_]+", schema));
        String usuario = "audit_limited";
        String senha = "SomenteTeste123!";

        // Root apenas para montar os GRANTs neste Testcontainer descartável.
        try (Connection root = DriverManager.getConnection(
                mysql.getJdbcUrl(), "root", mysql.getPassword());
                Statement admin = root.createStatement()) {
            admin.execute("CREATE USER '" + usuario + "'@'%' IDENTIFIED BY '" + senha + "'");
            admin.execute("GRANT SELECT, INSERT ON " + schema
                    + ".auditoria TO '" + usuario + "'@'%'");
        }

        try (Connection restrita = DriverManager.getConnection(
                mysql.getJdbcUrl(), usuario, senha);
                Statement sql = restrita.createStatement()) {
            assertEquals(1, sql.executeUpdate("""
                    INSERT INTO auditoria
                       (entidade, entidade_id, ator_id, acao, antes, depois,
                        correlacao_id, momento)
                    VALUES ('RESERVA', 77, 7, 'CRIACAO', NULL, 'status=APROVADA',
                            'teste-grants', '2030-01-02 10:00:00')
                    """));
            try (var rs = sql.executeQuery("""
                    SELECT COUNT(*) FROM auditoria WHERE correlacao_id='teste-grants'
                    """)) {
                assertTrue(rs.next());
                assertEquals(1, rs.getInt(1));
            }
            assertThrows(SQLException.class, () -> sql.executeUpdate(
                    "UPDATE auditoria SET depois='alterado' WHERE correlacao_id='teste-grants'"));
            assertThrows(SQLException.class, () -> sql.executeUpdate(
                    "DELETE FROM auditoria WHERE correlacao_id='teste-grants'"));
            assertThrows(SQLException.class, () -> sql.executeQuery("SELECT * FROM usuarios"));
        }
        try (Connection root = DriverManager.getConnection(
                mysql.getJdbcUrl(), "root", mysql.getPassword());
                Statement admin = root.createStatement();
                var rs = admin.executeQuery("""
                        SELECT COUNT(*) FROM auditoria
                        WHERE correlacao_id='teste-grants' AND depois='status=APROVADA'
                        """)) {
            assertTrue(rs.next());
            assertEquals(1, rs.getInt(1));
        }
    }
}
