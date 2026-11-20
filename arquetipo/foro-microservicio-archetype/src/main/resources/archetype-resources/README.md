# ${artifactId}

Microservicio **${servicio}** del Foro en Línea, generado con `foro-microservicio-archetype`.

## Estructura generada

```
src/main/java/${package.replace('.', '/')}/
├── Ms${servicio}Application.java   ← punto de entrada
├── config/CorsConfig.java          ← CORS (app.cors.origenes)
├── controller/EstadoController.java← GET /api/estado (diagnóstico)
└── exception/
    ├── ErrorResponse.java          ← contrato JSON de errores
    ├── ErrorResponseBuilder.java   ← patrón BUILDER
    ├── NegocioException.java       ← errores de negocio con su código HTTP
    └── GlobalExceptionHandler.java ← @RestControllerAdvice
```

Agrega la lógica de negocio en `model/`, `repository/`, `dto/`, `service/` y `controller/`.

## Ejecutar

- Puerto por defecto: **${puerto}**. Se puede cambiar con la variable `SERVER_PORT`.
- Perfil `oracle` (por defecto): `DB_PASSWORD=*** mvn spring-boot:run`
- Perfil `local` (H2): `mvn spring-boot:run -Dspring-boot.run.profiles=local`
- Docker: `docker build -t ${artifactId} .` (ver el encabezado del `Dockerfile`)
