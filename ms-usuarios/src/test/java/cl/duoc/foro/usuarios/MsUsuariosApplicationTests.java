package cl.duoc.foro.usuarios;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

/**
 * Verifica que el microservicio arranca con el perfil local (H2 modo Oracle)
 * y que el script de la base de datos cargó al menos 3 registros por tabla.
 */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};MODE=Oracle;DEFAULT_NULL_ORDERING=HIGH")
@ActiveProfiles("local")
class MsUsuariosApplicationTests {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void contextoArranca() {
        // Si el contexto de Spring no levanta, este test falla
    }

    @Test
    void cadaTablaTieneAlMenosTresRegistros() {
        for (String tabla : new String[]{"ROLES", "USUARIOS", "CATEGORIAS", "TEMAS", "COMENTARIOS"}) {
            Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM " + tabla, Integer.class);
            assertThat(total).as("registros en " + tabla).isGreaterThanOrEqualTo(3);
        }
    }
}
