package cl.duoc.foro.publicaciones.dto;

import java.util.List;

/** Vista completa de un tema: sus datos + los comentarios visibles. */
public record TemaDetalleResponse(TemaResponse tema, List<ComentarioResponse> comentarios) {
}
