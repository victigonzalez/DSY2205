package cl.duoc.foro.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos para CREAR un usuario (POST /api/usuarios).
 * Todas las reglas se validan antes de llegar al servicio gracias a @Valid.
 *
 * @param rol opcional: ADMIN, MODERADOR o USUARIO. Si no se envía, queda como USUARIO.
 */
public record UsuarioRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
        String nombre,

        @NotBlank(message = "El username es obligatorio")
        @Size(min = 3, max = 30, message = "El username debe tener entre 3 y 30 caracteres")
        @Pattern(regexp = "^[a-zA-Z0-9._-]+$",
                 message = "El username solo puede contener letras, números, punto, guion y guion bajo")
        String username,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 120, message = "El correo no puede superar los 120 caracteres")
        String correo,

        @NotBlank(message = "La contraseña es obligatoria")
        @Pattern(regexp = Reglas.PASSWORD, message = Reglas.PASSWORD_MENSAJE)
        String password,

        @Pattern(regexp = Reglas.ROL, flags = Pattern.Flag.CASE_INSENSITIVE, message = Reglas.ROL_MENSAJE)
        String rol
) {
}
