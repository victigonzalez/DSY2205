package cl.duoc.foro.moderacion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.foro.moderacion.model.Autor;

/** Lectura de usuarios: identifica al moderador y valida su rol. */
@Repository
public interface AutorRepository extends JpaRepository<Autor, Long> {
}
