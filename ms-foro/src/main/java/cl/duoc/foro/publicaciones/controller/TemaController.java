package cl.duoc.foro.publicaciones.controller;

import static cl.duoc.foro.publicaciones.service.PermisoService.HEADER_USUARIO;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.publicaciones.dto.ComentarioRequest;
import cl.duoc.foro.publicaciones.dto.ComentarioResponse;
import cl.duoc.foro.publicaciones.dto.TemaDetalleResponse;
import cl.duoc.foro.publicaciones.dto.TemaPopular;
import cl.duoc.foro.publicaciones.dto.TemaRequest;
import cl.duoc.foro.publicaciones.dto.TemaResponse;
import cl.duoc.foro.publicaciones.service.ComentarioService;
import cl.duoc.foro.publicaciones.service.TemaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * API REST de temas y sus comentarios.
 *
 * GET    /api/temas                     → buscar (filtros opcionales: categoriaId, q, autor)
 * GET    /api/temas/populares?limite=5  → temas más comentados
 * GET    /api/temas/{id}                → detalle con comentarios (410 si está baneado)
 * POST   /api/temas                     → publicar            (header X-Usuario-Id)
 * PUT    /api/temas/{id}                → editar              (solo el autor)
 * DELETE /api/temas/{id}                → eliminar            (autor, ADMIN o MODERADOR)
 * GET    /api/temas/{id}/comentarios    → comentarios visibles del tema
 * POST   /api/temas/{id}/comentarios    → comentar            (header X-Usuario-Id)
 */
@Slf4j
@RestController
@RequestMapping("/api/temas")
@RequiredArgsConstructor
public class TemaController {

    private final TemaService temaService;
    private final ComentarioService comentarioService;

    @GetMapping
    public List<TemaResponse> buscar(@RequestParam(required = false) Long categoriaId,
                                     @RequestParam(required = false) String q,
                                     @RequestParam(required = false) String autor) {
        log.debug("GET /api/temas categoriaId={} q={} autor={}", categoriaId, q, autor);
        return temaService.buscar(categoriaId, q, autor);
    }

    @GetMapping("/populares")
    public List<TemaPopular> populares(@RequestParam(defaultValue = "5") int limite) {
        return temaService.populares(limite);
    }

    @GetMapping("/{id}")
    public TemaDetalleResponse detalle(@PathVariable Long id) {
        return temaService.detalle(id);
    }

    @PostMapping
    public ResponseEntity<TemaResponse> publicar(@RequestHeader(HEADER_USUARIO) Long usuarioId,
                                                 @Valid @RequestBody TemaRequest req) {
        TemaResponse creado = temaService.publicar(usuarioId, req);
        return ResponseEntity.created(URI.create("/api/temas/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public TemaResponse editar(@RequestHeader(HEADER_USUARIO) Long usuarioId,
                               @PathVariable Long id, @Valid @RequestBody TemaRequest req) {
        return temaService.editar(usuarioId, id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@RequestHeader(HEADER_USUARIO) Long usuarioId, @PathVariable Long id) {
        temaService.eliminar(usuarioId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/comentarios")
    public List<ComentarioResponse> comentarios(@PathVariable Long id) {
        return comentarioService.listarDeTema(id);
    }

    @PostMapping("/{id}/comentarios")
    public ResponseEntity<ComentarioResponse> comentar(@RequestHeader(HEADER_USUARIO) Long usuarioId,
                                                       @PathVariable Long id,
                                                       @Valid @RequestBody ComentarioRequest req) {
        ComentarioResponse creado = comentarioService.comentar(usuarioId, id, req);
        return ResponseEntity.created(URI.create("/api/comentarios/" + creado.id())).body(creado);
    }
}
