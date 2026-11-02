package cl.duoc.foro.publicaciones.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Pruebas de punta a punta de ms-foro contra H2 con los datos de script_foro.sql.
 *
 * Usuarios del script: 1=admin (ADMIN), 2=moderador (MODERADOR), 3=victor y 4=camila (USUARIO).
 * Tema 6 y comentario 6 vienen BANEADOS.
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};MODE=Oracle;DEFAULT_NULL_ORDERING=HIGH",
        "spring.sql.init.mode=always"})
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class ForoControllerTest {

    private static final String H = "X-Usuario-Id";
    private static final String ADMIN = "1", MODERADOR = "2", VICTOR = "3", CAMILA = "4";

    @Autowired
    private MockMvc mvc;

    private static final String TEMA_NUEVO = """
            {"titulo":"Recomienden series de ciencia ficción","contenido":"Busco series parecidas a The Expanse.","categoriaId":4}
            """;

    @Nested
    class Categorias {

        @Test
        void listaLasSeisCategorias() throws Exception {
            mvc.perform(get("/api/categorias")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(6)));
        }

        @Test
        void resumenCuentaTemasActivos() throws Exception {
            mvc.perform(get("/api/categorias/resumen"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(6)))
                    .andExpect(jsonPath("$[?(@.categoria=='Música')].cantidadTemas").value(0));
        }

        @Test
        void soloAdminPuedeCrear() throws Exception {
            String body = "{\"nombre\":\"Anime\",\"descripcion\":\"Series y películas de animación japonesa\"}";
            mvc.perform(post("/api/categorias").header(H, VICTOR).contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isForbidden());
            mvc.perform(post("/api/categorias").header(H, ADMIN).contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.nombre").value("Anime"));
        }

        @Test
        void noSeEliminaCategoriaConTemas() throws Exception {
            mvc.perform(delete("/api/categorias/1").header(H, ADMIN)).andExpect(status().isConflict());
        }

        @Test
        void sinHeaderDa400() throws Exception {
            mvc.perform(post("/api/categorias").contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Anime\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.mensaje").value("Falta el header obligatorio 'X-Usuario-Id'"));
        }
    }

    @Nested
    class Temas {

        @Test
        void buscarSinFiltrosOcultaLosBaneados() throws Exception {
            mvc.perform(get("/api/temas")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(5)));
        }

        @Test
        void buscarCombinandoFiltros() throws Exception {
            mvc.perform(get("/api/temas").param("q", "SPRING"))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].cantidadComentarios").value(2));
            mvc.perform(get("/api/temas").param("autor", "victor").param("categoriaId", "2"))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].categoria").value("Videojuegos"));
            mvc.perform(get("/api/categorias/3/temas")).andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        void categoriaInexistenteDa404() throws Exception {
            mvc.perform(get("/api/temas").param("categoriaId", "99")).andExpect(status().isNotFound());
        }

        @Test
        void populares() throws Exception {
            mvc.perform(get("/api/temas/populares").param("limite", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].cantidadComentarios").value(2));
        }

        @Test
        void detalleIncluyeSoloComentariosVisibles() throws Exception {
            mvc.perform(get("/api/temas/3"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.tema.titulo").value("Teorías sobre el final de la temporada"))
                    .andExpect(jsonPath("$.comentarios", hasSize(0)));
        }

        @Test
        void temaBaneadoDa410() throws Exception {
            mvc.perform(get("/api/temas/6")).andExpect(status().isGone());
        }

        @Test
        void publicarEditarYEliminar() throws Exception {
            mvc.perform(post("/api/temas").header(H, CAMILA).contentType(MediaType.APPLICATION_JSON).content(TEMA_NUEVO))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.autor").value("camila"))
                    .andExpect(jsonPath("$.categoria").value("Cine y Series"))
                    .andExpect(jsonPath("$.estado").value("ACTIVO"));

            // victor no puede editar el tema 2 de camila; camila sí
            String edicion = "{\"titulo\":\"Cooperativos para dos (editado)\",\"contenido\":\"Ya probé Pandemic y Forbidden Island.\",\"categoriaId\":3}";
            mvc.perform(put("/api/temas/2").header(H, VICTOR).contentType(MediaType.APPLICATION_JSON).content(edicion))
                    .andExpect(status().isForbidden());
            mvc.perform(put("/api/temas/2").header(H, CAMILA).contentType(MediaType.APPLICATION_JSON).content(edicion))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.titulo").value("Cooperativos para dos (editado)"))
                    .andExpect(jsonPath("$.cantidadComentarios").value(2));

            // un moderador puede eliminar contenido ajeno (y sus comentarios caen en cascada)
            mvc.perform(delete("/api/temas/2").header(H, MODERADOR)).andExpect(status().isNoContent());
            mvc.perform(get("/api/temas/2")).andExpect(status().isNotFound());
            mvc.perform(get("/api/comentarios/3")).andExpect(status().isNotFound());
        }

        @Test
        void publicarConDatosInvalidos() throws Exception {
            mvc.perform(post("/api/temas").header(H, VICTOR).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"titulo\":\"Hi\",\"contenido\":\"\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.detalles.titulo").exists())
                    .andExpect(jsonPath("$.detalles.contenido").exists())
                    .andExpect(jsonPath("$.detalles.categoriaId").exists());
        }

        @Test
        void usuarioInexistenteDa401() throws Exception {
            mvc.perform(post("/api/temas").header(H, "999").contentType(MediaType.APPLICATION_JSON).content(TEMA_NUEVO))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    class Comentarios {

        @Test
        void comentarYListar() throws Exception {
            mvc.perform(post("/api/temas/4/comentarios").header(H, VICTOR).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"contenido\":\"Gracias, voy a probar Celeste.\"}"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.temaId").value(4))
                    .andExpect(jsonPath("$.autor").value("victor"));
            mvc.perform(get("/api/temas/4/comentarios")).andExpect(jsonPath("$", hasSize(2)));
        }

        @Test
        void noSePuedeComentarTemaBaneado() throws Exception {
            mvc.perform(post("/api/temas/6/comentarios").header(H, VICTOR).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"contenido\":\"Hola\"}"))
                    .andExpect(status().isGone());
        }

        @Test
        void soloElAutorEdita() throws Exception {
            String body = "{\"contenido\":\"Comentario editado por su autora.\"}";
            mvc.perform(put("/api/comentarios/1").header(H, ADMIN).contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isForbidden());
            mvc.perform(put("/api/comentarios/1").header(H, CAMILA).contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.contenido").value("Comentario editado por su autora."));
        }

        @Test
        void usuarioNoEliminaComentarioAjeno() throws Exception {
            mvc.perform(delete("/api/comentarios/1").header(H, VICTOR)).andExpect(status().isForbidden());
            mvc.perform(delete("/api/comentarios/1").header(H, CAMILA)).andExpect(status().isNoContent());
        }
    }

    @Nested
    class Moderacion {

        @Test
        void usuarioComunNoPuedeModerar() throws Exception {
            mvc.perform(get("/api/moderacion/temas").header(H, VICTOR)).andExpect(status().isForbidden());
        }

        @Test
        void listaContenidoBaneado() throws Exception {
            mvc.perform(get("/api/moderacion/temas").header(H, MODERADOR))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].motivoBaneo").exists());
            mvc.perform(get("/api/moderacion/comentarios").header(H, ADMIN)).andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        void banearYDesbanearTema() throws Exception {
            mvc.perform(put("/api/moderacion/temas/4/banear").header(H, MODERADOR).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"motivo\":\"Contenido duplicado\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("BANEADO"));
            mvc.perform(get("/api/temas/4")).andExpect(status().isGone());
            mvc.perform(get("/api/temas")).andExpect(jsonPath("$", hasSize(4)));

            // banear dos veces → 409
            mvc.perform(put("/api/moderacion/temas/4/banear").header(H, MODERADOR).contentType(MediaType.APPLICATION_JSON)
                            .content("{\"motivo\":\"Otra vez\"}"))
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
                    .andExpect(status().isOk());
            mvc.perform(get("/api/temas/4/comentarios")).andExpect(jsonPath("$", hasSize(0)));
            mvc.perform(put("/api/moderacion/comentarios/6/desbanear").header(H, MODERADOR))
                    .andExpect(jsonPath("$.estado").value("ACTIVO"));
        }
    }
}
