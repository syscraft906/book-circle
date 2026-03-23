FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts* ./
RUN npm ci --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# Dummy DATABASE_URL satisfies the env check at build time
# Real URL is injected at runtime via Kubernetes secret
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV NEXTAUTH_URL="https://book-circle.syscraft906.dev"
ENV NEXTAUTH_SECRET="build-placeholder"
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000
# Real env vars injected here at runtime by Kubernetes
CMD ["node", "server.js"]
