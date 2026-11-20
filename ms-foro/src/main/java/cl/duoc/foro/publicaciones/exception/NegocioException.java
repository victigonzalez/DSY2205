package cl.duoc.foro.publicaciones.exception;

import org.springframework.http.HttpStatus;

/**
 * [Arquetipo] Excepción de negocio con su código HTTP asociado.
 * Los métodos de fábrica dejan claro qué tipo de error ocurrió.
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

    /** 409 — choca con datos existentes o con el estado actual. */
    public static NegocioException conflicto(String mensaje) {
        return new NegocioException(HttpStatus.CONFLICT, mensaje);
    }

    /** 401 — no se pudo identificar al usuario. */
    public static NegocioException noAutorizado(String mensaje) {
        return new NegocioException(HttpStatus.UNAUTHORIZED, mensaje);
    }

    /** 403 — identificado, pero sin permiso. */
    public static NegocioException prohibido(String mensaje) {
        return new NegocioException(HttpStatus.FORBIDDEN, mensaje);
    }

    /** 410 — el contenido existió pero fue retirado (ej: baneado por un moderador). */
    public static NegocioException baneado(String mensaje) {
        return new NegocioException(HttpStatus.GONE, mensaje);
    }
}
