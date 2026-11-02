package cl.duoc.foro.usuarios.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.usuarios.dto.LoginRequest;
import cl.duoc.foro.usuarios.dto.LoginResponse;
import cl.duoc.foro.usuarios.dto.UsuarioRequest;
import cl.duoc.foro.usuarios.dto.UsuarioResponse;
import cl.duoc.foro.usuarios.dto.UsuarioUpdateRequest;
import cl.duoc.foro.usuarios.exception.NegocioException;
import cl.duoc.foro.usuarios.model.Rol;
import cl.duoc.foro.usuarios.model.Usuario;
import cl.duoc.foro.usuarios.repository.RolRepository;
import cl.duoc.foro.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Lógica de negocio de los usuarios: CRUD e inicio de sesión.
 * Los controladores solo reciben y responden; las reglas viven aquí.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private static final String ROL_POR_DEFECTO = "USUARIO";

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    // ------------------------------------------------------------------ Consultas

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar(String rol) {
        List<Usuario> usuarios = (rol == null || rol.isBlank())
                ? usuarioRepository.findAll(org.springframework.data.domain.Sort.by("id"))
                : usuarioRepository.findByRolNombreIgnoreCaseOrderByIdAsc(rol);
        return usuarios.stream().map(UsuarioResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        return UsuarioResponse.desde(buscarOFallar(id));
    }

    @Transactional(readOnly = true)
    public List<Rol> listarRoles() {
        return rolRepository.findAll(org.springframework.data.domain.Sort.by("id"));
    }

    // ------------------------------------------------------------------ CRUD

    @Transactional
    public UsuarioResponse crear(UsuarioRequest req) {
        if (usuarioRepository.existsByUsernameIgnoreCase(req.username())) {
            throw NegocioException.conflicto("El username '" + req.username() + "' ya está en uso");
        }
        if (usuarioRepository.existsByCorreoIgnoreCase(req.correo())) {
            throw NegocioException.conflicto("El correo '" + req.correo() + "' ya está registrado");
        }

        Usuario u = new Usuario();
        u.setNombre(req.nombre().trim());
        u.setUsername(req.username().trim().toLowerCase());
        u.setCorreo(req.correo().trim().toLowerCase());
        u.setPassword(passwordEncoder.encode(req.password()));
        u.setRol(buscarRol(req.rol() == null ? ROL_POR_DEFECTO : req.rol()));

        Usuario guardado = usuarioRepository.save(u);
        log.info("Usuario creado: id={} username={} rol={}", guardado.getId(), guardado.getUsername(),
                guardado.getRol().getNombre());
        return UsuarioResponse.desde(guardado);
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioUpdateRequest req) {
        Usuario u = buscarOFallar(id);

        if (usuarioRepository.existsByUsernameIgnoreCaseAndIdNot(req.username(), id)) {
            throw NegocioException.conflicto("El username '" + req.username() + "' ya está en uso");
        }
        if (usuarioRepository.existsByCorreoIgnoreCaseAndIdNot(req.correo(), id)) {
            throw NegocioException.conflicto("El correo '" + req.correo() + "' ya está registrado");
        }

        u.setNombre(req.nombre().trim());
        u.setUsername(req.username().trim().toLowerCase());
        u.setCorreo(req.correo().trim().toLowerCase());
        // Campos opcionales: solo se cambian si vienen en la petición
        if (req.password() != null) {
            u.setPassword(passwordEncoder.encode(req.password()));
        }
        if (req.rol() != null) {
            u.setRol(buscarRol(req.rol()));
        }
        if (req.activo() != null) {
            u.setActivo(req.activo());
        }

        log.info("Usuario actualizado: id={}", id);
        return UsuarioResponse.desde(usuarioRepository.save(u));
    }

    @Transactional
    public void eliminar(Long id) {
        Usuario u = buscarOFallar(id);
        usuarioRepository.delete(u);
        usuarioRepository.flush(); // ejecuta el DELETE ya: Oracle borra sus temas y comentarios (ON DELETE CASCADE)
        log.info("Usuario eliminado: id={} username={}", id, u.getUsername());
    }

    // ------------------------------------------------------------------ Login

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        // Mismo mensaje si no existe o si la contraseña falla: no revela qué usuarios existen
        Usuario u = usuarioRepository.findByUsernameIgnoreCase(req.username().trim())
                .filter(encontrado -> passwordEncoder.matches(req.password(), encontrado.getPassword()))
                .orElseThrow(() -> {
                    log.warn("Login fallido para username={}", req.username());
                    return NegocioException.noAutorizado("Usuario o contraseña incorrectos");
                });

        if (!Boolean.TRUE.equals(u.getActivo())) {
            log.warn("Login rechazado: la cuenta {} está desactivada", u.getUsername());
            throw NegocioException.prohibido("La cuenta está desactivada. Contacta a un administrador");
        }

        log.info("Login exitoso: username={} rol={}", u.getUsername(), u.getRol().getNombre());
        return new LoginResponse("Inicio de sesión exitoso. Bienvenido/a, " + u.getNombre(),
                UsuarioResponse.desde(u));
    }

    // ------------------------------------------------------------------ Auxiliares

    private Usuario buscarOFallar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> NegocioException.noEncontrado("No existe un usuario con id " + id));
    }

    private Rol buscarRol(String nombre) {
        return rolRepository.findByNombreIgnoreCase(nombre)
                .orElseThrow(() -> NegocioException.noEncontrado("No existe el rol " + nombre));
    }
}
