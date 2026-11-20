package cl.duoc.foro.moderacion.service;

import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.moderacion.exception.NegocioException;
import cl.duoc.foro.moderacion.model.Autor;
import cl.duoc.foro.moderacion.repository.AutorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Identifica a quien hace la petición (header X-Usuario-Id) y exige que sea
 * ADMIN o MODERADOR. Ningún endpoint de este microservicio es público.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermisoService {

    public static final String HEADER_USUARIO = "X-Usuario-Id";

    private static final Set<String> ROLES_MODERACION = Set.of("ADMIN", "MODERADOR");

    private final AutorRepository autorRepository;

    @Transactional(readOnly = true)
    public Autor exigirModerador(Long usuarioId) {
        Autor autor = autorRepository.findById(usuarioId)
                .orElseThrow(() -> NegocioException.noAutorizado(
                        "El usuario " + usuarioId + " no existe. Inicia sesión en ms-usuarios"));
        if (!Boolean.TRUE.equals(autor.getActivo())) {
            throw NegocioException.prohibido("La cuenta de " + autor.getUsername() + " está desactivada");
        }
        if (!ROLES_MODERACION.contains(autor.getNombreRol())) {
            log.warn("Acceso denegado: {} (rol {}) intentó moderar", autor.getUsername(), autor.getNombreRol());
            throw NegocioException.prohibido("Solo un ADMIN o MODERADOR puede realizar esta acción");
        }
        return autor;
    }
}
