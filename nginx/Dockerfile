FROM node:20-alpine AS frontend-build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:1.27-alpine
ARG NGINX_CONF=default.conf
COPY nginx/${NGINX_CONF} /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html
