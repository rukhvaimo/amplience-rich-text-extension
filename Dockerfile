# ---- Build Stage ----
FROM node:16-alpine AS build
WORKDIR /usr/src/app

# Install build dependencies: Python, make, g++, git, bash
RUN apk add --no-cache python3 make g++ git bash

# Copy necessary configuration and dependency files, including TypeScript configs
COPY package*.json yarn.lock lerna.json tsconfig*.json ./
COPY packages ./packages
COPY bash ./bash

# Install dependencies across all workspaces using Yarn and Lerna
RUN yarn install

# Replace 'trash build test dist' with 'rm -rf build test dist' in all package.json files to avoid directory errors
RUN find . -type f -name "package.json" -exec sed -i 's/"trash build test dist"/"rm -rf build test dist"/g' {} +

# Build all packages using Lerna
RUN yarn build

# ---- Runtime Stage ----
FROM node:16-alpine
WORKDIR /usr/src/app

# Install runtime dependencies
RUN apk add --no-cache bash

# Copy the entire application (including build outputs) from the build stage
COPY --from=build /usr/src/app ./

# If your application listens on a specific port, uncomment and adjust the line below:
# EXPOSE <port_number>

# Start the application using the custom start script defined in package.json
CMD ["yarn", "start"]
