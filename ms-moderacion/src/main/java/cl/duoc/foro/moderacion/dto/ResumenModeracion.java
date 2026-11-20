package cl.duoc.foro.moderacion.dto;

/** Panel de moderación: cuánto contenido está visible y cuánto fue baneado. */
public record ResumenModeracion(
        long temasActivos,
        long temasBaneados,
        long comentariosActivos,
        long comentariosBaneados
) {
}
