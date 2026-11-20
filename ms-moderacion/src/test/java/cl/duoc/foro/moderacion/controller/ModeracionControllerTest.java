package cl.duoc.foro.moderacion.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Pruebas de ms-moderacion contra H2 con los datos de script_foro.sql
 * (src/test/resources/schema-h2.sql y data-h2.sql).
 *
 * Usuarios: 1=admin (ADMIN), 2=moderador (MODERADOR), 3=victor (USUARIO).
 * El tema 6 y el comentario 6 vienen BANEADOS.
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};MODE=Oracle;DEFAULT_NULL_ORDERING=HIGH",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema-h2.sql",
        "spring.sql.init.data-locations=classpath:data-h2.sql",
        "spring.sql.init.encoding=UTF-8"})
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class ModeracionControllerTest {

    private static final String H = "X-Usuario-Id";
    private static final String ADMIN = "1", MODERADOR = "2", VICTOR = "3";

    @Autowired
    private MockMvc mvc;

    @Test
    void resumenCuentaContenidoActivoYBaneado() throws Exception {
        mvc.perform(get("/api/moderacion/resumen").header(H, MODERADOR))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.temasActivos").value(5))
                .andExpect(jsonPath("$.temasBaneados").value(1))
                .andExpect(jsonPath("$.comentariosActivos").value(5))
                .andExpect(jsonPath("$.comentariosBaneados").value(1));
    }

    @Test
    void usuarioComunNoPuedeModerar() throws Exception {
        mvc.perform(get("/api/moderacion/temas").header(H, VICTOR))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje").value("Solo un ADMIN o MODERADOR puede realizar esta acción"));
    }

    @Test
    void usuarioInexistenteDa401YSinHeaderDa400() throws Exception {
        mvc.perform(get("/api/moderacion/temas").header(H, "999")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/moderacion/temas")).andExpect(status().isBadRequest());
    }

    @Test
    void listaContenidoBaneado() throws Exception {
        mvc.perform(get("/api/moderacion/temas").header(H, MODERADOR))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(6))
                .andExpect(jsonPath("$[0].motivoBaneo").exists());
        mvc.perform(get("/api/moderacion/comentarios").header(H, ADMIN))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(6));
    }

    @Test
    void banearYDesbanearTema() throws Exception {
        mvc.perform(put("/api/moderacion/temas/4/banear").header(H, MODERADOR)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Contenido duplicado\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("BANEADO"))
                .andExpect(jsonPath("$.motivoBaneo").value("Contenido duplicado"));

        mvc.perform(put("/api/moderacion/temas/4/banear").header(H, ADMIN)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Otra vez\"}"))
                .andExpect(status().isConflict());

        mvc.perform(put("/api/moderacion/temas/4/desbanear").header(H, ADMIN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ACTIVO"))
                .andExpect(jsonPath("$.motivoBaneo").doesNotExist());
    }

    @Test
    void banearComentarioExigeMotivo() throws Exception {
        mvc.perform(put("/api/moderacion/comentarios/5/banear").header(H, MODERADOR)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.motivo").exists());
        mvc.perform(put("/api/moderacion/comentarios/5/banear").header(H, MODERADOR)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Spam publicitario\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("BANEADO"));
    }

    @Test
    void desbanearAlgoActivoDa409YInexistenteDa404() throws Exception {
        mvc.perform(put("/api/moderacion/comentarios/1/desbanear").header(H, MODERADOR))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/moderacion/temas/999/desbanear").header(H, MODERADOR))
                .andExpect(status().isNotFound());
    }
}
