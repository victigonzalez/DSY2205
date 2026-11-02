package cl.duoc.foro.usuarios.exception;

import org.springframework.http.HttpStatus;

/**
 * Excepción de negocio con su código HTTP asociado.
 * Las subclases (o los métodos de fábrica) dejan claro qué tipo de error ocurrió.
 */
public class NegocioException extends RuntimeException {

    private final HttpStatus status;

    public NegocioException(HttpStatus status, String mensaje) {
        super(mensaje);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    /** 404 — el recurso pedido no existe. */
    public static NegocioException noEncontrado(String mensaje) {
        return new NegocioException(HttpStatus.NOT_FOUND, mensaje);
    }

    /** 409 — choca con datos existentes (ej: username repetido). */
    public static NegocioException conflicto(String mensaje) {
        return new NegocioException(HttpStatus.CONFLICT, mensaje);
    }

    /** 401 — credenciales incorrectas. */
    public static NegocioException noAutorizado(String mensaje) {
        return new NegocioException(HttpStatus.UNAUTHORIZED, mensaje);
    }

    /** 403 — identificado, pero sin permiso (ej: cuenta desactivada). */
    public static NegocioException prohibido(String mensaje) {
        return new NegocioException(HttpStatus.FORBIDDEN, mensaje);
    }
}
