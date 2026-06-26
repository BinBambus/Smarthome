# 1. Build with Bun
FROM oven/bun:1-alpine AS build
WORKDIR /app
COPY ./Frontend/package.json ./Frontend/bun.lockb* ./Frontend/bun.lock* ./
RUN bun install --frozen-lockfile
COPY ./Frontend .
RUN bun run build

# 2. Stage: Rollout with Caddy
FROM caddy:alpine
COPY --from=build /app/dist /usr/share/caddy
COPY ./Frontend/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443