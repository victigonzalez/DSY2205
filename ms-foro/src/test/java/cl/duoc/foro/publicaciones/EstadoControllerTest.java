package cl.duoc.foro.publicaciones;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

/**
 * [Arquetipo] El microservicio generado arranca y responde /api/estado,
 * y una ruta inexistente responde con el JSON del Builder.
 * Usa una base H2 en memoria propia: no necesita Oracle.
 */
@SpringBootTest(properties = {
        "spring.profiles.active=local",
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};MODE=Oracle;DEFAULT_NULL_ORDERING=HIGH",
        "spring.sql.init.mode=never"})
@AutoConfigureMockMvc
class EstadoControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void estadoResponde() throws Exception {
        mvc.perform(get("/api/estado"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ACTIVO"))
                .andExpect(jsonPath("$.perfiles[0]").value("local"));
    }

    @Test
    void rutaInexistenteUsaElFormatoDeError() throws Exception {
        mvc.perform(get("/api/no-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.mensaje").value("La ruta solicitada no existe"))
                .andExpect(jsonPath("$.ruta").value("/api/no-existe"));
    }
}
