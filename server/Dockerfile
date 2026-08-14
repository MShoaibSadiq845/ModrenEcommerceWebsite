FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm install
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
# Cache-bust: force full rebuild every deploy
ARG CACHEBUST=20260814111645
RUN npm run build
RUN npm prune --production

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
