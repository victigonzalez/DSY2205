package cl.duoc.foro.usuarios.exception;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * [Arquetipo] Contrato JSON único para TODAS las respuestas de error.
 * No se construye directamente: se usa ErrorResponseBuilder (patrón Builder).
 *
 * @param detalles solo en errores de validación: campo → mensaje.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ErrorResponse(
        LocalDateTime fecha,
        int status,
        String error,
        String mensaje,
        String ruta,
        Map<String, String> detalles
) {
}
