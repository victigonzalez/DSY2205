package cl.duoc.foro.usuarios.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
 * Pruebas de los endpoints REST de punta a punta (controlador → servicio → H2).
 * @Transactional revierte los cambios después de cada test.
 */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};MODE=Oracle;DEFAULT_NULL_ORDERING=HIGH")
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class UsuarioControllerTest {

    @Autowired
    private MockMvc mvc;

    private static final String NUEVO = """
            {"nombre":"Pedro Soto","username":"pedro","correo":"pedro@correo.cl","password":"Clave123"}
            """;

    @Test
    void listaUsuariosSinExponerPassword() throws Exception {
        mvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[0].username").value("admin"))
                .andExpect(jsonPath("$[0]", not(hasKey("password"))));
    }

    @Test
    void filtraPorRol() throws Exception {
        mvc.perform(get("/api/usuarios").param("rol", "moderador"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].rol").value("MODERADOR"));
    }

    @Test
    void obtenerInexistenteDa404() throws Exception {
        mvc.perform(get("/api/usuarios/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje").value("No existe un usuario con id 999"));
    }

    @Test
    void creaUsuarioConRolPorDefecto() throws Exception {
        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content(NUEVO))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.rol").value("USUARIO"))
                .andExpect(jsonPath("$.activo").value(true));
    }

    @Test
    void crearConDatosInvalidosDa400ConDetalle() throws Exception {
        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"\",\"username\":\"a b\",\"correo\":\"x\",\"password\":\"1\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles.nombre").exists())
                .andExpect(jsonPath("$.detalles.username").exists())
                .andExpect(jsonPath("$.detalles.correo").exists())
                .andExpect(jsonPath("$.detalles.password").exists());
    }

    @Test
    void crearDuplicadoDa409() throws Exception {
        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON)
                        .content(NUEVO.replace("\"pedro\"", "\"victor\"")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").value("El username 'victor' ya está en uso"));
    }

    @Test
    void actualizaYCambiaRol() throws Exception {
        mvc.perform(put("/api/usuarios/3").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Victor G. Arenas","username":"victor","correo":"victor@correo.cl","rol":"MODERADOR"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Victor G. Arenas"))
                .andExpect(jsonPath("$.rol").value("MODERADOR"));
    }

    @Test
    void eliminaUsuario() throws Exception {
        mvc.perform(delete("/api/usuarios/4")).andExpect(status().isNoContent());
        mvc.perform(get("/api/usuarios/4")).andExpect(status().isNotFound());
    }

    @Test
    void loginCorrecto() throws Exception {
        mvc.perform(post("/api/usuarios/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"Admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.rol").value("ADMIN"));
    }

    @Test
    void loginIncorrectoDa401() throws Exception {
        mvc.perform(post("/api/usuarios/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"Mala123\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginDeCuentaDesactivadaDa403() throws Exception {
        mvc.perform(put("/api/usuarios/4").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Camila Rojas\",\"username\":\"camila\",\"correo\":\"camila@correo.cl\",\"activo\":false}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/usuarios/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"camila\",\"password\":\"Usuario123\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void listaRoles() throws Exception {
        mvc.perform(get("/api/usuarios/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }
}
