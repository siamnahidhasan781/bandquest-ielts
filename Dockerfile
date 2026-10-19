# BandQuest IELTS — production image
# Build:  docker build -t bandquest-ielts .
# Run:    docker run -d -p 3000:3000 \
#           -e JWT_SECRET="<openssl rand -base64 32>" \
#           -e GEMINI_API_KEY="<your key>" \
#           -e PUBLIC_APP_URL="https://your-domain.com" \
#           -v bandquest-data:/app/data \
#           --name bandquest bandquest-ielts
# The /app/data volume is what keeps the SQLite database (users, progress)
# alive across restarts — do not skip it.

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/app ./app
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
VOLUME ["/app/data"]
USER nextjs
EXPOSE 3000
# Seed is idempotent (INSERT OR REPLACE/IGNORE) — safe on every start.
CMD ["sh", "-c", "npx tsx src/lib/db/seed.ts && npx next start -p ${PORT:-3000} -H 0.0.0.0"]
