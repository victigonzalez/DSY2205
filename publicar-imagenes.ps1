# ============================================================
# Construye las 4 imágenes y las publica en Docker Hub (Container Registry).
# Uso (PowerShell, en la carpeta raíz del repositorio, con Docker Desktop abierto):
#   .\publicar-imagenes.ps1 -Usuario victigonzalez
# ============================================================
param([Parameter(Mandatory = $true)][string]$Usuario)
$ErrorActionPreference = 'Stop'
$env:DOCKERHUB_USUARIO = $Usuario
# Para construir no se necesita la contraseña real de Oracle (solo al ejecutar).
if (-not $env:DB_PASSWORD) { $env:DB_PASSWORD = 'solo-para-construir' }

Write-Host '1) Iniciando sesión en Docker Hub...' -ForegroundColor Cyan
docker login -u $Usuario
if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar sesión en Docker Hub.' }

Write-Host '2) Construyendo imágenes (puede tardar varios minutos la primera vez)...' -ForegroundColor Cyan
docker compose build
if ($LASTEXITCODE -ne 0) { throw 'Falló la construcción de las imágenes.' }

Write-Host '3) Publicando en Docker Hub...' -ForegroundColor Cyan
docker compose push
if ($LASTEXITCODE -ne 0) { throw 'Falló la publicación de las imágenes.' }

Write-Host "Listo. Imágenes publicadas en https://hub.docker.com/u/$Usuario" -ForegroundColor Green
docker images "$Usuario/agora-*"
