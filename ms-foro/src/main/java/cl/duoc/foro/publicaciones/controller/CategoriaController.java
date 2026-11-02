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
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.publicaciones.dto.CategoriaRequest;
import cl.duoc.foro.publicaciones.dto.CategoriaResponse;
import cl.duoc.foro.publicaciones.dto.ResumenCategoria;
import cl.duoc.foro.publicaciones.dto.TemaResponse;
import cl.duoc.foro.publicaciones.service.CategoriaService;
import cl.duoc.foro.publicaciones.service.TemaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * API REST de categorías.
 *
 * GET    /api/categorias              → lista
 * GET    /api/categorias/resumen      → cantidad de temas activos por categoría
 * GET    /api/categorias/{id}         → detalle
 * GET    /api/categorias/{id}/temas   → temas activos de la categoría
 * POST   /api/categorias              → crear       (ADMIN, header X-Usuario-Id)
 * PUT    /api/categorias/{id}         → modificar   (ADMIN)
 * DELETE /api/categorias/{id}         → eliminar    (ADMIN, solo si no tiene temas)
 */
@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;
    private final TemaService temaService;

    @GetMapping
    public List<CategoriaResponse> listar() {
        return categoriaService.listar();
    }

    @GetMapping("/resumen")
    public List<ResumenCategoria> resumen() {
        return categoriaService.resumen();
    }

    @GetMapping("/{id}")
    public CategoriaResponse obtener(@PathVariable Long id) {
        return categoriaService.obtener(id);
    }

    @GetMapping("/{id}/temas")
    public List<TemaResponse> temas(@PathVariable Long id) {
        return temaService.buscar(id, null, null);
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> crear(@RequestHeader(HEADER_USUARIO) Long usuarioId,
                                                   @Valid @RequestBody CategoriaRequest req) {
        CategoriaResponse creada = categoriaService.crear(usuarioId, req);
        return ResponseEntity.created(URI.create("/api/categorias/" + creada.id())).body(creada);
    }

    @PutMapping("/{id}")
    public CategoriaResponse actualizar(@RequestHeader(HEADER_USUARIO) Long usuarioId,
                                        @PathVariable Long id, @Valid @RequestBody CategoriaRequest req) {
        return categoriaService.actualizar(usuarioId, id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@RequestHeader(HEADER_USUARIO) Long usuarioId, @PathVariable Long id) {
        categoriaService.eliminar(usuarioId, id);
        return ResponseEntity.noContent().build();
    }
}
