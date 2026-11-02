package cl.duoc.foro.usuarios;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada del microservicio de usuarios.
 *
 * Responsabilidades: crear, modificar, eliminar y listar usuarios,
 * además del inicio de sesión (login) validando la contraseña cifrada.
 */
@SpringBootApplication
public class MsUsuariosApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsUsuariosApplication.class, args);
    }
}
