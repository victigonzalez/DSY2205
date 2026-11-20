# ============================================================
# Instala el arquetipo y genera un microservicio nuevo a partir de él.
# Uso (desde la carpeta raíz del repositorio):
#   .\arquetipo\generar-microservicio.ps1 -Nombre ms-ejemplo -Servicio Ejemplo -Puerto 8090
# Requisitos: Java 17+ y Maven (mvn) en el PATH.
# ============================================================
param(
    [Parameter(Mandatory = $true)][string]$Nombre,     # artifactId, ej: ms-moderacion
    [Parameter(Mandatory = $true)][string]$Servicio,   # PascalCase, ej: Moderacion
    [int]$Puerto = 8080
)
$ErrorActionPreference = 'Stop'

$raiz = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$arquetipo = Join-Path $PSScriptRoot 'foro-microservicio-archetype'
$paquete = 'cl.duoc.foro.' + $Servicio.ToLower()

if (Test-Path (Join-Path $raiz $Nombre)) { throw "Ya existe la carpeta $Nombre. No se sobrescribe." }

Write-Host '1) Instalando el arquetipo en el repositorio Maven local...' -ForegroundColor Cyan
& mvn -B -q -f (Join-Path $arquetipo 'pom.xml') clean install
if ($LASTEXITCODE -ne 0) { throw 'Falló la instalación del arquetipo.' }

Write-Host "2) Generando $Nombre (paquete $paquete, puerto $Puerto)..." -ForegroundColor Cyan
Push-Location $raiz
try {
    & mvn -B -q archetype:generate `
        '-DarchetypeGroupId=cl.duoc.foro' `
        '-DarchetypeArtifactId=foro-microservicio-archetype' `
        '-DarchetypeVersion=1.0.0' `
        '-DgroupId=cl.duoc.foro' `
        "-DartifactId=$Nombre" `
        '-Dversion=1.0.0' `
        "-Dpackage=$paquete" `
        "-Dservicio=$Servicio" `
        "-Dpuerto=$Puerto" `
        '-DinteractiveMode=false'
    if ($LASTEXITCODE -ne 0) { throw 'Falló la generación del microservicio.' }
} finally { Pop-Location }

Write-Host "Listo: $raiz\$Nombre" -ForegroundColor Green
Write-Host "Probar: cd $Nombre ; mvn test"
