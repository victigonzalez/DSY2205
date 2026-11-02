package cl.duoc.foro.publicaciones.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cl.duoc.foro.publicaciones.dto.ResumenCategoria;
import cl.duoc.foro.publicaciones.model.Categoria;
import cl.duoc.foro.publicaciones.model.Estado;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    /**
     * Consulta compleja: cada categoría con su cantidad de temas ACTIVOS.
     * LEFT JOIN para que aparezcan también las categorías sin temas (con 0).
     */
    @Query("""
            SELECT new cl.duoc.foro.publicaciones.dto.ResumenCategoria(c.id, c.nombre, COUNT(t.id))
            FROM Categoria c
            LEFT JOIN Tema t ON t.categoria = c AND t.estado = :estado
            GROUP BY c.id, c.nombre
            ORDER BY COUNT(t.id) DESC, c.id
            """)
    List<ResumenCategoria> resumen(@Param("estado") Estado estado);
}
