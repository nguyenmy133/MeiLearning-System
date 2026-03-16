# ============================================================================
# MeiLearning Backend — Multi-stage Docker Build
# ============================================================================

# ── Stage 1: Build ─────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

# Cache Maven dependencies
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# Fix line endings (CRLF -> LF) and make executable
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw dependency:go-offline -B

# Build application
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# ── Stage 2: Run ───────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built artifact — backend-0.0.1-SNAPSHOT.jar is the main one
COPY --from=builder /build/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
