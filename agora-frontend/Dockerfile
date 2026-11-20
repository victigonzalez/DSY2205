# ============================================================
# Ágora frontend — Dockerfile multi-etapa
# ------------------------------------------------------------
# ETAPA 1: Node compila Angular en modo producción.
# ETAPA 2: nginx sirve los archivos estáticos (imagen liviana, sin Node).
#
# Construir:  docker build -t <usuario-dockerhub>/agora-frontend:1.0 .
# Ejecutar:   docker run -p 8080:80 <usuario-dockerhub>/agora-frontend:1.0
# ============================================================
FROM node:24-alpine AS compilacion
WORKDIR /app
# Primero las dependencias: se reutiliza la caché si package*.json no cambia
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY angular.json tsconfig*.json ./
COPY public ./public
COPY src ./src
RUN npm run build -- --configuration production \
 && test -f dist/agora-frontend/browser/index.html

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compilacion /app/dist/agora-frontend/browser/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
