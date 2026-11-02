FROM node:24-alpine
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

# Public Stripe configuration is supplied by the VPS Compose build args.
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Build Next.js
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "start"]
