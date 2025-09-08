# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package file
COPY package-backend.json package.json

# Install backend dependencies
RUN npm install

# Copy only the server file
COPY server.js ./

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
