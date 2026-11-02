package cl.duoc.foro.publicaciones.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import cl.duoc.foro.publicaciones.dto.ResumenCategoria;
import cl.duoc.foro.publicaciones.dto.TemaPopular;
import cl.duoc.foro.publicaciones.model.Autor;
import cl.duoc.foro.publicaciones.model.Estado;
import cl.duoc.foro.publicaciones.model.Tema;

/** Pruebas de las entidades y consultas de ms-foro contra los datos de script_foro.sql. */
@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};MODE=Oracle;DEFAULT_NULL_ORDERING=HIGH",
        "spring.sql.init.mode=always"})
@ActiveProfiles("local")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ForoRepositoryTest {

    @Autowired private CategoriaRepository categoriaRepository;
    @Autowired private TemaRepository temaRepository;
    @Autowired private ComentarioRepository comentarioRepository;
    @Autowired private AutorRepository autorRepository;

    @Test
    void cargaLasSeisCategorias() {
        assertThat(categoriaRepository.count()).isEqualTo(6);
    }

    @Test
    void leeAutorConSuRolSinExponerPassword() {
        Autor admin = autorRepository.findById(1L).orElseThrow();
        assertThat(admin.getUsername()).isEqualTo("admin");
        assertThat(admin.getNombreRol()).isEqualTo("ADMIN");
        assertThat(admin.getActivo()).isTrue();
    }

    @Test
    void buscarSinFiltrosDevuelveSoloTemasActivos() {
        List<Tema> temas = temaRepository.buscar(Estado.ACTIVO, null, null, null);
        assertThat(temas).hasSize(5).allMatch(t -> t.getEstado() == Estado.ACTIVO);
    }

    @Test
    void buscarPorPalabraClaveCategoriaYAutor() {
        assertThat(temaRepository.buscar(Estado.ACTIVO, null, "spring", null))
                .extracting(Tema::getTitulo).containsExactly("¿Spring Boot o Node.js para microservicios?");
        assertThat(temaRepository.buscar(Estado.ACTIVO, 3L, null, null))
                .extracting(t -> t.getCategoria().getNombre()).containsOnly("Juegos de Mesa");
        assertThat(temaRepository.buscar(Estado.ACTIVO, null, null, "victor")).hasSize(2);
    }

    @Test
    void temasPopularesOrdenadosPorComentarios() {
        List<TemaPopular> top = temaRepository.populares(Estado.ACTIVO, PageRequest.of(0, 3));
        assertThat(top).hasSize(3);
        assertThat(top.get(0).cantidadComentarios()).isEqualTo(2L);
        assertThat(top.get(0).cantidadComentarios()).isGreaterThanOrEqualTo(top.get(2).cantidadComentarios());
    }

    @Test
    void resumenIncluyeCategoriasSinTemasActivos() {
        List<ResumenCategoria> resumen = categoriaRepository.resumen(Estado.ACTIVO);
        assertThat(resumen).hasSize(6);
        // Música solo tiene un tema baneado → 0 temas activos
        assertThat(resumen).filteredOn(r -> r.categoria().equals("Música"))
                .singleElement().extracting(ResumenCategoria::cantidadTemas).isEqualTo(0L);
    }

    @Test
    void comentariosVisiblesExcluyenBaneados() {
        assertThat(comentarioRepository.findByTemaIdAndEstadoOrderByFechaCreacionAscIdAsc(3L, Estado.ACTIVO)).isEmpty();
        assertThat(comentarioRepository.findByEstadoOrderByIdAsc(Estado.BANEADO)).hasSize(1);
    }
}
