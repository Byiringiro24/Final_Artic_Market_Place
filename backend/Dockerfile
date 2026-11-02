FROM node:24-alpine
WORKDIR /app

# Install OpenSSL 1.1 compatibility required by Prisma engine
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install --ignore-scripts

# Copy application source without host credentials or local build artifacts
COPY . .

# Generate Prisma client and compile the API without requiring build-time secrets
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public" npm run build

# Create runtime directories
RUN mkdir -p uploads logs

EXPOSE 5000

# Apply pending schema changes and start the compiled API
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
