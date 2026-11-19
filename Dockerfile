# vidalstore-frontend (E3): una sola imagen con el Angular compilado y Caddy, que lo sirve.
# En gw-azure corre con network_mode: host y el volumen /data (certificados de Let's Encrypt);
# Caddy sirve las rutas de Angular con try_files y pasa /v1/* al gateway en 127.0.0.1:8080.
# En el compose local de vidalstore-plataforma, sin DOMINIO, sirve HTTP en el 80 del contenedor.

# Etapa 1: compila Angular con las dependencias de desarrollo
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Caddy sirve lo compilado
FROM caddy:2
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist/vidalstore-frontend/browser/ /srv/
EXPOSE 80
