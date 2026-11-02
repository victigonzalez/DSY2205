package cl.duoc.foro.publicaciones.model;

import org.hibernate.annotations.Immutable;
import org.hibernate.type.NumericBooleanConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Vista de SOLO LECTURA de la tabla USUARIOS (@Immutable: Hibernate nunca la modifica).
 *
 * ms-usuarios es el dueño de los usuarios. ms-foro solo necesita saber quién
 * publica, si su cuenta está activa y qué rol tiene (para moderar).
 * No se mapea la contraseña: este microservicio no tiene por qué verla.
 */
@Entity
@Immutable
@Table(name = "USUARIOS")
@Getter
@NoArgsConstructor
public class Autor {

    @Id
    @Column(name = "ID_USUARIO")
    private Long id;

    @Column(name = "USERNAME")
    private String username;

    @Column(name = "NOMBRE")
    private String nombre;

    @Convert(converter = NumericBooleanConverter.class)
    @Column(name = "ACTIVO")
    private Boolean activo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_ROL")
    private RolRef rol;

    public String getNombreRol() {
        return rol.getNombre();
    }
}
