import { Categoria, Comentario, Tema, Usuario } from '../models/modelos';

/**
 * Datos de ejemplo con los que arranca Ágora (arreglos en memoria).
 * Usuarios y categorías coinciden con bd/script_foro.sql.
 * Las contraseñas cumplen las reglas del frontend (incluyen un carácter especial).
 */

export const USUARIOS_INICIALES: Usuario[] = [
  { id: 1, nombre: 'Administrador del Foro', username: 'admin', correo: 'admin@foro.cl', password: 'Admin#123', rol: 'ADMIN', activo: true, fechaRegistro: '2026-08-01T10:00:00', bio: 'Cuido que la plaza esté en orden.' },
  { id: 2, nombre: 'Moderadora General', username: 'moderador', correo: 'moderador@foro.cl', password: 'Moder#123', rol: 'MODERADOR', activo: true, fechaRegistro: '2026-08-03T09:30:00', bio: 'Reviso reportes y mantengo el respeto.' },
  { id: 3, nombre: 'Victor Gonzalez', username: 'victor', correo: 'victor@correo.cl', password: 'Usuario#123', rol: 'USUARIO', activo: true, fechaRegistro: '2026-08-10T18:12:00', bio: 'Estudiante de desarrollo de software. Fan de los juegos de mesa.' },
  { id: 4, nombre: 'Camila Rojas', username: 'camila', correo: 'camila@correo.cl', password: 'Usuario#123', rol: 'USUARIO', activo: true, fechaRegistro: '2026-08-15T20:45:00', bio: 'Series, cooperativos y café.' },
  { id: 5, nombre: 'Matías Fuentes', username: 'matias', correo: 'matias@correo.cl', password: 'Usuario#123', rol: 'USUARIO', activo: true, fechaRegistro: '2026-09-02T12:00:00' },
  { id: 6, nombre: 'Josefa Navarro', username: 'josefa', correo: 'josefa@correo.cl', password: 'Usuario#123', rol: 'USUARIO', activo: false, fechaRegistro: '2026-09-20T16:20:00', bio: 'Cuenta desactivada por un administrador.' },
];

export const CATEGORIAS_INICIALES: Categoria[] = [
  { id: 1, nombre: 'Tecnología y Programación', slug: 'tecnologia', descripcion: 'Lenguajes, frameworks, hardware y desarrollo de software.', icono: 'bi-cpu', color: '#2B50D6' },
  { id: 2, nombre: 'Videojuegos', slug: 'videojuegos', descripcion: 'Novedades, reseñas y recomendaciones de videojuegos.', icono: 'bi-controller', color: '#7A3FD1' },
  { id: 3, nombre: 'Juegos de Mesa', slug: 'juegos-de-mesa', descripcion: 'Reglas, estrategias y recomendaciones de juegos de mesa.', icono: 'bi-dice-5', color: '#C2410C' },
  { id: 4, nombre: 'Cine y Series', slug: 'cine-y-series', descripcion: 'Estrenos, críticas y teorías de películas y series.', icono: 'bi-film', color: '#BE185D' },
  { id: 5, nombre: 'Deportes', slug: 'deportes', descripcion: 'Fútbol, básquetbol, tenis y todo lo deportivo.', icono: 'bi-trophy', color: '#4F7A28' },
  { id: 6, nombre: 'Música', slug: 'musica', descripcion: 'Bandas, discos, conciertos e instrumentos.', icono: 'bi-music-note-beamed', color: '#0E7490' },
];

