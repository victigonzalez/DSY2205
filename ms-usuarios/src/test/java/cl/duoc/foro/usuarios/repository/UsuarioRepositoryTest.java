package cl.duoc.foro.usuarios.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import cl.duoc.foro.usuarios.model.Usuario;

/**
 * Pruebas del repositorio contra H2 en modo Oracle, con los datos de script_foro.sql.
 * Cada test corre en una transacción que se revierte al terminar.
 */
@DataJpaTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};MODE=Oracle;DEFAULT_NULL_ORDERING=HIGH")
@ActiveProfiles("local")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UsuarioRepositoryTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Test
    void leeLosUsuariosDelScriptConSuRol() {
        assertThat(usuarioRepository.count()).isGreaterThanOrEqualTo(3);

        Usuario admin = usuarioRepository.findByUsernameIgnoreCase("ADMIN").orElseThrow();
        assertThat(admin.getRol().getNombre()).isEqualTo("ADMIN");
        assertThat(admin.getActivo()).isTrue();
        assertThat(admin.getPassword()).startsWith("$2a$"); // cifrada con BCrypt
    }

    @Test
    void listaUsuariosPorRol() {
        assertThat(usuarioRepository.findByRolNombreIgnoreCaseOrderByIdAsc("usuario"))
                .extracting(Usuario::getUsername)
                .containsExactly("victor", "camila");
    }

    @Test
    void detectaDuplicados() {
        Long idVictor = usuarioRepository.findByUsernameIgnoreCase("victor").orElseThrow().getId();

        assertThat(usuarioRepository.existsByCorreoIgnoreCase("CAMILA@correo.cl")).isTrue();
        assertThat(usuarioRepository.existsByUsernameIgnoreCase("nadie")).isFalse();
        // victor puede conservar su propio username al modificarse...
        assertThat(usuarioRepository.existsByUsernameIgnoreCaseAndIdNot("victor", idVictor)).isFalse();
        // ...pero no puede tomar el de camila
        assertThat(usuarioRepository.existsByUsernameIgnoreCaseAndIdNot("camila", idVictor)).isTrue();
    }

    @Test
    void insertaUsuarioConFechaYEstadoPorDefecto() {
        Usuario nuevo = new Usuario();
        nuevo.setNombre("Usuario de Prueba");
        nuevo.setUsername("prueba");
        nuevo.setCorreo("prueba@correo.cl");
        nuevo.setPassword("hash");
        nuevo.setRol(rolRepository.findByNombreIgnoreCase("USUARIO").orElseThrow());

        Usuario guardado = usuarioRepository.saveAndFlush(nuevo);

        assertThat(guardado.getId()).isNotNull();
        assertThat(guardado.getFechaRegistro()).isNotNull();
        assertThat(guardado.getActivo()).isTrue();
    }
}
