package ${package};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada del microservicio ${servicio}.
 * Generado con foro-microservicio-archetype: la lógica de negocio se agrega en
 * los paquetes model, repository, dto, service y controller.
 */
@SpringBootApplication
public class Ms${servicio}Application {

    public static void main(String[] args) {
        SpringApplication.run(Ms${servicio}Application.class, args);
    }
}
