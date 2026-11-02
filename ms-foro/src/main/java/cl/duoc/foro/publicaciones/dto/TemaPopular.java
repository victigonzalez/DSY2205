package cl.duoc.foro.publicaciones.dto;

/** Resultado de la consulta "temas más comentados". */
public record TemaPopular(Long id, String titulo, String categoria, String autor, Long cantidadComentarios) {
}
