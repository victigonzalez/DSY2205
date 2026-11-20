# ms-moderacion

Microservicio **Moderacion** del Foro en Línea, generado con `foro-microservicio-archetype`.


```
src/main/java/cl/duoc/foro/moderacion/
├── MsModeracionApplication.java   ← punto de entrada
├── config/CorsConfig.java          ← CORS (app.cors.origenes)
├── controller/EstadoController.java← GET /api/estado (diagnóstico)
└── exception/
    ├── ErrorResponse.java          ← contrato JSON de errores
    ├── ErrorResponseBuilder.java   ← patrón BUILDER
    ├── NegocioException.java       ← errores de negocio con su código HTTP
    └── GlobalExceptionHandler.java ← @RestControllerAdvice
```

Agrega la lógica de negocio en `model/`, `repository/`, `dto/`, `service/` y `controller/`.


- Puerto por defecto: **8083**. Se puede cambiar con la variable `SERVER_PORT`.
- Perfil `oracle` (por defecto): `DB_PASSWORD=*** mvn spring-boot:run`
- Perfil `local` (H2): `mvn spring-boot:run -Dspring-boot.run.profiles=local`
- Docker: `docker build -t ms-moderacion .` (ver el encabezado del `Dockerfile`)
