package cl.duoc.foro.moderacion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.foro.moderacion.model.Estado;
import cl.duoc.foro.moderacion.model.Tema;

/** Temas del foro, vistos desde la moderación. */
@Repository
public interface TemaRepository extends JpaRepository<Tema, Long> {

    List<Tema> findByEstadoOrderByIdAsc(Estado estado);

    long countByEstado(Estado estado);
}
