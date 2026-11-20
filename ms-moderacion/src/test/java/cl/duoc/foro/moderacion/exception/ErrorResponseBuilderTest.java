package cl.duoc.foro.moderacion.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

/** [Arquetipo] Prueba unitaria del patrón Builder (no necesita base de datos). */
class ErrorResponseBuilderTest {

    @Test
    void construyeRespuestaCompleta() {
        ErrorResponse r = ErrorResponseBuilder.nuevo(HttpStatus.BAD_REQUEST, "Datos inválidos", "/api/x")
                .detalle("correo", "Formato inválido")
                .detalles(Map.of("nombre", "Obligatorio"))
                .construir();

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.error()).isEqualTo("Bad Request");
        assertThat(r.mensaje()).isEqualTo("Datos inválidos");
        assertThat(r.ruta()).isEqualTo("/api/x");
        assertThat(r.fecha()).isNotNull();
        assertThat(r.detalles()).containsEntry("correo", "Formato inválido").containsEntry("nombre", "Obligatorio");
    }

    @Test
    void conservaElPrimerErrorDeCadaCampo() {
        ErrorResponse r = ErrorResponseBuilder.nuevo(HttpStatus.BAD_REQUEST, "x", "/api/x")
                .detalle("password", "Muy corta")
                .detalle("password", "Sin números")
                .construir();
        assertThat(r.detalles()).containsExactly(Map.entry("password", "Muy corta"));
    }

    @Test
    void elResultadoEsInmutable() {
        ErrorResponse r = ErrorResponseBuilder.nuevo(HttpStatus.NOT_FOUND, "No existe", "/api/x").construir();
        assertThatThrownBy(() -> r.detalles().put("a", "b")).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void rechazaDatosObligatoriosInvalidos() {
        assertThatThrownBy(() -> ErrorResponseBuilder.nuevo(HttpStatus.OK, "x", "/api/x"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> ErrorResponseBuilder.nuevo(HttpStatus.NOT_FOUND, " ", "/api/x"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> ErrorResponseBuilder.nuevo(HttpStatus.NOT_FOUND, "x", null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
