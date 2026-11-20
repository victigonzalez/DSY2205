package cl.duoc.foro.moderacion.controller;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * [Arquetipo] Endpoint de diagnóstico: GET /api/estado
 * Permite comprobar rápidamente (ej: en Docker o en la nube) qué microservicio
 * responde y con qué perfil (oracle / local) está corriendo.
 */
@RestController
public class EstadoController {

    private final Environment entorno;

    @Value("${spring.application.name}")
    private String nombre;

    public EstadoController(Environment entorno) {
        this.entorno = entorno;
    }

    @GetMapping("/api/estado")
    public Map<String, Object> estado() {
        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("servicio", nombre);
        respuesta.put("estado", "ACTIVO");
        respuesta.put("perfiles", Arrays.asList(entorno.getActiveProfiles()));
        respuesta.put("origen", "foro-microservicio-archetype");
        return respuesta;
    }
}
