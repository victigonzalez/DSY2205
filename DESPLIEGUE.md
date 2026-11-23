# Ejecución de Ágora con Docker (Docker Desktop)

Los 4 componentes corren en contenedores Docker, construidos y orquestados con **Docker Compose**.
Según lo indicado por el docente, se acepta la ejecución local con Docker Desktop, sin publicar las imágenes en un registro ni desplegarlas en una URL pública.

| Contenedor | Imagen | Puerto | Se prueba con |
|---|---|---|---|
| `agora-frontend` | `agora-frontend:1.0` (Angular servido por nginx) | 8080 | Navegador: http://localhost:8080 |
| `agora-ms-usuarios` | `agora-ms-usuarios:1.0` | 8081 | Postman |
| `agora-ms-foro` | `agora-ms-foro:1.0` | 8082 | Postman |
| `agora-ms-moderacion` | `agora-ms-moderacion:1.0` | 8083 | Postman |

Cómo están armados:
- **Microservicios:** cada imagen es **multi-etapa**. Maven y el JDK 17 compilan, y la imagen final lleva solo el JRE 17 y el JAR. Se ejecuta con un usuario sin privilegios.
- **Oracle:** los microservicios se conectan a **Oracle Autonomous Database** con el Wallet, que se **monta como volumen de solo lectura**. Nunca queda copiado dentro de la imagen.
- **Frontend:** Node compila Angular y nginx sirve los archivos, redirigiendo las rutas de Angular a `index.html`. Funciona por separado del backend, con datos en arreglos.

## Requisitos

- Docker Desktop abierto.
- En la carpeta raíz del repositorio:
  - `Wallet_foro/`: el Wallet descomprimido. Está en `.gitignore`.
  - `.env`: copia de `.env.example` con `DB_PASSWORD=<contraseña de ADMIN>`. También está en `.gitignore`.

## Comandos

```powershell
docker compose up --build -d     # construye las 4 imágenes y levanta los contenedores
docker compose ps                # los 4 deben aparecer en estado "running" / "Up"
docker compose logs -f ms-usuarios   # ver el log (Ctrl+C para salir)
docker compose down              # detener y eliminar los contenedores
```

La primera construcción tarda unos minutos, porque descarga las dependencias de Maven y npm. Las siguientes usan la caché.

## Verificación

1. `http://localhost:8081/api/estado`, `:8082/api/estado` y `:8083/api/estado` responden `"estado": "ACTIVO"` y `"perfiles": ["oracle"]`.
2. `http://localhost:8080` muestra el frontend Ágora. Si recargas una ruta interna, como `/temas/3`, también funciona.
3. En Postman, la colección `postman/Foro_Microservicios.postman_collection.json` (Runner) da **56 peticiones y 142 validaciones** en verde, contra Oracle Cloud.
4. En Docker Desktop, en la sección **Containers**, aparece el grupo `agora` con los 4 contenedores.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `DB_PASSWORD` no definida al ejecutar `up` | Falta el archivo `.env` en la carpeta raíz |
| `ORA-01017` en los logs | La contraseña de ADMIN en `.env` es incorrecta |
| `IO Error` o `TNS` en los logs | `Wallet_foro/` no está en la carpeta raíz, o quedó con otra carpeta adentro. Debe contener `tnsnames.ora` directamente |
| Cuelga y termina en `timeout` | La base Oracle está detenida: iníciala en Oracle Cloud |
| `port is already allocated` | Hay otro programa usando el puerto, por ejemplo un microservicio levantado con `mvnw`. Detenlo o ejecuta `docker compose down` |
