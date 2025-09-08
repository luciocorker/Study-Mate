# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package file
COPY package-backend.json package.json

# Install only backend dependencies
RUN npm install

# Copy only the server file
COPY server.js ./

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
