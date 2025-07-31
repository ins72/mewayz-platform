FROM node:18-alpine

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy project files
COPY . .

# Build the application (skip database operations during build)
RUN npm run build-ci

# Expose port
EXPOSE 4002

# Start the application
CMD ["npm", "start"]
