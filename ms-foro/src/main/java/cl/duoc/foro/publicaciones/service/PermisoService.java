package cl.duoc.foro.publicaciones.service;

import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.publicaciones.exception.NegocioException;
import cl.duoc.foro.publicaciones.model.Autor;
import cl.duoc.foro.publicaciones.repository.AutorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Identifica a quien hace la petición (header X-Usuario-Id) y valida sus privilegios.
 *
 * Roles:
 * - ADMIN: todo (incluye gestionar categorías).
 * - MODERADOR: banear/desbanear y eliminar contenido ajeno.
 * - USUARIO: publicar, comentar y editar/eliminar SU propio contenido.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermisoService {

    public static final String HEADER_USUARIO = "X-Usuario-Id";

    private static final Set<String> ROLES_MODERACION = Set.of("ADMIN", "MODERADOR");

    private final AutorRepository autorRepository;

    /** Devuelve el usuario solicitante; falla si no existe (401) o está desactivado (403). */
    @Transactional(readOnly = true)
    public Autor solicitante(Long usuarioId) {
        Autor autor = autorRepository.findById(usuarioId)
                .orElseThrow(() -> NegocioException.noAutorizado(
                        "El usuario " + usuarioId + " no existe. Inicia sesión en ms-usuarios"));
        if (!Boolean.TRUE.equals(autor.getActivo())) {
            throw NegocioException.prohibido("La cuenta de " + autor.getUsername() + " está desactivada");
        }
        return autor;
    }

    public boolean esModerador(Autor autor) {
        return ROLES_MODERACION.contains(autor.getNombreRol());
    }

    /** Solo ADMIN o MODERADOR. */
    public Autor exigirModerador(Long usuarioId) {
        Autor autor = solicitante(usuarioId);
        if (!esModerador(autor)) {
            log.warn("Acceso denegado: {} (rol {}) intentó moderar", autor.getUsername(), autor.getNombreRol());
            throw NegocioException.prohibido("Solo un ADMIN o MODERADOR puede realizar esta acción");
        }
        return autor;
    }

    /** Solo ADMIN. */
    public Autor exigirAdmin(Long usuarioId) {
        Autor autor = solicitante(usuarioId);
        if (!"ADMIN".equals(autor.getNombreRol())) {
            log.warn("Acceso denegado: {} (rol {}) intentó una acción de ADMIN", autor.getUsername(), autor.getNombreRol());
            throw NegocioException.prohibido("Solo un ADMIN puede realizar esta acción");
        }
        return autor;
    }

    /** El dueño del contenido, o un ADMIN/MODERADOR. */
    public void exigirDuenoOModerador(Autor solicitante, Autor dueno) {
        if (!solicitante.getId().equals(dueno.getId()) && !esModerador(solicitante)) {
            throw NegocioException.prohibido("Solo el autor o un moderador puede realizar esta acción");
        }
    }

    /** Solo el dueño del contenido (editar es personal: ni el admin reescribe lo de otros). */
    public void exigirDueno(Autor solicitante, Autor dueno) {
        if (!solicitante.getId().equals(dueno.getId())) {
            throw NegocioException.prohibido("Solo el autor puede editar este contenido");
        }
    }
}
