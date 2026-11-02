package cl.duoc.foro.publicaciones.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.publicaciones.dto.CategoriaRequest;
import cl.duoc.foro.publicaciones.dto.CategoriaResponse;
import cl.duoc.foro.publicaciones.dto.ResumenCategoria;
import cl.duoc.foro.publicaciones.exception.NegocioException;
import cl.duoc.foro.publicaciones.model.Categoria;
import cl.duoc.foro.publicaciones.model.Estado;
import cl.duoc.foro.publicaciones.repository.CategoriaRepository;
import cl.duoc.foro.publicaciones.repository.TemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** Categorías del foro: cualquiera las consulta, solo un ADMIN las administra. */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final TemaRepository temaRepository;
    private final PermisoService permisoService;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categoriaRepository.findAll(Sort.by("id")).stream().map(CategoriaResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtener(Long id) {
        return CategoriaResponse.desde(buscarOFallar(id));
    }

    @Transactional(readOnly = true)
    public List<ResumenCategoria> resumen() {
        return categoriaRepository.resumen(Estado.ACTIVO);
    }

    @Transactional
    public CategoriaResponse crear(Long usuarioId, CategoriaRequest req) {
        permisoService.exigirAdmin(usuarioId);
        if (categoriaRepository.existsByNombreIgnoreCase(req.nombre().trim())) {
            throw NegocioException.conflicto("Ya existe la categoría '" + req.nombre() + "'");
        }
        Categoria c = new Categoria();
        c.setNombre(req.nombre().trim());
        c.setDescripcion(req.descripcion());
        Categoria guardada = categoriaRepository.save(c);
        log.info("Categoría creada: id={} nombre={}", guardada.getId(), guardada.getNombre());
        return CategoriaResponse.desde(guardada);
    }

    @Transactional
    public CategoriaResponse actualizar(Long usuarioId, Long id, CategoriaRequest req) {
        permisoService.exigirAdmin(usuarioId);
        Categoria c = buscarOFallar(id);
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(req.nombre().trim(), id)) {
            throw NegocioException.conflicto("Ya existe la categoría '" + req.nombre() + "'");
        }
        c.setNombre(req.nombre().trim());
        c.setDescripcion(req.descripcion());
        log.info("Categoría actualizada: id={}", id);
        return CategoriaResponse.desde(categoriaRepository.save(c));
    }

    @Transactional
    public void eliminar(Long usuarioId, Long id) {
        permisoService.exigirAdmin(usuarioId);
        Categoria c = buscarOFallar(id);
        if (temaRepository.existsByCategoriaId(id)) {
            throw NegocioException.conflicto(
                    "No se puede eliminar '" + c.getNombre() + "' porque tiene temas publicados");
        }
        categoriaRepository.delete(c);
        log.info("Categoría eliminada: id={} nombre={}", id, c.getNombre());
    }

    Categoria buscarOFallar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> NegocioException.noEncontrado("No existe una categoría con id " + id));
    }
}
