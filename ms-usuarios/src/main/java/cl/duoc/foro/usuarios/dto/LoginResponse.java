package cl.duoc.foro.usuarios.dto;

/**
 * Respuesta de un inicio de sesión exitoso.
 * El cliente usa usuario.id como header X-Usuario-Id al llamar a ms-foro.
 */
public record LoginResponse(String mensaje, UsuarioResponse usuario) {
}
