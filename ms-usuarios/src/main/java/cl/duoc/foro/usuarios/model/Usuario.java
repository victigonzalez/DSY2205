package cl.duoc.foro.usuarios.model;

import java.time.LocalDateTime;

import org.hibernate.type.NumericBooleanConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Cuenta de un usuario del foro (tabla USUARIOS).
 *
 * La contraseña se guarda cifrada con BCrypt y nunca se expone en las
 * respuestas JSON: para eso se usa el DTO UsuarioResponse.
 */
@Entity
@Table(name = "USUARIOS")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_USUARIO")
    private Long id;

    @Column(name = "NOMBRE", nullable = false, length = 100)
    private String nombre;

    @Column(name = "USERNAME", nullable = false, unique = true, length = 30)
    private String username;

    @Column(name = "CORREO", nullable = false, unique = true, length = 120)
    private String correo;

    @Column(name = "PASSWORD", nullable = false, length = 100)
    private String password;

    /** En Oracle se guarda como NUMBER(1): 1 = activo, 0 = inactivo. */
    @Convert(converter = NumericBooleanConverter.class)
    @Column(name = "ACTIVO", nullable = false)
    private Boolean activo = true;

    @Column(name = "FECHA_REGISTRO", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "ID_ROL", nullable = false)
    private Rol rol;

    /** Antes de insertar, completa la fecha de registro y el estado por defecto. */
    @PrePersist
    void antesDeInsertar() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
        if (activo == null) {
            activo = true;
        }
    }
}
