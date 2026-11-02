package cl.duoc.foro.publicaciones.controller;

import static cl.duoc.foro.publicaciones.service.PermisoService.HEADER_USUARIO;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.publicaciones.dto.ComentarioRequest;
import cl.duoc.foro.publicaciones.dto.ComentarioResponse;
import cl.duoc.foro.publicaciones.service.ComentarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * API REST de comentarios individuales (para crear uno: POST /api/temas/{id}/comentarios).
 *
 * GET    /api/comentarios/{id}  → detalle
 * PUT    /api/comentarios/{id}  → editar   (solo el autor)
 * DELETE /api/comentarios/{id}  → eliminar (autor, ADMIN o MODERADOR)
 */
@RestController
@RequestMapping("/api/comentarios")
@RequiredArgsConstructor
public class ComentarioController {

    private final ComentarioService comentarioService;

    @GetMapping("/{id}")
    public ComentarioResponse obtener(@PathVariable Long id) {
        return comentarioService.obtener(id);
    }

    @PutMapping("/{id}")
    public ComentarioResponse editar(@RequestHeader(HEADER_USUARIO) Long usuarioId,
                                     @PathVariable Long id, @Valid @RequestBody ComentarioRequest req) {
        return comentarioService.editar(usuarioId, id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@RequestHeader(HEADER_USUARIO) Long usuarioId, @PathVariable Long id) {
        comentarioService.eliminar(usuarioId, id);
        return ResponseEntity.noContent().build();
    }
}
