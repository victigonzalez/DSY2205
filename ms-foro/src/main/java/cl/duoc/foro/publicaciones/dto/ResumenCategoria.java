package cl.duoc.foro.publicaciones.dto;

/** Resultado de la consulta "temas activos por categoría". */
public record ResumenCategoria(Long categoriaId, String categoria, Long cantidadTemas) {
}
