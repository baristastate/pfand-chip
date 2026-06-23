FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

# Workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY apps/booking/package.json ./apps/booking/

RUN pnpm install --frozen-lockfile

COPY packages/database/ ./packages/database/
COPY apps/booking/ ./apps/booking/

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_AI_SERVICE_URL

RUN pnpm --filter @pfand-chip/booking build

FROM nginx:alpine
COPY --from=builder /app/apps/booking/dist /usr/share/nginx/html
COPY apps/booking/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
