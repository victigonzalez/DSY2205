package cl.duoc.foro.publicaciones.exception;

import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

/**
 * [Arquetipo] Manejo global de excepciones (@RestControllerAdvice).
 *
 * Captura los errores de TODOS los controladores, los registra en el log y
 * responde siempre con el mismo JSON, construido con ErrorResponseBuilder (Builder).
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Errores de negocio lanzados por los servicios (404, 409, 401, 403, 410). */
    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ErrorResponse> negocio(NegocioException ex, HttpServletRequest req) {
        log.warn("{} {} → {} {}", req.getMethod(), req.getRequestURI(), ex.getStatus().value(), ex.getMessage());
        return responder(ex.getStatus(), ex.getMessage(), req, Map.of());
    }

    /** 400 — falló alguna validación (@NotBlank, @Email...) del DTO. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validacion(MethodArgumentNotValidException ex, HttpServletRequest req) {
        ErrorResponseBuilder builder = ErrorResponseBuilder.nuevo(
                HttpStatus.BAD_REQUEST, "Los datos enviados no son válidos", req.getRequestURI());
        ex.getBindingResult().getFieldErrors().forEach(e -> builder.detalle(e.getField(), e.getDefaultMessage()));
        ErrorResponse cuerpo = builder.construir();
        log.warn("{} {} → 400 datos inválidos {}", req.getMethod(), req.getRequestURI(), cuerpo.detalles());
        return ResponseEntity.badRequest().body(cuerpo);
    }

    /** 400 — el cuerpo no es un JSON válido. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> jsonInvalido(HttpMessageNotReadableException ex, HttpServletRequest req) {
        log.warn("{} {} → 400 JSON mal formado", req.getMethod(), req.getRequestURI());
        return responder(HttpStatus.BAD_REQUEST, "El cuerpo de la petición no es un JSON válido", req, Map.of());
    }

    /** 400 — un parámetro de la URL tiene un tipo incorrecto (ej: /api/recurso/abc). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> tipoIncorrecto(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String mensaje = "El parámetro '" + ex.getName() + "' tiene un valor inválido: " + ex.getValue();
        log.warn("{} {} → 400 {}", req.getMethod(), req.getRequestURI(), mensaje);
        return responder(HttpStatus.BAD_REQUEST, mensaje, req, Map.of());
    }

    /** 400 — falta un header obligatorio (ej: X-Usuario-Id). */
    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> headerFaltante(MissingRequestHeaderException ex, HttpServletRequest req) {
        String mensaje = "Falta el header obligatorio '" + ex.getHeaderName() + "'";
        log.warn("{} {} → 400 {}", req.getMethod(), req.getRequestURI(), mensaje);
        return responder(HttpStatus.BAD_REQUEST, mensaje, req, Map.of());
    }

    /** 404 — la ruta no existe. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> rutaInexistente(NoResourceFoundException ex, HttpServletRequest req) {
        return responder(HttpStatus.NOT_FOUND, "La ruta solicitada no existe", req, Map.of());
    }

    /** 405 — método HTTP no soportado en esa ruta. */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> metodoNoPermitido(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return responder(HttpStatus.METHOD_NOT_ALLOWED, "Método " + ex.getMethod() + " no permitido en esta ruta", req, Map.of());
    }

    /** 409 — la base de datos rechazó la operación (UNIQUE, FK...). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> integridad(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.error("{} {} → 409 violación de integridad: {}", req.getMethod(), req.getRequestURI(),
                ex.getMostSpecificCause().getMessage());
        return responder(HttpStatus.CONFLICT, "La operación viola una restricción de la base de datos", req, Map.of());
    }

    /** 500 — cualquier error no previsto. Se registra completo en el log. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> inesperado(Exception ex, HttpServletRequest req) {
        log.error("{} {} → 500 error inesperado", req.getMethod(), req.getRequestURI(), ex);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error interno en el servidor", req, Map.of());
    }

    /** Todas las respuestas pasan por el Builder: un solo lugar arma el contrato JSON. */
    private ResponseEntity<ErrorResponse> responder(HttpStatus status, String mensaje,
                                                    HttpServletRequest req, Map<String, String> detalles) {
        return ResponseEntity.status(status).body(
                ErrorResponseBuilder.nuevo(status, mensaje, req.getRequestURI())
                        .detalles(detalles)
                        .construir());
    }
}
