package cl.duoc.foro.moderacion.model;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Vista de SOLO LECTURA de la tabla CATEGORIAS (la administra ms-foro). */
@Entity
@Immutable
@Table(name = "CATEGORIAS")
@Getter
@NoArgsConstructor
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CATEGORIA")
    private Long id;

    @Column(name = "NOMBRE", nullable = false, unique = true, length = 60)
    private String nombre;

    @Column(name = "DESCRIPCION", length = 250)
    private String descripcion;
}
