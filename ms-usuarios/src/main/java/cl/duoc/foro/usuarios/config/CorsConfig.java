package cl.duoc.foro.usuarios.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * [Arquetipo] CORS: qué frontends (dominios) pueden consumir la API.
 * Se configura con la propiedad app.cors.origenes (separados por coma).
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.origenes}")
    private String[] origenesPermitidos;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(origenesPermitidos)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
