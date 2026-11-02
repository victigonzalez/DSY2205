package cl.duoc.foro.publicaciones.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos para comentar un tema o editar un comentario. */
public record ComentarioRequest(

        @NotBlank(message = "El comentario no puede estar vacío")
        @Size(min = 2, max = 2000, message = "El comentario debe tener entre 2 y 2000 caracteres")
        String contenido
) {
}
