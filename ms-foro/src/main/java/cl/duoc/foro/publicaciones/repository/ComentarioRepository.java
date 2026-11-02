package cl.duoc.foro.publicaciones.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cl.duoc.foro.publicaciones.model.Comentario;
import cl.duoc.foro.publicaciones.model.Estado;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    /** Comentarios visibles de un tema, del más antiguo al más nuevo (orden de conversación). */
    List<Comentario> findByTemaIdAndEstadoOrderByFechaCreacionAscIdAsc(Long temaId, Estado estado);

    List<Comentario> findByEstadoOrderByIdAsc(Estado estado);

    /** Cantidad de comentarios con cierto estado por tema: filas [idTema, cantidad]. */
    @Query("""
            SELECT c.tema.id, COUNT(c.id) FROM Comentario c
            WHERE c.estado = :estado AND c.tema.id IN :temaIds
            GROUP BY c.tema.id
            """)
    List<Object[]> contarPorTema(@Param("estado") Estado estado, @Param("temaIds") Collection<Long> temaIds);
}
