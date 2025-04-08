# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

RUN npm install -g yarn@1.22.22

# Copy package and lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["yarn", "dev"]