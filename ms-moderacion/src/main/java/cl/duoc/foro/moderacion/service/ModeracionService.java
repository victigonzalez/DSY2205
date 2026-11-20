package cl.duoc.foro.moderacion.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.moderacion.dto.ComentarioResponse;
import cl.duoc.foro.moderacion.dto.ResumenModeracion;
import cl.duoc.foro.moderacion.dto.TemaResponse;
import cl.duoc.foro.moderacion.exception.NegocioException;
import cl.duoc.foro.moderacion.model.Autor;
import cl.duoc.foro.moderacion.model.Comentario;
import cl.duoc.foro.moderacion.model.Estado;
import cl.duoc.foro.moderacion.model.Tema;
import cl.duoc.foro.moderacion.repository.ComentarioRepository;
import cl.duoc.foro.moderacion.repository.TemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Gestión de publicaciones y comentarios por parte de un ADMIN o MODERADOR:
 * banear y desbanear contenido que incumpla las normas del foro.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModeracionService {

    private final TemaRepository temaRepository;
    private final ComentarioRepository comentarioRepository;
    private final PermisoService permisoService;

    // ------------------------------------------------------------------ Consultas

    @Transactional(readOnly = true)
    public ResumenModeracion resumen(Long usuarioId) {
        permisoService.exigirModerador(usuarioId);
        return new ResumenModeracion(
                temaRepository.countByEstado(Estado.ACTIVO),
                temaRepository.countByEstado(Estado.BANEADO),
                comentarioRepository.countByEstado(Estado.ACTIVO),
                comentarioRepository.countByEstado(Estado.BANEADO));
    }

    @Transactional(readOnly = true)
    public List<TemaResponse> temasBaneados(Long usuarioId) {
        permisoService.exigirModerador(usuarioId);
        return temaRepository.findByEstadoOrderByIdAsc(Estado.BANEADO).stream()
                .map(t -> TemaResponse.desde(t)).toList();
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
        Tema t = buscarTema(temaId);
        if (t.getEstado() == Estado.BANEADO) {
            throw NegocioException.conflicto("El tema " + temaId + " ya está baneado");
        }
        t.setEstado(Estado.BANEADO);
        t.setMotivoBaneo(motivo.trim());
        log.info("MODERACIÓN: {} baneó el tema {} — motivo: {}", moderador.getUsername(), temaId, motivo);
        return TemaResponse.desde(temaRepository.save(t));
    }

    @Transactional
    public TemaResponse desbanearTema(Long usuarioId, Long temaId) {
        Autor moderador = permisoService.exigirModerador(usuarioId);
        Tema t = buscarTema(temaId);
        if (t.getEstado() == Estado.ACTIVO) {
            throw NegocioException.conflicto("El tema " + temaId + " no está baneado");
        }
        t.setEstado(Estado.ACTIVO);
        t.setMotivoBaneo(null);
        log.info("MODERACIÓN: {} desbaneó el tema {}", moderador.getUsername(), temaId);
        return TemaResponse.desde(temaRepository.save(t));
    }

    // ------------------------------------------------------------------ Comentarios

    @Transactional
    public ComentarioResponse banearComentario(Long usuarioId, Long comentarioId, String motivo) {
        Autor moderador = permisoService.exigirModerador(usuarioId);
        Comentario c = buscarComentario(comentarioId);
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
        Comentario c = buscarComentario(comentarioId);
        if (c.getEstado() == Estado.ACTIVO) {
            throw NegocioException.conflicto("El comentario " + comentarioId + " no está baneado");
        }
        c.setEstado(Estado.ACTIVO);
        c.setMotivoBaneo(null);
        log.info("MODERACIÓN: {} desbaneó el comentario {}", moderador.getUsername(), comentarioId);
        return ComentarioResponse.desde(comentarioRepository.save(c));
    }

    // ------------------------------------------------------------------ Auxiliares

    private Tema buscarTema(Long id) {
        return temaRepository.findById(id)
                .orElseThrow(() -> NegocioException.noEncontrado("No existe un tema con id " + id));
    }

    private Comentario buscarComentario(Long id) {
        return comentarioRepository.findById(id)
                .orElseThrow(() -> NegocioException.noEncontrado("No existe un comentario con id " + id));
    }
}
