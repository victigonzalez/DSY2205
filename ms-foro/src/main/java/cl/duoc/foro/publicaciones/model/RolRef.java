package cl.duoc.foro.publicaciones.model;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Vista de SOLO LECTURA de la tabla ROLES.
 * Los roles los administra ms-usuarios; aquí solo se consultan para validar permisos.
 */
@Entity
@Immutable
@Table(name = "ROLES")
@Getter
@NoArgsConstructor
public class RolRef {

    @Id
    @Column(name = "ID_ROL")
    private Long id;

    @Column(name = "NOMBRE")
    private String nombre;
}
