package cl.duoc.foro.usuarios.dto;

/** Reglas de validación compartidas entre los DTOs (se escriben una sola vez). */
public final class Reglas {

    /** 6 a 20 caracteres, con al menos una mayúscula, una minúscula y un número. */
    public static final String PASSWORD = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,20}$";
    public static final String PASSWORD_MENSAJE =
            "La contraseña debe tener entre 6 y 20 caracteres, con al menos una mayúscula, una minúscula y un número";

    public static final String ROL = "^(ADMIN|MODERADOR|USUARIO)$";
    public static final String ROL_MENSAJE = "El rol debe ser ADMIN, MODERADOR o USUARIO";

    private Reglas() {
    }
}
