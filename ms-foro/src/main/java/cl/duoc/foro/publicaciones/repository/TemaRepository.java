package cl.duoc.foro.publicaciones.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cl.duoc.foro.publicaciones.dto.TemaPopular;
import cl.duoc.foro.publicaciones.model.Estado;
import cl.duoc.foro.publicaciones.model.Tema;

@Repository
public interface TemaRepository extends JpaRepository<Tema, Long> {

    /**
     * Consulta compleja: búsqueda de temas combinando filtros opcionales.
     *
     * @param categoriaId null = todas las categorías
     * @param texto       palabra a buscar (en minúsculas) en título o contenido; null = sin filtro
     * @param autor       username del autor (en minúsculas); null = cualquier autor
     *
     * Se usa LOCATE (INSTR en Oracle) en vez de LIKE: no requiere comodines
     * y se comporta igual en Oracle y en H2.
     */
    @Query("""
            SELECT t FROM Tema t
            WHERE t.estado = :estado
              AND (:categoriaId IS NULL OR t.categoria.id = :categoriaId)
              AND (:texto IS NULL
                   OR LOCATE(:texto, LOWER(t.titulo)) > 0
                   OR LOCATE(:texto, LOWER(t.contenido)) > 0)
              AND (:autor IS NULL OR LOWER(t.autor.username) = :autor)
            ORDER BY t.fechaCreacion DESC, t.id DESC
            """)
    List<Tema> buscar(@Param("estado") Estado estado,
                      @Param("categoriaId") Long categoriaId,
                      @Param("texto") String texto,
                      @Param("autor") String autor);

    /**
     * Consulta compleja: temas activos ordenados por cantidad de comentarios activos.
     * Agrupa (GROUP BY) y cuenta (COUNT) en la base de datos.
     */
    @Query("""
            SELECT new cl.duoc.foro.publicaciones.dto.TemaPopular(
                       t.id, t.titulo, c.nombre, a.username, COUNT(co.id))
            FROM Tema t
            JOIN t.categoria c
            JOIN t.autor a
            LEFT JOIN Comentario co ON co.tema = t AND co.estado = :estado
            WHERE t.estado = :estado
            GROUP BY t.id, t.titulo, c.nombre, a.username
            ORDER BY COUNT(co.id) DESC, t.id
            """)
    List<TemaPopular> populares(@Param("estado") Estado estado, Pageable pagina);

    List<Tema> findByEstadoOrderByIdAsc(Estado estado);

    boolean existsByCategoriaId(Long categoriaId);
}
