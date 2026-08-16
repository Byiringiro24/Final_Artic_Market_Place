FROM node:20-alpine
WORKDIR /app

# Install dependencies (including dev for tsx)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create runtime directories
RUN mkdir -p uploads logs

EXPOSE 5010

# Run directly with tsx (no compilation needed)
CMD ["npx", "tsx", "src/server.ts"]
