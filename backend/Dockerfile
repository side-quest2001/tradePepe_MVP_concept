FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
COPY tests ./tests
EXPOSE 3000
CMD ["npm", "run", "docker:dev"]
