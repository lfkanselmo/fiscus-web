FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG API_BASE_URL=http://localhost:8000/api/v1
RUN printf "export const environment = { apiBaseUrl: '%s' };\n" "$API_BASE_URL" \
    > src/environments/environment.prod.ts

RUN npm run build

FROM nginx:alpine

ARG API_BASE_URL=http://localhost:8000/api/v1

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN API_ORIGIN=$(printf '%s' "$API_BASE_URL" | sed -E 's#^(https?://[^/]+).*#\1#') \
    && sed -i "s#__API_ORIGIN__#${API_ORIGIN}#" /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/fiscus-web/browser /usr/share/nginx/html

EXPOSE 80
