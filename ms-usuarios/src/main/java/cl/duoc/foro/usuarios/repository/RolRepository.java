package cl.duoc.foro.usuarios.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.foro.usuarios.model.Rol;

/** Acceso a la tabla ROLES. */
@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    /** Busca un rol por su nombre (ADMIN, MODERADOR, USUARIO). */
    Optional<Rol> findByNombreIgnoreCase(String nombre);
}
