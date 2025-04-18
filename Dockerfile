FROM node:16 AS builder

WORKDIR /app

# Copy everything and install + build
COPY . .
RUN yarn install
RUN yarn build

# ------------------------------

FROM node:16 AS runner

# Install `serve` to serve the build folder
RUN yarn global add serve

# Set working directory
WORKDIR /app

# Copy only the built extension output
COPY --from=builder /app/packages/extension/build ./build

# Expose port
EXPOSE 3000

# Serve the build folder
CMD ["serve", "-s", "build", "-l", "3000"]
