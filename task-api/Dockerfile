# Use an official, lightweight Node runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code into the container
COPY . .

# Expose the port your Express server listens on
EXPOSE 3000

# Define the command to start your backend
CMD ["node", "server.js"]
