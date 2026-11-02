package cl.duoc.foro.publicaciones.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos para crear o modificar una categoría (solo ADMIN). */
public record CategoriaRequest(

        @NotBlank(message = "El nombre de la categoría es obligatorio")
        @Size(min = 3, max = 60, message = "El nombre debe tener entre 3 y 60 caracteres")
        String nombre,

        @Size(max = 250, message = "La descripción no puede superar los 250 caracteres")
        String descripcion
) {
}
