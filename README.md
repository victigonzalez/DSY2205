# 💬 Foro en Línea — Backend con microservicios

Backend del **Sistema de Foros en Línea** para la asignatura **Desarrollo Full Stack III (DSY2205)**,
Experiencia 1, Semana 2: *"Programando nuestro BackEnd"*.

Construido con **Spring Boot 3** sobre **Java 17** y una base de datos **Oracle Autonomous Database**
(Oracle Cloud), con conexión mediante **Wallet**.

## Microservicios

| Microservicio | Puerto | Responsabilidad |
|---------------|--------|-----------------|
| `ms-usuarios` | 8081 | Control de usuarios (crear, modificar, eliminar, listar) e inicio de sesión |
| `ms-foro`     | 8082 | Búsqueda, visualización y publicación de temas, y comentarios. Incluye moderación (banear) |

Ambos comparten el mismo esquema de Oracle. `ms-usuarios` es el **dueño** de las tablas `USUARIOS` y `ROLES`.
`ms-foro` solo las **lee** (entidades `@Immutable`) para identificar al autor y validar su rol.

## Estructura del repositorio

```
foro-backend/
├── bd/
│   └── script_foro.sql            ← tablas + datos de ejemplo (Oracle)
├── ms-usuarios/                   ← microservicio 1 (cl.duoc.foro.usuarios)
├── ms-foro/                       ← microservicio 2 (cl.duoc.foro.publicaciones)
└── postman/
    └── Foro_Microservicios.postman_collection.json
```

Cada microservicio sigue la misma organización por capas:

```
controller/   → endpoints REST (@RestController)
service/      → lógica de negocio y reglas de permisos (@Service)
repository/   → acceso a datos con Spring Data JPA (@Repository)
model/        → entidades JPA mapeadas a las tablas de Oracle
dto/          → datos de entrada (con validaciones) y de salida (JSON)
exception/    → manejo global de errores (@RestControllerAdvice)
config/       → CORS y beans de configuración
```

## Base de datos

`bd/script_foro.sql` crea 5 tablas y carga los datos de ejemplo. Se puede ejecutar varias veces, porque borra las tablas antes de crearlas.

| Tabla | Registros iniciales |
|-------|---------------------|
| ROLES | 3 (ADMIN, MODERADOR, USUARIO) |
| USUARIOS | 4 (contraseñas cifradas con BCrypt) |
| CATEGORIAS | 6 |
| TEMAS | 6 (1 baneado) |
| COMENTARIOS | 6 (1 baneado) |

## Roles y privilegios

| Acción | USUARIO | MODERADOR | ADMIN |
|--------|:------:|:---------:|:-----:|
| Ver y buscar temas y comentarios | ✅ | ✅ | ✅ |
| Publicar temas y comentar | ✅ | ✅ | ✅ |
| Editar su **propio** tema o comentario | ✅ | ✅ | ✅ |
| Eliminar su propio contenido | ✅ | ✅ | ✅ |
| Eliminar contenido **ajeno** | ❌ | ✅ | ✅ |
| Banear y desbanear temas y comentarios | ❌ | ✅ | ✅ |
| Crear, modificar y eliminar categorías | ❌ | ❌ | ✅ |

**Identificación del usuario.** El cliente inicia sesión en `ms-usuarios` (`POST /api/usuarios/login`) y luego
envía el `id` recibido en el header **`X-Usuario-Id`** en cada operación de escritura en `ms-foro`.
`ms-foro` valida que el usuario exista, que esté activo y que su rol tenga permiso.
*(En producción esto se reemplazaría por un token JWT con Spring Security.)*

## Cuentas de prueba

| id | Usuario | Contraseña | Rol |
|----|---------|-----------|-----|
| 1 | admin | Admin123 | ADMIN |
| 2 | moderador | Moder123 | MODERADOR |
| 3 | victor | Usuario123 | USUARIO |
| 4 | camila | Usuario123 | USUARIO |

## Cómo ejecutar