export const TEMAS_INICIALES: Tema[] = [
  { id: 1, titulo: '¿Spring Boot o Node.js para microservicios?', contenido: 'Estoy empezando un proyecto con microservicios y no sé si usar Spring Boot o Node.js. El equipo sabe algo de Java, pero Node parece más rápido para prototipar. ¿Qué recomiendan y por qué?', fechaCreacion: '2026-11-02T10:15:00', estado: 'ACTIVO', categoriaId: 1, autorId: 3 },
  { id: 2, titulo: 'Mejores juegos cooperativos para 2 jugadores', contenido: 'Busco recomendaciones de juegos de mesa cooperativos para jugar en pareja. Ya tenemos Pandemic y nos encantó. Idealmente partidas de menos de una hora.', fechaCreacion: '2026-11-05T21:40:00', estado: 'ACTIVO', categoriaId: 3, autorId: 4 },
  { id: 3, titulo: 'Teorías sobre el final de temporada', contenido: 'Abro este tema para comentar teorías sobre el final de temporada. Marquen los spoilers, por favor, que no todos la han terminado.', fechaCreacion: '2026-11-08T23:05:00', estado: 'ACTIVO', categoriaId: 4, autorId: 4 },
  { id: 4, titulo: '¿Qué videojuego indie recomiendan?', contenido: 'Terminé Hollow Knight y busco otro indie con buena historia y algo de dificultad. Juego en PC y Switch.', fechaCreacion: '2026-11-10T19:30:00', estado: 'ACTIVO', categoriaId: 2, autorId: 3 },
  { id: 5, titulo: 'Normas de la categoría Deportes', contenido: 'Recuerden mantener el respeto entre hinchas. Se puede discutir con pasión, pero los insultos y mensajes ofensivos serán baneados por la moderación.', fechaCreacion: '2026-10-20T09:00:00', estado: 'ACTIVO', categoriaId: 5, autorId: 1 },
  { id: 6, titulo: 'VENDO CUENTAS BARATAS!!!', contenido: 'Escríbanme por interno para comprar cuentas a muy buen precio.', fechaCreacion: '2026-11-11T03:12:00', estado: 'BANEADO', motivoBaneo: 'Spam / venta no permitida según las normas del foro', categoriaId: 6, autorId: 4 },
  { id: 7, titulo: 'Angular con signals: ¿vale la pena migrar?', contenido: 'En mi proyecto todavía uso RxJS para casi todo el estado. ¿Alguien migró a signals? Me interesa saber qué tan grande fue el cambio y si mejoró el rendimiento.', fechaCreacion: '2026-11-14T15:20:00', estado: 'ACTIVO', categoriaId: 1, autorId: 5 },
  { id: 8, titulo: 'Discos chilenos que todos deberían escuchar', contenido: 'Armemos una lista de discos chilenos imprescindibles, de cualquier época y género. Parto con tres y ustedes siguen.', fechaCreacion: '2026-11-15T20:00:00', estado: 'ACTIVO', categoriaId: 6, autorId: 3 },
  { id: 9, titulo: '¿Quién gana la liga este año?', contenido: 'Quedan pocas fechas y la tabla está apretada. ¿Cuál es su pronóstico? Argumenten con datos, no solo con el corazón.', fechaCreacion: '2026-11-16T22:10:00', estado: 'ACTIVO', categoriaId: 5, autorId: 5 },
  { id: 10, titulo: 'Juegos de mesa para iniciar a la familia', contenido: 'Quiero llevar juegos para las fiestas de fin de año. Mi familia nunca ha jugado nada más allá del Monopoly. ¿Qué juegos fáciles de explicar recomiendan?', fechaCreacion: '2026-11-18T13:45:00', estado: 'ACTIVO', categoriaId: 3, autorId: 3 },
];

export const COMENTARIOS_INICIALES: Comentario[] = [
  { id: 1, contenido: 'Spring Boot tiene un ecosistema muy completo: Spring Data JPA, Security, Actuator... Para microservicios con base de datos relacional me parece más sólido.', fechaCreacion: '2026-11-02T11:00:00', estado: 'ACTIVO', temaId: 1, autorId: 4 },
  { id: 2, contenido: 'Si el equipo ya sabe Java, Spring Boot es la opción más segura. Node es buena alternativa si van a trabajar mucho con tiempo real.', fechaCreacion: '2026-11-02T12:30:00', estado: 'ACTIVO', temaId: 1, autorId: 2 },
  { id: 3, contenido: 'Prueben Forbidden Island, es corto y muy entretenido para dos.', fechaCreacion: '2026-11-05T22:10:00', estado: 'ACTIVO', temaId: 2, autorId: 3 },
  { id: 4, contenido: 'Spirit Island también es cooperativo, aunque bastante más complejo. Para después de dominar Pandemic.', fechaCreacion: '2026-11-06T09:20:00', estado: 'ACTIVO', temaId: 2, autorId: 1 },
  { id: 5, contenido: 'Celeste y Hades son excelentes opciones. Hades tiene una historia que se va contando entre partidas.', fechaCreacion: '2026-11-10T20:05:00', estado: 'ACTIVO', temaId: 4, autorId: 4 },
  { id: 6, contenido: 'Eres un ignorante, no sabes nada de series.', fechaCreacion: '2026-11-09T00:30:00', estado: 'BANEADO', motivoBaneo: 'Lenguaje ofensivo hacia otro usuario', temaId: 3, autorId: 3 },
  { id: 7, contenido: 'Yo creo que el personaje principal sobrevive. La última escena deja demasiadas pistas.', fechaCreacion: '2026-11-09T10:15:00', estado: 'ACTIVO', temaId: 3, autorId: 5 },
  { id: 8, contenido: 'Migré un proyecto mediano y valió la pena: el código de los componentes quedó mucho más simple. RxJS lo dejé solo para las llamadas HTTP.', fechaCreacion: '2026-11-14T17:40:00', estado: 'ACTIVO', temaId: 7, autorId: 3 },
  { id: 9, contenido: 'Hazlo por partes, componente por componente. No hace falta migrar todo de una vez.', fechaCreacion: '2026-11-15T08:55:00', estado: 'ACTIVO', temaId: 7, autorId: 2 },
  { id: 10, contenido: 'Dixit y Código Secreto funcionan muy bien con gente que nunca ha jugado.', fechaCreacion: '2026-11-18T14:30:00', estado: 'ACTIVO', temaId: 10, autorId: 4 },
  { id: 11, contenido: 'Sumo Ticket to Ride: se explica en cinco minutos y engancha a todos.', fechaCreacion: '2026-11-18T16:02:00', estado: 'ACTIVO', temaId: 10, autorId: 5 },
  { id: 12, contenido: 'Y Carcassonne. Mi abuela ahora nos gana a todos.', fechaCreacion: '2026-11-19T11:20:00', estado: 'ACTIVO', temaId: 10, autorId: 1 },
];
