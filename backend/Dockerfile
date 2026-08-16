FROM node:20-alpine
WORKDIR /app

# Install OpenSSL 1.1 compatibility required by Prisma engine
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install --ignore-scripts

# Copy all source files
COPY . .

# Generate Prisma client (targeting linux-musl with openssl-1.1)
RUN npx prisma generate

# Create runtime directories
RUN mkdir -p uploads logs

EXPOSE 5010

# Run with tsx — no TypeScript compilation needed
CMD ["npx", "tsx", "src/server.ts"]
