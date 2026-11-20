package cl.duoc.foro.usuarios.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

/**
 * [Arquetipo] PATRÓN DE DISEÑO BUILDER (constructor paso a paso).
 *
 * PROBLEMA: cada manejador de errores debe armar un ErrorResponse con 6 campos
 * y siempre con el mismo contrato JSON. Repetir un constructor de 6 argumentos
 * en muchos lugares es difícil de leer y fácil de equivocar (ej: invertir campos).
 *
 * SOLUCIÓN:
 *   1. nuevo(status, mensaje, ruta) → recibe y valida los datos obligatorios.
 *   2. detalle(campo, mensaje) / detalles(mapa) → agrega errores por campo (opcional).
 *   3. construir() → entrega un ErrorResponse inmutable con fecha y texto del status.
 *
 * Uso:  ErrorResponseBuilder.nuevo(HttpStatus.BAD_REQUEST, "Datos inválidos", "/api/x")
 *                           .detalle("correo", "Formato inválido")
 *                           .construir();
 */
public final class ErrorResponseBuilder {

    private final HttpStatus status;
    private final String mensaje;
    private final String ruta;
    private final Map<String, String> detalles = new LinkedHashMap<>();

    private ErrorResponseBuilder(HttpStatus status, String mensaje, String ruta) {
        if (status == null || !status.isError()) {
            throw new IllegalArgumentException("El status debe ser un error HTTP (4xx o 5xx)");
        }
        if (mensaje == null || mensaje.isBlank()) {
            throw new IllegalArgumentException("El mensaje de error no puede estar vacío");
        }
        if (ruta == null || ruta.isBlank()) {
            throw new IllegalArgumentException("La ruta no puede estar vacía");
        }
        this.status = status;
        this.mensaje = mensaje;
        this.ruta = ruta;
    }

    /** Paso 1: inicia la respuesta con los datos obligatorios. */
    public static ErrorResponseBuilder nuevo(HttpStatus status, String mensaje, String ruta) {
        return new ErrorResponseBuilder(status, mensaje, ruta);
    }

    /** Paso 2 (opcional): agrega el error de un campo. Si el campo ya existe, conserva el primero. */
    public ErrorResponseBuilder detalle(String campo, String mensajeCampo) {
        if (campo != null && !campo.isBlank()) {
            detalles.putIfAbsent(campo, mensajeCampo == null ? "Valor inválido" : mensajeCampo);
        }
        return this;
    }

    /** Paso 2 (opcional): agrega varios errores de campo a la vez. */
    public ErrorResponseBuilder detalles(Map<String, String> errores) {
        if (errores != null) {
            errores.forEach(this::detalle);
        }
        return this;
    }

    /** Paso 3: produce la respuesta inmutable. */
    public ErrorResponse construir() {
        return new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                mensaje,
                ruta,
                Map.copyOf(detalles));
    }
}
