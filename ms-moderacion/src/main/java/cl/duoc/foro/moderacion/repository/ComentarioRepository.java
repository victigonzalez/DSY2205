package cl.duoc.foro.moderacion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.foro.moderacion.model.Comentario;
import cl.duoc.foro.moderacion.model.Estado;

/** Comentarios del foro, vistos desde la moderación. */
@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    List<Comentario> findByEstadoOrderByIdAsc(Estado estado);

    long countByEstado(Estado estado);
}
