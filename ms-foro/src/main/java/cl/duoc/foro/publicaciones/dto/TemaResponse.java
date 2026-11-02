package cl.duoc.foro.publicaciones.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import cl.duoc.foro.publicaciones.model.Estado;
import cl.duoc.foro.publicaciones.model.Tema;

/** Tema tal como se devuelve en JSON. motivoBaneo solo aparece si el tema está baneado. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TemaResponse(
        Long id,
        String titulo,
        String contenido,
        LocalDateTime fechaCreacion,
        Estado estado,
        String motivoBaneo,
        Long categoriaId,
        String categoria,
        Long autorId,
        String autor,
        Long cantidadComentarios
) {

    public static TemaResponse desde(Tema t, long cantidadComentarios) {
        return new TemaResponse(
                t.getId(), t.getTitulo(), t.getContenido(), t.getFechaCreacion(),
                t.getEstado(), t.getMotivoBaneo(),
                t.getCategoria().getId(), t.getCategoria().getNombre(),
                t.getAutor().getId(), t.getAutor().getUsername(),
                cantidadComentarios);
    }
}
