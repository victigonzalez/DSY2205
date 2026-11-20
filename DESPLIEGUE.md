# Despliegue de Ágora en la nube con Docker

El despliegue tiene dos partes:

1. **En tu PC:** construyes las 4 imágenes y las publicas en **Docker Hub**, que hace de *Container Registry*.
2. **En la nube:** en **Play with Docker** (Docker Playground) descargas esas imágenes y las ejecutas. Cada puerto publicado entrega una **URL pública**.

| Contenedor | Imagen | Puerto | Se prueba con |
|---|---|---|---|
| Frontend Angular (nginx) | `<usuario>/agora-frontend:1.0` | 8080 | Navegador |
| ms-usuarios | `<usuario>/agora-ms-usuarios:1.0` | 8081 | Postman |
| ms-foro | `<usuario>/agora-ms-foro:1.0` | 8082 | Postman |
| ms-moderacion | `<usuario>/agora-ms-moderacion:1.0` | 8083 | Postman |

Los microservicios se conectan a **Oracle Autonomous Database** con el Wallet, que se **monta como volumen**: nunca queda dentro de la imagen publicada. El frontend funciona por separado del backend, con datos en arreglos.

## Parte 1 — Construir y publicar las imágenes (en tu PC)

Requisitos: Docker Desktop abierto y una cuenta en [hub.docker.com](https://hub.docker.com).

```powershell
cd foro-backend
.\publicar-imagenes.ps1 -Usuario victigonzalez
```

El script hace `docker login`, `docker compose build` y `docker compose push`. Al terminar, las 4 imágenes aparecen en
`https://hub.docker.com/u/victigonzalez`. Si son privadas, cámbialas a **Public** desde Docker Hub
(Repository → Settings → Visibility), para que Play with Docker pueda descargarlas sin iniciar sesión.

**Prueba local opcional** antes de subir (necesitas `Wallet_foro/` y un `.env` con `DB_PASSWORD`, en la carpeta raíz):

```powershell
docker compose up -d
docker compose ps        # los 4 contenedores en "running"
# Frontend: http://localhost:8080   ·   APIs: http://localhost:8081/api/estado (y 8082, 8083)
docker compose down
```

## Parte 2 — Ejecutar en Play with Docker (nube, URL pública)

1. Entra a [labs.play-with-docker.com](https://labs.play-with-docker.com), presiona **Login** (con tu cuenta de Docker Hub) y luego **Start**.
2. Presiona **+ ADD NEW INSTANCE**. Se abre una terminal Linux con Docker. La sesión dura 4 horas.
3. **Sube los archivos** arrastrándolos a la terminal:
   - `docker-compose.pwd.yml`
   - el Wallet en zip, renombrado como `Wallet_foro.zip`
4. En la terminal:
   ```bash
   unzip Wallet_foro.zip -d Wallet_foro
   cat > .env <<'EOF'
   DOCKERHUB_USUARIO=victigonzalez
   DB_PASSWORD=TuPasswordDeAdmin
   EOF
   docker compose -f docker-compose.pwd.yml up -d
   docker compose -f docker-compose.pwd.yml ps
   docker compose -f docker-compose.pwd.yml logs -f ms-usuarios   # Ctrl+C para salir
   ```
5. Arriba de la terminal aparecen botones con los puertos **8080, 8081, 8082 y 8083**. Si no aparecen, usa **OPEN PORT** y escribe el número. Cada uno abre una **URL pública** como
   `http://ip172-18-0-12-xxxxxxxx-8080.direct.labs.play-with-docker.com`.
6. **Frontend:** abre la URL del puerto 8080.
7. **Backend en Postman:** en la colección, cambia las variables `baseUsuarios`, `baseForo` y `baseModeracion` por las URLs de los puertos 8081, 8082 y 8083, sin `/` al final. Ejecuta la colección con el Runner.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `pull access denied` | La imagen es privada o el usuario de Docker Hub está mal escrito en `.env` |
| `ORA-01017` en los logs | La contraseña de ADMIN en `.env` es incorrecta |
| `IO Error` o `TNS` en los logs | Falta la carpeta `Wallet_foro` o el zip quedó con otra carpeta adentro. Revisa con `ls Wallet_foro`: debe mostrar `tnsnames.ora` |
| Cuelga y termina en `timeout` | La base Oracle está detenida: inicia la base en Oracle Cloud |
| El puerto no responde enseguida | Spring Boot tarda unos 20 a 40 segundos en arrancar; mira `docker compose ... logs` |
