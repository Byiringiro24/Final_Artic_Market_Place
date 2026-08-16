FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Use npm install (not ci) to handle lock file differences
RUN npm install --ignore-scripts

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create runtime directories
RUN mkdir -p uploads logs

EXPOSE 5010

# Run with tsx — no TypeScript compilation needed
CMD ["npx", "tsx", "src/server.ts"]
