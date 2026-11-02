package cl.duoc.foro.usuarios.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.foro.usuarios.model.Usuario;

/** Acceso a la tabla USUARIOS. Spring Data genera las consultas a partir del nombre del método. */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** Usado en el login: busca la cuenta por su nombre de usuario. */
    Optional<Usuario> findByUsernameIgnoreCase(String username);

    /** Lista los usuarios que tienen un rol determinado (ej: todos los MODERADOR). */
    List<Usuario> findByRolNombreIgnoreCaseOrderByIdAsc(String nombreRol);

    // ----- Validaciones de duplicados -----

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByCorreoIgnoreCase(String correo);

    /** Al modificar: ¿existe OTRO usuario (id distinto) con ese username? */
    boolean existsByUsernameIgnoreCaseAndIdNot(String username, Long id);

    /** Al modificar: ¿existe OTRO usuario (id distinto) con ese correo? */
    boolean existsByCorreoIgnoreCaseAndIdNot(String correo, Long id);
}
