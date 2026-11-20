package cl.duoc.foro.moderacion.model;

/** Estado de moderación de un tema o comentario (columna ESTADO). */
public enum Estado {
    /** Visible para todos. */
    ACTIVO,
    /** Oculto por incumplir las normas del foro. */
    BANEADO
}
