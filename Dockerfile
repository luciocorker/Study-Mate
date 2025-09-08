# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using npm
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
