# Build backend
FROM gradle:8.5-jdk17 AS backend-build
WORKDIR /app
COPY . .

# Run tests with MySQL database
ENV SPRING_PROFILES_ACTIVE=test
ENV MYSQL_HOST=points-list-db
ENV MYSQL_USERNAME=
ENV MYSQL_PASSWORD=
ENV MYSQL_PORT=3306


# Build without tests (since we already ran them)
RUN gradle build -x test

# Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/react-files/package*.json ./
RUN npm install
COPY frontend/react-files/ .
RUN npm run build

# Final stage
FROM openjdk:17-slim
WORKDIR /app

# Copy backend artifacts
COPY --from=backend-build /app/build/libs/*.jar ./app.jar

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=docker
ENV SERVER_PORT=8080
ENV MYSQL_HOST=points-list-db
ENV MYSQL_USERNAME=root
ENV MYSQL_PASSWORD=rootadmin
ENV FRONTEND_URL=http://points-list-frontend:3000

# Expose the port your application runs on
EXPOSE 8080

# Command to run the application
CMD ["java", "-jar", "app.jar"] 