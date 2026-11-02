package cl.duoc.foro.publicaciones.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.publicaciones.dto.ComentarioRequest;
import cl.duoc.foro.publicaciones.dto.ComentarioResponse;
import cl.duoc.foro.publicaciones.exception.NegocioException;
import cl.duoc.foro.publicaciones.model.Autor;
import cl.duoc.foro.publicaciones.model.Comentario;
import cl.duoc.foro.publicaciones.model.Estado;
import cl.duoc.foro.publicaciones.model.Tema;
import cl.duoc.foro.publicaciones.repository.ComentarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** Comentar temas, y ver/editar/eliminar comentarios. */
@Slf4j
@Service
@RequiredArgsConstructor
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final TemaService temaService;
    private final PermisoService permisoService;

    @Transactional(readOnly = true)
    public List<ComentarioResponse> listarDeTema(Long temaId) {
        temaService.buscarVisible(temaId);
        return comentarioRepository.findByTemaIdAndEstadoOrderByFechaCreacionAscIdAsc(temaId, Estado.ACTIVO)
                .stream().map(ComentarioResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public ComentarioResponse obtener(Long id) {
        Comentario c = buscarOFallar(id);
        if (c.getEstado() == Estado.BANEADO) {
            throw NegocioException.baneado("El comentario " + id + " fue baneado por incumplir las normas del foro");
        }
        return ComentarioResponse.desde(c);
    }

    @Transactional
    public ComentarioResponse comentar(Long usuarioId, Long temaId, ComentarioRequest req) {
        Autor autor = permisoService.solicitante(usuarioId);
        Tema tema = temaService.buscarVisible(temaId); // no se puede comentar un tema baneado
        Comentario c = new Comentario();
        c.setContenido(req.contenido().trim());
        c.setTema(tema);
        c.setAutor(autor);
        Comentario guardado = comentarioRepository.save(c);
        log.info("Comentario creado: id={} en tema {} por {}", guardado.getId(), temaId, autor.getUsername());
        return ComentarioResponse.desde(guardado);
    }

    @Transactional
    public ComentarioResponse editar(Long usuarioId, Long id, ComentarioRequest req) {
        Autor solicitante = permisoService.solicitante(usuarioId);
        Comentario c = buscarOFallar(id);
        permisoService.exigirDueno(solicitante, c.getAutor());
        if (c.getEstado() == Estado.BANEADO) {
            throw NegocioException.conflicto("El comentario está baneado y no puede editarse");
        }
        c.setContenido(req.contenido().trim());
        log.info("Comentario editado: id={} por {}", id, solicitante.getUsername());
        return ComentarioResponse.desde(comentarioRepository.save(c));
    }

    @Transactional
    public void eliminar(Long usuarioId, Long id) {
        Autor solicitante = permisoService.solicitante(usuarioId);
        Comentario c = buscarOFallar(id);
        permisoService.exigirDuenoOModerador(solicitante, c.getAutor());
        comentarioRepository.delete(c);
        log.info("Comentario eliminado: id={} por {}", id, solicitante.getUsername());
    }

    Comentario buscarOFallar(Long id) {
        return comentarioRepository.findById(id)
                .orElseThrow(() -> NegocioException.noEncontrado("No existe un comentario con id " + id));
    }
}
