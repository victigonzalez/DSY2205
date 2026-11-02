package cl.duoc.foro.publicaciones.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.publicaciones.dto.ComentarioResponse;
import cl.duoc.foro.publicaciones.dto.TemaResponse;
import cl.duoc.foro.publicaciones.exception.NegocioException;
import cl.duoc.foro.publicaciones.model.Autor;
import cl.duoc.foro.publicaciones.model.Comentario;
import cl.duoc.foro.publicaciones.model.Estado;
import cl.duoc.foro.publicaciones.model.Tema;
import cl.duoc.foro.publicaciones.repository.ComentarioRepository;
import cl.duoc.foro.publicaciones.repository.TemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Moderación: banear y desbanear temas y comentarios que incumplan las normas.
 * Todas las operaciones exigen rol ADMIN o MODERADOR.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModeracionService {

    private final TemaRepository temaRepository;
    private final ComentarioRepository comentarioRepository;
    private final TemaService temaService;
    private final ComentarioService comentarioService;
    private final PermisoService permisoService;

    // ------------------------------------------------------------------ Consultas

    @Transactional(readOnly = true)
    public List<TemaResponse> temasBaneados(Long usuarioId) {
        permisoService.exigirModerador(usuarioId);
        return temaRepository.findByEstadoOrderByIdAsc(Estado.BANEADO).stream()
                .map(t -> TemaResponse.desde(t, 0)).toList();
    }

    @Transactional(readOnly = true)
    public List<ComentarioResponse> comentariosBaneados(Long usuarioId) {
        permisoService.exigirModerador(usuarioId);
        return comentarioRepository.findByEstadoOrderByIdAsc(Estado.BANEADO).stream()
                .map(ComentarioResponse::desde).toList();
    }

    // ------------------------------------------------------------------ Temas

    @Transactional
    public TemaResponse banearTema(Long usuarioId, Long temaId, String motivo) {
        Autor moderador = permisoService.exigirModerador(usuarioId);
        Tema t = temaService.buscarOFallar(temaId);
        if (t.getEstado() == Estado.BANEADO) {
            throw NegocioException.conflicto("El tema " + temaId + " ya está baneado");
        }
        t.setEstado(Estado.BANEADO);
        t.setMotivoBaneo(motivo.trim());
        log.info("MODERACIÓN: {} baneó el tema {} — motivo: {}", moderador.getUsername(), temaId, motivo);
        return TemaResponse.desde(temaRepository.save(t), 0);
    }

    @Transactional
    public TemaResponse desbanearTema(Long usuarioId, Long temaId) {
        Autor moderador = permisoService.exigirModerador(usuarioId);
        Tema t = temaService.buscarOFallar(temaId);
        if (t.getEstado() == Estado.ACTIVO) {
            throw NegocioException.conflicto("El tema " + temaId + " no está baneado");
        }
        t.setEstado(Estado.ACTIVO);
        t.setMotivoBaneo(null);
        log.info("MODERACIÓN: {} desbaneó el tema {}", moderador.getUsername(), temaId);
        return TemaResponse.desde(temaRepository.save(t), 0);
    }

    // ------------------------------------------------------------------ Comentarios

    @Transactional
    public ComentarioResponse banearComentario(Long usuarioId, Long comentarioId, String motivo) {
        Autor moderador = permisoService.exigirModerador(usuarioId);
        Comentario c = comentarioService.buscarOFallar(comentarioId);
        if (c.getEstado() == Estado.BANEADO) {
            throw NegocioException.conflicto("El comentario " + comentarioId + " ya está baneado");
        }
        c.setEstado(Estado.BANEADO);
        c.setMotivoBaneo(motivo.trim());
        log.info("MODERACIÓN: {} baneó el comentario {} — motivo: {}", moderador.getUsername(), comentarioId, motivo);
        return ComentarioResponse.desde(comentarioRepository.save(c));
    }

    @Transactional
    public ComentarioResponse desbanearComentario(Long usuarioId, Long comentarioId) {
        Autor moderador = permisoService.exigirModerador(usuarioId);
        Comentario c = comentarioService.buscarOFallar(comentarioId);
        if (c.getEstado() == Estado.ACTIVO) {
            throw NegocioException.conflicto("El comentario " + comentarioId + " no está baneado");
        }
        c.setEstado(Estado.ACTIVO);
        c.setMotivoBaneo(null);
        log.info("MODERACIÓN: {} desbaneó el comentario {}", moderador.getUsername(), comentarioId);
        return ComentarioResponse.desde(comentarioRepository.save(c));
    }
}
