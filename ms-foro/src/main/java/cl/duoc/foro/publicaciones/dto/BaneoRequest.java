package cl.duoc.foro.publicaciones.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Motivo por el que un moderador banea un tema o comentario. */
public record BaneoRequest(

        @NotBlank(message = "Debe indicar el motivo del baneo")
        @Size(min = 5, max = 250, message = "El motivo debe tener entre 5 y 250 caracteres")
        String motivo
) {
}
