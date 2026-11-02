-- Archivo generado automáticamente desde bd/script_foro.sql (perfil local H2)
-- 3. Datos de ejemplo (mínimo 3 registros por tabla)
-- ------------------------------------------------------------

-- ROLES (3)
INSERT INTO roles (nombre, descripcion) VALUES ('ADMIN',     'Administra usuarios, categorías y modera todo el foro');
INSERT INTO roles (nombre, descripcion) VALUES ('MODERADOR', 'Puede banear temas y comentarios que incumplan las normas');
INSERT INTO roles (nombre, descripcion) VALUES ('USUARIO',   'Publica temas y comenta en el foro');

-- USUARIOS (4)
INSERT INTO usuarios (nombre, username, correo, password, id_rol)
VALUES ('Administrador del Foro', 'admin', 'admin@foro.cl',
        '$2a$10$REd6wI8n70soXsqzsU6Gw.1LGaYCVoJTbPjDsztHU/uzBcCSZOGuO',
        (SELECT id_rol FROM roles WHERE nombre = 'ADMIN'));

INSERT INTO usuarios (nombre, username, correo, password, id_rol)
VALUES ('Moderadora General', 'moderador', 'moderador@foro.cl',
        '$2a$10$6XzFK48/qRE1NhawOQsmiuiaK2BGclgBpG8MbAlpjuIO1T3PkJmWS',
        (SELECT id_rol FROM roles WHERE nombre = 'MODERADOR'));

INSERT INTO usuarios (nombre, username, correo, password, id_rol)
VALUES ('Victor Gonzalez', 'victor', 'victor@correo.cl',
        '$2a$10$7QX8nipxIc364inLEyy1g.CpkmWE8aD4PKa6IxNMTeUCj1xb0nlcS',
        (SELECT id_rol FROM roles WHERE nombre = 'USUARIO'));

INSERT INTO usuarios (nombre, username, correo, password, id_rol)
VALUES ('Camila Rojas', 'camila', 'camila@correo.cl',
        '$2a$10$7QX8nipxIc364inLEyy1g.CpkmWE8aD4PKa6IxNMTeUCj1xb0nlcS',
        (SELECT id_rol FROM roles WHERE nombre = 'USUARIO'));

-- CATEGORIAS (6)
INSERT INTO categorias (nombre, descripcion) VALUES ('Tecnología y Programación', 'Lenguajes, frameworks, hardware y desarrollo de software');
INSERT INTO categorias (nombre, descripcion) VALUES ('Videojuegos',               'Novedades, reseñas y recomendaciones de videojuegos');
INSERT INTO categorias (nombre, descripcion) VALUES ('Juegos de Mesa',            'Reglas, estrategias y recomendaciones de juegos de mesa');
INSERT INTO categorias (nombre, descripcion) VALUES ('Cine y Series',             'Estrenos, críticas y teorías de películas y series');
INSERT INTO categorias (nombre, descripcion) VALUES ('Deportes',                  'Fútbol, básquetbol, tenis y todo lo deportivo');
INSERT INTO categorias (nombre, descripcion) VALUES ('Música',                    'Bandas, discos, conciertos e instrumentos');

-- TEMAS (6, uno de ellos baneado)
INSERT INTO temas (titulo, contenido, id_categoria, id_usuario)
VALUES ('¿Spring Boot o Node.js para microservicios?',
        'Estoy empezando un proyecto con microservicios y no sé si usar Spring Boot o Node.js. ¿Qué recomiendan?',
        (SELECT id_categoria FROM categorias WHERE nombre = 'Tecnología y Programación'),
        (SELECT id_usuario FROM usuarios WHERE username = 'victor'));

INSERT INTO temas (titulo, contenido, id_categoria, id_usuario)
VALUES ('Mejores juegos cooperativos para 2 jugadores',
        'Busco recomendaciones de juegos de mesa cooperativos para jugar en pareja. Ya tengo Pandemic.',
        (SELECT id_categoria FROM categorias WHERE nombre = 'Juegos de Mesa'),
        (SELECT id_usuario FROM usuarios WHERE username = 'camila'));

