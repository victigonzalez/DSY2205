# Arquetipo Maven — `foro-microservicio-archetype`

El arquetipo es la **plantilla** desde la que se generan los microservicios del Foro en Línea.
Garantiza que todos tengan la misma estructura, configuración y buenas prácticas desde el primer momento.

| Qué entrega el arquetipo | Archivo generado |
|---|---|
| Clase principal Spring Boot | `Ms<Servicio>Application.java` |
| **Patrón Builder** para las respuestas de error | `exception/ErrorResponseBuilder.java` |
| Contrato JSON de errores y manejo global (`@RestControllerAdvice`) | `exception/ErrorResponse.java`, `GlobalExceptionHandler.java` |
| Errores de negocio con su código HTTP (404, 409, 401, 403, 410) | `exception/NegocioException.java` |
| CORS configurable | `config/CorsConfig.java` |
| Endpoint de diagnóstico `GET /api/estado` | `controller/EstadoController.java` |
| Perfiles `oracle` (Wallet) y `local` (H2 en modo Oracle) | `application*.properties` |
| Imagen Docker multi-etapa y `.dockerignore` | `Dockerfile` |
| Pruebas del Builder y del arranque | `ErrorResponseBuilderTest`, `EstadoControllerTest` |
| Dependencias: Web, JPA, Validation, Actuator, ojdbc11 + oraclepki, H2, Lombok | `pom.xml` |

## 1. Instalar el arquetipo en el repositorio Maven local

```bash
cd arquetipo/foro-microservicio-archetype
mvn clean install
```

## 2. Generar un microservicio nuevo

Desde la carpeta raíz del repositorio:

```bash
mvn archetype:generate \
  -DarchetypeGroupId=cl.duoc.foro \
  -DarchetypeArtifactId=foro-microservicio-archetype \
  -DarchetypeVersion=1.0.0 \
  -DgroupId=cl.duoc.foro \
  -DartifactId=ms-moderacion \
  -Dversion=1.0.0 \
  -Dpackage=cl.duoc.foro.moderacion \
  -Dservicio=Moderacion \
  -Dpuerto=8083 \
  -DinteractiveMode=false
```

En PowerShell, cada `-D...` debe ir entre comillas simples (por ejemplo `'-Dpuerto=8083'`), y la línea se continúa con un acento grave (`` ` ``) en vez de `\`.

## Microservicios del foro y el arquetipo

| Microservicio | Puerto | Relación con el arquetipo |
|---|---|---|
| `ms-moderacion` | 8083 | **Generado** con `archetype:generate` |
| `ms-usuarios` | 8081 | Existía desde la Semana 2. Se **alineó** al arquetipo: mismos paquetes `config` y `exception`, Builder, `/api/estado` y Dockerfile |
| `ms-foro` | 8082 | Igual que `ms-usuarios` |
