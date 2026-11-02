package cl.duoc.foro.usuarios.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

/** Comprueba que las anotaciones de validación de los DTOs funcionan como se espera. */
class ValidacionDtoTest {

    private static Validator validator;

    @BeforeAll
    static void iniciar() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private static Set<String> camposConError(Object dto) {
        return validator.validate(dto).stream()
                .map(ConstraintViolation::getPropertyPath)
                .map(Object::toString)
                .collect(Collectors.toSet());
    }

    @Test
    void usuarioValidoNoTieneErrores() {
        var dto = new UsuarioRequest("Pedro Soto", "pedro", "pedro@correo.cl", "Clave123", "USUARIO");
        assertThat(camposConError(dto)).isEmpty();
    }

    @Test
    void rolEsOpcionalYNoDistingueMayusculas() {
        assertThat(camposConError(new UsuarioRequest("Pedro Soto", "pedro", "pedro@correo.cl", "Clave123", null))).isEmpty();
        assertThat(camposConError(new UsuarioRequest("Pedro Soto", "pedro", "pedro@correo.cl", "Clave123", "moderador"))).isEmpty();
    }

    @Test
    void detectaCadaCampoInvalido() {
        var dto = new UsuarioRequest("", "con espacio", "no-es-correo", "123", "SUPERADMIN");
        assertThat(camposConError(dto))
                .containsExactlyInAnyOrder("nombre", "username", "correo", "password", "rol");
    }

    @Test
    void enLaModificacionLaPasswordEsOpcional() {
        var sinPassword = new UsuarioUpdateRequest("Pedro Soto", "pedro", "pedro@correo.cl", null, null, false);
        var passwordDebil = new UsuarioUpdateRequest("Pedro Soto", "pedro", "pedro@correo.cl", "abc", null, null);

        assertThat(camposConError(sinPassword)).isEmpty();
        assertThat(camposConError(passwordDebil)).containsExactly("password");
    }

    @Test
    void loginExigeAmbosCampos() {
        assertThat(camposConError(new LoginRequest(" ", null))).containsExactlyInAnyOrder("username", "password");
    }
}
