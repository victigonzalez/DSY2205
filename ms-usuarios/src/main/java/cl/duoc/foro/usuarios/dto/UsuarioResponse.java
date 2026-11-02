package cl.duoc.foro.usuarios.dto;

import java.time.LocalDateTime;

import cl.duoc.foro.usuarios.model.Usuario;

/**
 * Lo que el microservicio devuelve en JSON sobre un usuario.
 * No incluye la contraseña: así nunca se expone, ni siquiera cifrada.
 */
public record UsuarioResponse(
        Long id,
        String nombre,
        String username,
        String correo,
        String rol,
        Boolean activo,
        LocalDateTime fechaRegistro
) {

    /** Convierte la entidad JPA en la respuesta pública. */
    public static UsuarioResponse desde(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getNombre(),
                u.getUsername(),
                u.getCorreo(),
                u.getRol().getNombre(),
                u.getActivo(),
                u.getFechaRegistro());
    }
}
