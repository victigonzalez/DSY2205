package cl.duoc.foro.publicaciones.exception;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Formato único para TODAS las respuestas de error del microservicio.
 *
 * @param detalles solo se incluye en errores de validación: campo → mensaje.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        LocalDateTime fecha,
        int status,
        String error,
        String mensaje,
        String ruta,
        Map<String, String> detalles
) {
}
