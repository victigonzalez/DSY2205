package cl.duoc.foro.usuarios.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.usuarios.dto.LoginRequest;
import cl.duoc.foro.usuarios.dto.LoginResponse;
import cl.duoc.foro.usuarios.dto.UsuarioRequest;
import cl.duoc.foro.usuarios.dto.UsuarioResponse;
import cl.duoc.foro.usuarios.dto.UsuarioUpdateRequest;
import cl.duoc.foro.usuarios.model.Rol;
import cl.duoc.foro.usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * API REST de usuarios.
 *
 * GET    /api/usuarios            → lista (filtro opcional ?rol=ADMIN|MODERADOR|USUARIO)
 * GET    /api/usuarios/{id}       → detalle
 * POST   /api/usuarios            → crear (201)
 * PUT    /api/usuarios/{id}       → modificar
 * DELETE /api/usuarios/{id}       → eliminar (204)
 * POST   /api/usuarios/login      → iniciar sesión
 * GET    /api/usuarios/roles      → roles disponibles
 */
@Slf4j
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponse> listar(@RequestParam(required = false) String rol) {
        log.debug("GET /api/usuarios rol={}", rol);
        return usuarioService.listar(rol);
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Long id) {
        log.debug("GET /api/usuarios/{}", id);
        return usuarioService.obtener(id);
    }

    @GetMapping("/roles")
    public List<Rol> roles() {
        return usuarioService.listarRoles();
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioRequest req) {
        log.debug("POST /api/usuarios username={}", req.username());
        UsuarioResponse creado = usuarioService.crear(req);
        return ResponseEntity.created(URI.create("/api/usuarios/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateRequest req) {
        log.debug("PUT /api/usuarios/{}", id);
        return usuarioService.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.debug("DELETE /api/usuarios/{}", id);
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        log.debug("POST /api/usuarios/login username={}", req.username());
        return usuarioService.login(req);
    }
}
