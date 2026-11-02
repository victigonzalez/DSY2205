package cl.duoc.foro.publicaciones.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import cl.duoc.foro.publicaciones.model.Comentario;
import cl.duoc.foro.publicaciones.model.Estado;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ComentarioResponse(
        Long id,
        String contenido,
        LocalDateTime fechaCreacion,
        Estado estado,
        String motivoBaneo,
        Long temaId,
        Long autorId,
        String autor
) {

    public static ComentarioResponse desde(Comentario c) {
        return new ComentarioResponse(
                c.getId(), c.getContenido(), c.getFechaCreacion(), c.getEstado(), c.getMotivoBaneo(),
                c.getTema().getId(), c.getAutor().getId(), c.getAutor().getUsername());
    }
}
