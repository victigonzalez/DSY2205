# ============================================================
# Dockerfile multi-etapa (generado con foro-microservicio-archetype)
# ------------------------------------------------------------
# ETAPA 1: Maven + JDK 17 compilan el proyecto.
# ETAPA 2: solo el JRE 17 y el JAR (imagen liviana, sin código fuente).
#
# Construir:  docker build -t <usuario-dockerhub>/<microservicio>:1.0 .
# Ejecutar con Oracle Cloud (el Wallet se MONTA, no se copia a la imagen):
#   docker run -p <puerto>:<puerto> -v ./Wallet_foro:/wallet:ro \
#     -e DB_WALLET=/wallet -e DB_PASSWORD=*** <imagen>
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS compilacion
WORKDIR /fuentes
# Copiar primero el pom aprovecha la caché de dependencias entre builds
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY src ./src
# Los tests se ejecutan aparte (mvn test); aquí solo se empaqueta
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
# Usuario sin privilegios de administrador dentro del contenedor
RUN useradd --system --uid 1001 foro
COPY --from=compilacion /fuentes/target/*.jar app.jar
USER foro
# Dentro de Docker el Wallet se monta en /wallet
ENV DB_WALLET=/wallet
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
