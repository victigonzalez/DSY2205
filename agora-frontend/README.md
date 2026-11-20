# Ágora — Frontend (Angular 22 + Bootstrap 5.3)

Frontend del Foro en Línea **Ágora**: "la plaza donde se conversa".
En esta entrega trabaja **por separado del backend**: los datos se manejan con **arreglos en memoria** (variables de Angular),
tal como piden las instrucciones de la Semana 5.

## Ejecutar

```bash
npm install
npm start            # http://localhost:4200
npm test             # 30 pruebas unitarias (Vitest)
npm run build        # compilación de producción en dist/agora-frontend/browser
```

## Cuentas de prueba

| Usuario | Contraseña | Rol | Puede |
|---|---|---|---|
| admin | `Admin#123` | ADMIN | Todo, además de gestionar usuarios y categorías |
| moderador | `Moder#123` | MODERADOR | Banear y desbanear temas y comentarios |
| victor | `Usuario#123` | USUARIO | Publicar, comentar y editar su contenido |
| josefa | `Usuario#123` | USUARIO desactivado | No puede iniciar sesión |

La pantalla de inicio de sesión muestra estas cuentas para completarlas con un clic.
**Administración → Usuarios → Restablecer datos de ejemplo** vuelve los arreglos a su estado inicial.

## Pantallas

| Pantalla | Ruta | Acceso |
|---|---|---|
| Inicio | `/` | Público |
| Inicio de sesión | `/login` | Sin sesión |
| Registro de usuarios | `/registro` | Sin sesión |
| Recuperar contraseña (2 pasos con código) | `/recuperar` | Sin sesión |
| Modificación de perfil y cambio de contraseña | `/perfil` | Con sesión |
| Temas: búsqueda, filtro y orden | `/temas` | Público |
| Categorías / temas de una categoría | `/categorias`, `/categorias/:slug` | Público |
| Detalle del tema y conversación | `/temas/:id` | Público (comentar requiere sesión) |
| Publicar / editar tema | `/temas/nuevo`, `/temas/:id/editar` | Con sesión (editar: solo el autor) |
| Mis temas | `/mis-temas` | Con sesión |
| Moderación | `/moderacion` | ADMIN o MODERADOR |
| Administración de usuarios | `/admin/usuarios` | ADMIN |
| Administración de categorías | `/admin/categorias` | ADMIN |

Los permisos se controlan con **guards** (`autenticadoGuard`, `invitadoGuard` y `rolGuard`, en `guards/guards.ts`)
y, además, dentro de cada servicio, de modo que la regla se cumple aunque alguien escriba la URL a mano.

## Validaciones

- **HTML**: `required`, `minlength`, `maxlength`, `type="email"`, `pattern`.
- **Angular** (formularios reactivos y validadores propios en `validadores/validadores.ts`):
  - **Contraseña con 7 reglas**: largo mínimo de 8, largo máximo de 20, mayúscula, minúscula, número, carácter especial y sin espacios. Se muestran como lista de chequeo en vivo.
  - Confirmación igual a la contraseña.
  - Nombre y apellido con solo letras.
  - Username con formato válido y no repetido.
  - Correo con dominio completo y no repetido.
  - Textos que no sean solo espacios.
  - Color en formato hexadecimal.
  - Motivo de baneo obligatorio.
- Cada campo muestra su error en un mensaje claro y se marca en rojo o verde. Al enviar con errores, el foco va al primer campo inválido.

## Patrones de diseño

| Patrón | Dónde | Qué resuelve |
|---|---|---|
| **Strategy** | `patrones/orden-temas/` | Cada criterio de orden de los temas es una clase (`OrdenRecientes`, `OrdenPopulares`, `OrdenAlfabetico`, `OrdenSinResponder`) con la misma interfaz `EstrategiaOrden`. El contexto `OrdenadorTemas` aplica la que elige el usuario, sin `if`/`switch`. Agregar un criterio nuevo es crear una clase |
| **Observer** (signals) | `services/` | Los arreglos son `signal<T[]>`. Las pantallas que los leen se actualizan solas cuando cambian; por ejemplo, la barra de navegación cambia al iniciar sesión |
| **Singleton** (servicios inyectables) | `providedIn: 'root'` | Una sola instancia de los datos y de la sesión, compartida por toda la aplicación |

## Diseño (identidad propia)

- **Nombre y logo:** Ágora, la plaza pública griega donde se conversaba. El logo es una burbuja de conversación con una A (SVG en `shared/logo.ts`, también usado como favicon).
- **Elemento protagonista:** la burbuja de conversación. Aparece en el logo, en el buscador de la portada, en los contadores de respuestas y en los comentarios: los propios a la derecha y los ajenos a la izquierda.
- **Color por categoría:** cada categoría tiene su color y lo lleva a sus temas, sus teselas y sus cabeceras.
- **Paleta:**
  - Mármol `#EEF1F5` (fondo) y tinta `#16213A` (texto).
  - Egeo `#2B50D6` (acciones) y ámbar `#F2B33D` (acento).
  - Olivo `#4F7A28` (lo activo) y granada `#B3261E` (lo baneado).
- **Tipografía:** Bricolage Grotesque para los títulos y Source Sans 3 para el texto, ambas instaladas con `@fontsource` (sin depender de internet).
- **Responsivo:** grilla de 12 columnas de Bootstrap, revisada en **móvil (390 px), tablet (820 px) y escritorio (1440 px)**.