INSERT INTO temas (titulo, contenido, id_categoria, id_usuario)
VALUES ('Teorías sobre el final de la temporada',
        'Abro este tema para comentar teorías sobre el final de temporada. ¡Ojo con los spoilers!',
        (SELECT id_categoria FROM categorias WHERE nombre = 'Cine y Series'),
        (SELECT id_usuario FROM usuarios WHERE username = 'camila'));

INSERT INTO temas (titulo, contenido, id_categoria, id_usuario)
VALUES ('¿Qué videojuego indie recomiendan?',
        'Terminé Hollow Knight y busco otro indie con buena historia y dificultad.',
        (SELECT id_categoria FROM categorias WHERE nombre = 'Videojuegos'),
        (SELECT id_usuario FROM usuarios WHERE username = 'victor'));

INSERT INTO temas (titulo, contenido, id_categoria, id_usuario)
VALUES ('Normas de la categoría Deportes',
        'Recuerden mantener el respeto entre hinchas. Los mensajes ofensivos serán baneados.',
        (SELECT id_categoria FROM categorias WHERE nombre = 'Deportes'),
        (SELECT id_usuario FROM usuarios WHERE username = 'admin'));

INSERT INTO temas (titulo, contenido, estado, motivo_baneo, id_categoria, id_usuario)
VALUES ('VENDO CUENTAS BARATAS!!!',
        'Escríbanme por interno para comprar cuentas a muy buen precio.',
        'BANEADO', 'Spam / venta no permitida según las normas del foro',
        (SELECT id_categoria FROM categorias WHERE nombre = 'Música'),
        (SELECT id_usuario FROM usuarios WHERE username = 'camila'));

-- COMENTARIOS (6, uno de ellos baneado)
INSERT INTO comentarios (contenido, id_tema, id_usuario)
VALUES ('Spring Boot tiene un ecosistema muy completo: Spring Data JPA, Security, Actuator...',
        (SELECT id_tema FROM temas WHERE titulo LIKE '¿Spring Boot o Node.js%'),
        (SELECT id_usuario FROM usuarios WHERE username = 'camila'));

INSERT INTO comentarios (contenido, id_tema, id_usuario)
VALUES ('Si el equipo ya sabe Java, Spring Boot es la opción más segura.',
        (SELECT id_tema FROM temas WHERE titulo LIKE '¿Spring Boot o Node.js%'),
        (SELECT id_usuario FROM usuarios WHERE username = 'moderador'));

INSERT INTO comentarios (contenido, id_tema, id_usuario)
VALUES ('Prueben Forbidden Island, es corto y muy entretenido para dos.',
        (SELECT id_tema FROM temas WHERE titulo LIKE 'Mejores juegos cooperativos%'),
        (SELECT id_usuario FROM usuarios WHERE username = 'victor'));

INSERT INTO comentarios (contenido, id_tema, id_usuario)
VALUES ('Spirit Island también es cooperativo, aunque más complejo.',
        (SELECT id_tema FROM temas WHERE titulo LIKE 'Mejores juegos cooperativos%'),
        (SELECT id_usuario FROM usuarios WHERE username = 'admin'));

INSERT INTO comentarios (contenido, id_tema, id_usuario)
VALUES ('Celeste y Hades son excelentes opciones.',
        (SELECT id_tema FROM temas WHERE titulo LIKE '¿Qué videojuego indie%'),
        (SELECT id_usuario FROM usuarios WHERE username = 'camila'));

INSERT INTO comentarios (contenido, estado, motivo_baneo, id_tema, id_usuario)
VALUES ('Eres un ignorante, no sabes nada de series.',
        'BANEADO', 'Lenguaje ofensivo hacia otro usuario',
        (SELECT id_tema FROM temas WHERE titulo LIKE 'Teorías sobre el final%'),
        (SELECT id_usuario FROM usuarios WHERE username = 'victor'));

COMMIT;

