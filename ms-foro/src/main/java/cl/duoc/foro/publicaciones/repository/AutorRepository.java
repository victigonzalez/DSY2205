package cl.duoc.foro.publicaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.foro.publicaciones.model.Autor;

/** Lectura de usuarios (solo para identificar al autor y validar su rol). */
@Repository
public interface AutorRepository extends JpaRepository<Autor, Long> {
}