Requisitos: **Java 17 o superior**. No hace falta instalar Maven, porque cada microservicio trae `mvnw` (Maven Wrapper).
En Windows usa `mvnw.cmd` en lugar de `./mvnw`.

### Opción A — Oracle Cloud (perfil `oracle`, por defecto)

1. En Oracle Cloud crea la base autónoma y ejecuta `bd/script_foro.sql` (SQL Developer Web o SQL Developer).
2. Descarga el **Wallet** y descomprímelo en la raíz del repositorio como `Wallet_foro/`.
   El `.gitignore` lo excluye, así que nunca se sube a Git.
3. Configura las variables de entorno (o edita los valores por defecto en `application-oracle.properties`):

   | Variable | Ejemplo | Descripción |
   |----------|---------|-------------|
   | `DB_SERVICIO` | `foro_high` | Nombre del servicio en `Wallet_foro/tnsnames.ora` |
   | `DB_WALLET` | `../Wallet_foro` | Carpeta del Wallet, relativa a cada microservicio |
   | `DB_USUARIO` | `ADMIN` | Usuario de la base |
   | `DB_PASSWORD` | `********` | Contraseña de la base |

4. Levanta cada microservicio en su propia terminal:
   ```bash
   cd ms-usuarios && ./mvnw spring-boot:run
   cd ms-foro     && ./mvnw spring-boot:run
   ```

### Opción B — Sin Oracle (perfil `local`, H2 en modo Oracle)

Ambos microservicios comparten una base H2 en archivo (`~/foro-h2`), igual que comparten el esquema en Oracle.
**Levanta primero `ms-usuarios`**, porque es el que crea las tablas y carga los datos al iniciar:

```bash
cd ms-usuarios && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
cd ms-foro     && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Cada vez que reinicias `ms-usuarios`, los datos vuelven al estado inicial.
Consola H2: http://localhost:8081/h2-console (JDBC URL `jdbc:h2:file:~/foro-h2/foro;MODE=Oracle;AUTO_SERVER=TRUE`, usuario `sa`, sin contraseña).

### Tests automáticos

```bash
cd ms-usuarios && ./mvnw test     # 23 tests
cd ms-foro     && ./mvnw test     # 29 tests
```

Los tests usan una base H2 en memoria propia y no necesitan conexión a Oracle.

## Endpoints

### ms-usuarios — `http://localhost:8081`

| Método | Ruta | Descripción | Respuesta |
|--------|------|-------------|-----------|
| GET | `/api/usuarios` | Lista usuarios (filtro opcional `?rol=MODERADOR`) | 200 |
| GET | `/api/usuarios/{id}` | Detalle de un usuario | 200 / 404 |
| GET | `/api/usuarios/roles` | Roles disponibles | 200 |
| POST | `/api/usuarios` | Crear usuario (rol por defecto `USUARIO`) | 201 / 400 / 409 |
| PUT | `/api/usuarios/{id}` | Modificar (contraseña, rol y `activo` son opcionales) | 200 / 400 / 404 / 409 |
| DELETE | `/api/usuarios/{id}` | Eliminar (borra en cascada sus temas y comentarios) | 204 / 404 |
| POST | `/api/usuarios/login` | Iniciar sesión | 200 / 401 / 403 |

### ms-foro — `http://localhost:8082`

