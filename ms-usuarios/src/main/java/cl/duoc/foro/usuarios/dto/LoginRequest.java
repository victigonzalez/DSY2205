package cl.duoc.foro.usuarios.dto;

import jakarta.validation.constraints.NotBlank;

/** Credenciales para iniciar sesión (POST /api/usuarios/login). */
public record LoginRequest(

        @NotBlank(message = "El username es obligatorio")
        String username,

        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {
}
