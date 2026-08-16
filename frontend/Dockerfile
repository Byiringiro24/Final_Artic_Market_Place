FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Use npm install (not ci) to handle lock file differences
RUN npm install --ignore-scripts --legacy-peer-deps

# Copy source
COPY . .

# Copy production env for build
COPY .env.production .env.local

ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "start"]