**Categorías**

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/categorias` | Lista categorías | Público |
| GET | `/api/categorias/resumen` | Cantidad de temas activos por categoría (GROUP BY) | Público |
| GET | `/api/categorias/{id}` | Detalle | Público |
| GET | `/api/categorias/{id}/temas` | Temas activos de la categoría | Público |
| POST | `/api/categorias` | Crear | ADMIN |
| PUT | `/api/categorias/{id}` | Modificar | ADMIN |
| DELETE | `/api/categorias/{id}` | Eliminar (409 si tiene temas) | ADMIN |

**Temas y comentarios**

| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/api/temas` | Buscar temas activos. Filtros opcionales combinables: `categoriaId`, `q` (palabra clave en título o contenido) y `autor` (username) | Público |
| GET | `/api/temas/populares?limite=5` | Temas más comentados (COUNT + GROUP BY) | Público |
| GET | `/api/temas/{id}` | Detalle con comentarios visibles (410 si está baneado) | Público |
| POST | `/api/temas` | Publicar tema | Usuario activo |
| PUT | `/api/temas/{id}` | Editar tema | Solo el autor |
| DELETE | `/api/temas/{id}` | Eliminar tema y sus comentarios | Autor, MODERADOR o ADMIN |
| GET | `/api/temas/{id}/comentarios` | Comentarios visibles del tema | Público |
| POST | `/api/temas/{id}/comentarios` | Comentar | Usuario activo |
| GET | `/api/comentarios/{id}` | Detalle de un comentario | Público |
| PUT | `/api/comentarios/{id}` | Editar comentario | Solo el autor |
| DELETE | `/api/comentarios/{id}` | Eliminar comentario | Autor, MODERADOR o ADMIN |

**Moderación** (siempre con `X-Usuario-Id` de un ADMIN o MODERADOR)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/moderacion/temas` | Temas baneados |
| GET | `/api/moderacion/comentarios` | Comentarios baneados |
| PUT | `/api/moderacion/temas/{id}/banear` | Banear tema. Body: `{"motivo": "..."}` |
| PUT | `/api/moderacion/temas/{id}/desbanear` | Restaurar tema |
| PUT | `/api/moderacion/comentarios/{id}/banear` | Banear comentario. Body: `{"motivo": "..."}` |
| PUT | `/api/moderacion/comentarios/{id}/desbanear` | Restaurar comentario |

## Formato de errores

Todos los errores responden con la misma estructura, gracias a `GlobalExceptionHandler` (`@RestControllerAdvice`):

```json
{
  "fecha": "2026-10-31T00:06:52.1",
  "status": 400,
  "error": "Bad Request",
  "mensaje": "Los datos enviados no son válidos",
  "ruta": "/api/usuarios",
  "detalles": {
    "correo": "El correo no tiene un formato válido",
    "password": "La contraseña debe tener entre 6 y 20 caracteres, con al menos una mayúscula, una minúscula y un número"
  }
}
```

| Código | Cuándo |
|--------|--------|
| 400 | Validación fallida, JSON mal formado, parámetro inválido o falta `X-Usuario-Id` |
| 401 | Login incorrecto, o `X-Usuario-Id` de un usuario que no existe |
| 403 | Sin permiso para la acción, o cuenta desactivada |
| 404 | El recurso no existe |
| 409 | Duplicado (username, correo, categoría) o estado inválido (banear algo ya baneado) |
| 410 | El tema o comentario fue baneado |

## Pruebas con Postman

1. Importa `postman/Foro_Microservicios.postman_collection.json` en Postman.
2. Con ambos microservicios levantados, abre el **Runner** y ejecuta la colección completa **en orden**.
   Las peticiones guardan los ids (usuario, tema, comentario, categoría) en variables de la colección.
3. Resultado esperado: **52 peticiones y 127 validaciones exitosas**. La colección se puede ejecutar varias veces seguidas.

Para correrla por consola: `npx newman run postman/Foro_Microservicios.postman_collection.json`

## Buenas prácticas aplicadas

- **Validación de datos** con `@NotBlank`, `@Email`, `@Size`, `@Pattern` y `@Positive` en los DTO, con un mensaje claro por campo.
- **Manejo global de excepciones** con `@RestControllerAdvice` y un formato de error único.
- **Logging** con `@Slf4j`: nivel INFO en general y DEBUG para el paquete `cl.duoc.foro`.
- **Seguridad:**
  - Contraseñas cifradas con BCrypt, que nunca se devuelven en las respuestas.
  - Permisos por rol.
  - CORS configurado (`app.cors.origenes`).
  - Credenciales de Oracle en variables de entorno, con el Wallet fuera de Git.
- **Arquitectura en capas:** controller → service → repository.
- **Consultas complejas en JPQL:** filtros combinados, `LEFT JOIN`, `GROUP BY`, `COUNT` y paginación.
- **Actuator:** `/actuator/health` en cada microservicio.
