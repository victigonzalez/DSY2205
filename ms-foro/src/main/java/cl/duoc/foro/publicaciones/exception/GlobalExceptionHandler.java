package cl.duoc.foro.publicaciones.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
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
 * Manejo global de excepciones (@ControllerAdvice).
 *
 * Captura los errores de TODOS los controladores, los registra en el log
 * y responde siempre con el mismo formato JSON (ErrorResponse).
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Errores de negocio lanzados por los servicios (404, 409, 401, 403...). */
    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ErrorResponse> negocio(NegocioException ex, HttpServletRequest req) {
        log.warn("{} {} → {} {}", req.getMethod(), req.getRequestURI(), ex.getStatus().value(), ex.getMessage());
        return construir(ex.getStatus(), ex.getMessage(), req, null);
    }

    /** 400 — falló alguna anotación de validación (@NotBlank, @Email...) del DTO. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validacion(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> detalles = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> detalles.putIfAbsent(e.getField(), e.getDefaultMessage()));
        log.warn("{} {} → 400 datos inválidos {}", req.getMethod(), req.getRequestURI(), detalles);
        return construir(HttpStatus.BAD_REQUEST, "Los datos enviados no son válidos", req, detalles);
    }

    /** 400 — el cuerpo no es un JSON válido. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> jsonInvalido(HttpMessageNotReadableException ex, HttpServletRequest req) {
        log.warn("{} {} → 400 JSON mal formado", req.getMethod(), req.getRequestURI());
        return construir(HttpStatus.BAD_REQUEST, "El cuerpo de la petición no es un JSON válido", req, null);
    }

    /** 400 — un parámetro de la URL tiene un tipo incorrecto (ej: /api/usuarios/abc). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> tipoIncorrecto(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String mensaje = "El parámetro '" + ex.getName() + "' tiene un valor inválido: " + ex.getValue();
        log.warn("{} {} → 400 {}", req.getMethod(), req.getRequestURI(), mensaje);
        return construir(HttpStatus.BAD_REQUEST, mensaje, req, null);
    }

    /** 400 — falta un header obligatorio. */
    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> headerFaltante(MissingRequestHeaderException ex, HttpServletRequest req) {
        String mensaje = "Falta el header obligatorio '" + ex.getHeaderName() + "'";
        log.warn("{} {} → 400 {}", req.getMethod(), req.getRequestURI(), mensaje);
        return construir(HttpStatus.BAD_REQUEST, mensaje, req, null);
    }

    /** 404 — la ruta no existe. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> rutaInexistente(NoResourceFoundException ex, HttpServletRequest req) {
        return construir(HttpStatus.NOT_FOUND, "La ruta solicitada no existe", req, null);
    }

    /** 405 — método HTTP no soportado en esa ruta. */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> metodoNoPermitido(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return construir(HttpStatus.METHOD_NOT_ALLOWED, "Método " + ex.getMethod() + " no permitido en esta ruta", req, null);
    }

    /** 409 — la base de datos rechazó la operación (UNIQUE, FK...). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> integridad(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.error("{} {} → 409 violación de integridad: {}", req.getMethod(), req.getRequestURI(),
                ex.getMostSpecificCause().getMessage());
        return construir(HttpStatus.CONFLICT, "La operación viola una restricción de la base de datos", req, null);
    }

    /** 500 — cualquier error no previsto. Se registra completo en el log. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> inesperado(Exception ex, HttpServletRequest req) {
        log.error("{} {} → 500 error inesperado", req.getMethod(), req.getRequestURI(), ex);
        return construir(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error interno en el servidor", req, null);
    }

    private ResponseEntity<ErrorResponse> construir(HttpStatus status, String mensaje,
                                                    HttpServletRequest req, Map<String, String> detalles) {
        ErrorResponse cuerpo = new ErrorResponse(LocalDateTime.now(), status.value(),
                status.getReasonPhrase(), mensaje, req.getRequestURI(), detalles);
        return ResponseEntity.status(status).body(cuerpo);
    }
}
