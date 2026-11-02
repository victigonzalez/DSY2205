package cl.duoc.foro.publicaciones.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.publicaciones.dto.ComentarioResponse;
import cl.duoc.foro.publicaciones.dto.TemaDetalleResponse;
import cl.duoc.foro.publicaciones.dto.TemaPopular;
import cl.duoc.foro.publicaciones.dto.TemaRequest;
import cl.duoc.foro.publicaciones.dto.TemaResponse;
import cl.duoc.foro.publicaciones.exception.NegocioException;
import cl.duoc.foro.publicaciones.model.Autor;
import cl.duoc.foro.publicaciones.model.Estado;
import cl.duoc.foro.publicaciones.model.Tema;
import cl.duoc.foro.publicaciones.repository.ComentarioRepository;
import cl.duoc.foro.publicaciones.repository.TemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** Búsqueda, visualización, publicación, edición y eliminación de temas. */
@Slf4j
@Service
@RequiredArgsConstructor
public class TemaService {

    private final TemaRepository temaRepository;
    private final ComentarioRepository comentarioRepository;
    private final CategoriaService categoriaService;
    private final PermisoService permisoService;

    // ------------------------------------------------------------------ Consultas

    /** Búsqueda con filtros opcionales: categoría, palabra clave y autor. Solo temas ACTIVOS. */
    @Transactional(readOnly = true)
    public List<TemaResponse> buscar(Long categoriaId, String texto, String autor) {
        if (categoriaId != null) {
            categoriaService.buscarOFallar(categoriaId); // 404 si la categoría no existe
        }
        List<Tema> temas = temaRepository.buscar(Estado.ACTIVO, categoriaId, normalizar(texto), normalizar(autor));
        return conCantidadComentarios(temas);
    }

    @Transactional(readOnly = true)
    public List<TemaPopular> populares(int limite) {
        int tope = Math.max(1, Math.min(limite, 50));
        return temaRepository.populares(Estado.ACTIVO, PageRequest.of(0, tope));
    }

    /** Detalle público: el tema con sus comentarios visibles. Un tema baneado responde 410. */
    @Transactional(readOnly = true)
    public TemaDetalleResponse detalle(Long id) {
        Tema t = buscarVisible(id);
        List<ComentarioResponse> comentarios = comentarioRepository
                .findByTemaIdAndEstadoOrderByFechaCreacionAscIdAsc(id, Estado.ACTIVO)
                .stream().map(ComentarioResponse::desde).toList();
        return new TemaDetalleResponse(TemaResponse.desde(t, comentarios.size()), comentarios);
    }

    // ------------------------------------------------------------------ Publicar / editar / eliminar

    @Transactional
    public TemaResponse publicar(Long usuarioId, TemaRequest req) {
        Autor autor = permisoService.solicitante(usuarioId);
        Tema t = new Tema();
        t.setTitulo(req.titulo().trim());
        t.setContenido(req.contenido().trim());
        t.setCategoria(categoriaService.buscarOFallar(req.categoriaId()));
        t.setAutor(autor);
        Tema guardado = temaRepository.save(t);
        log.info("Tema publicado: id={} por {} en '{}'", guardado.getId(), autor.getUsername(),
                guardado.getCategoria().getNombre());
        return TemaResponse.desde(guardado, 0);
    }

    @Transactional
    public TemaResponse editar(Long usuarioId, Long id, TemaRequest req) {
        Autor solicitante = permisoService.solicitante(usuarioId);
        Tema t = buscarOFallar(id);
        permisoService.exigirDueno(solicitante, t.getAutor());
        if (t.getEstado() == Estado.BANEADO) {
            throw NegocioException.conflicto("El tema está baneado y no puede editarse");
        }
        t.setTitulo(req.titulo().trim());
        t.setContenido(req.contenido().trim());
        t.setCategoria(categoriaService.buscarOFallar(req.categoriaId()));
        log.info("Tema editado: id={} por {}", id, solicitante.getUsername());
        return conCantidadComentarios(List.of(temaRepository.save(t))).get(0);
    }

    @Transactional
    public void eliminar(Long usuarioId, Long id) {
        Autor solicitante = permisoService.solicitante(usuarioId);
        Tema t = buscarOFallar(id);
        permisoService.exigirDuenoOModerador(solicitante, t.getAutor());
        temaRepository.delete(t);
        temaRepository.flush(); // ejecuta el DELETE ya: Oracle borra sus comentarios (ON DELETE CASCADE)
        log.info("Tema eliminado: id={} por {}", id, solicitante.getUsername());
    }

    // ------------------------------------------------------------------ Auxiliares

    Tema buscarOFallar(Long id) {
        return temaRepository.findById(id)
                .orElseThrow(() -> NegocioException.noEncontrado("No existe un tema con id " + id));
    }

    /** Como buscarOFallar, pero un tema baneado no se muestra al público. */
    Tema buscarVisible(Long id) {
        Tema t = buscarOFallar(id);
        if (t.getEstado() == Estado.BANEADO) {
            throw NegocioException.baneado("El tema " + id + " fue baneado por incumplir las normas del foro");
        }
        return t;
    }

    /** Arma las respuestas contando los comentarios activos de todos los temas en UNA sola consulta. */
    private List<TemaResponse> conCantidadComentarios(List<Tema> temas) {
        if (temas.isEmpty()) {
            return List.of();
        }
        Map<Long, Long> cantidades = new HashMap<>();
        comentarioRepository.contarPorTema(Estado.ACTIVO, temas.stream().map(Tema::getId).toList())
                .forEach(fila -> cantidades.put((Long) fila[0], (Long) fila[1]));
        return temas.stream()
                .map(t -> TemaResponse.desde(t, cantidades.getOrDefault(t.getId(), 0L)))
                .toList();
    }

    private static String normalizar(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim().toLowerCase();
    }
}
