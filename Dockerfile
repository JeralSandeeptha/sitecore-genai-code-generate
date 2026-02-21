# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install -g npm@latest
RUN npm ci
RUN npm run build

# Stage 2: Run with PM2
FROM node:20-alpine AS runner

WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install -g pm2 npm@latest
RUN npm install tsx --global
RUN npm ci --production
COPY --from=builder /app/src ./src

EXPOSE 5004

CMD [ "npm", "run", "start" ]