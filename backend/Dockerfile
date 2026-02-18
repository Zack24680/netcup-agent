FROM node:20-slim

# better-sqlite3 requires build tools
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src/ ./src/

# Data directory for SQLite DB
RUN mkdir -p /app/data

EXPOSE 4000

CMD ["node", "src/app.js"]
