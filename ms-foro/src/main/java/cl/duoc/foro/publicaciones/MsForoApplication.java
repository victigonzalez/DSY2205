package cl.duoc.foro.publicaciones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada del microservicio del foro.
 *
 * Responsabilidades: categorías, búsqueda/visualización/publicación de temas,
 * comentarios y moderación (banear temas y comentarios que incumplan las normas).
 */
@SpringBootApplication
public class MsForoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsForoApplication.class, args);
    }
}
