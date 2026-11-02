package cl.duoc.foro.usuarios.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tipo de usuario del foro. Define los privilegios:
 * - ADMIN: gestiona usuarios y modera todo el foro.
 * - MODERADOR: banea temas y comentarios.
 * - USUARIO: publica temas y comenta.
 */
@Entity
@Table(name = "ROLES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ROL")
    private Long id;

    @Column(name = "NOMBRE", nullable = false, unique = true, length = 20)
    private String nombre;

    @Column(name = "DESCRIPCION", length = 200)
    private String descripcion;
}
