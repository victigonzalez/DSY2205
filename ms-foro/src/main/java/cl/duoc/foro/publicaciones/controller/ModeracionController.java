package cl.duoc.foro.publicaciones.controller;

import static cl.duoc.foro.publicaciones.service.PermisoService.HEADER_USUARIO;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.publicaciones.dto.BaneoRequest;
import cl.duoc.foro.publicaciones.dto.ComentarioResponse;
import cl.duoc.foro.publicaciones.dto.TemaResponse;
import cl.duoc.foro.publicaciones.service.ModeracionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * API REST de moderación. Todo requiere rol ADMIN o MODERADOR (header X-Usuario-Id).
 *
 * GET /api/moderacion/temas                          → temas baneados
 * GET /api/moderacion/comentarios                    → comentarios baneados
 * PUT /api/moderacion/temas/{id}/banear              → banear tema  (body: {"motivo": "..."})
 * PUT /api/moderacion/temas/{id}/desbanear           → restaurar tema
 * PUT /api/moderacion/comentarios/{id}/banear        → banear comentario
 * PUT /api/moderacion/comentarios/{id}/desbanear     → restaurar comentario
 */
@RestController
@RequestMapping("/api/moderacion")
@RequiredArgsConstructor
public class ModeracionController {

    private final ModeracionService moderacionService;

    @GetMapping("/temas")
    public List<TemaResponse> temasBaneados(@RequestHeader(HEADER_USUARIO) Long usuarioId) {
        return moderacionService.temasBaneados(usuarioId);
    }

    @GetMapping("/comentarios")
    public List<ComentarioResponse> comentariosBaneados(@RequestHeader(HEADER_USUARIO) Long usuarioId) {
        return moderacionService.comentariosBaneados(usuarioId);
    }

    @PutMapping("/temas/{id}/banear")
    public TemaResponse banearTema(@RequestHeader(HEADER_USUARIO) Long usuarioId, @PathVariable Long id,
                                   @Valid @RequestBody BaneoRequest req) {
        return moderacionService.banearTema(usuarioId, id, req.motivo());
    }

    @PutMapping("/temas/{id}/desbanear")
    public TemaResponse desbanearTema(@RequestHeader(HEADER_USUARIO) Long usuarioId, @PathVariable Long id) {
        return moderacionService.desbanearTema(usuarioId, id);
    }

    @PutMapping("/comentarios/{id}/banear")
    public ComentarioResponse banearComentario(@RequestHeader(HEADER_USUARIO) Long usuarioId, @PathVariable Long id,
                                               @Valid @RequestBody BaneoRequest req) {
        return moderacionService.banearComentario(usuarioId, id, req.motivo());
    }

    @PutMapping("/comentarios/{id}/desbanear")
    public ComentarioResponse desbanearComentario(@RequestHeader(HEADER_USUARIO) Long usuarioId,
                                                  @PathVariable Long id) {
        return moderacionService.desbanearComentario(usuarioId, id);
    }
}
