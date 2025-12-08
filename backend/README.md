# VNest Backend

Spring Boot REST API for the VNest Finnish speech therapy application, providing word management, grammar validation, and admin UI capabilities.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Building and Running](#building-and-running)
- [Testing](#testing)
- [Database](#database)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Admin UI](#admin-ui)
- [Development Workflow](#development-workflow)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

## Overview

The VNest backend is a Spring Boot application that provides:
- RESTful API for Verb Network Strengthening Treatment
- Admin UI for content management
- PostgreSQL database with Flyway migrations
- Spring Security with form-based authentication

## Prerequisites

- **Java 17** 
- **PostgreSQL 15+** (or use Docker Compose)
- **Gradle 8+** (wrapper included)

## Environment Configuration

Create a `.env` file in the `backend/` or to the root directory, depending if you want to run also frontend, with the following variables:

```env
# Database Configuration
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=database

# Session Configuration
SERVER_SERVLET_SESSION_TIMEOUT=30m

# User Accounts (semicolon-separated)
# Format: email:password:displayName:ROLE;email:password:displayName:ROLE
APP_USERS=admin@example.com:VerySecurePassword123!:Admin:ADMIN;user@example.com:AnotherSecurePass456!:User:USER

# CORS Configuration (comma-separated origins)
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19002

# CSV Data Import (optional - defaults shown)
# APP_DATA_CSV_ENABLED=true
# APP_DATA_CSV_PATH=data/initial_combinations.csv
```

**Important Notes:**
- `APP_USERS` defines user accounts that can login to the admin UI
- Passwords must be strong (will be BCrypt encoded with strength 12)
- Multiple users can be separated by semicolons
- The `ROLE` field should be `ADMIN` for admin UI access
- `CORS_ALLOWED_ORIGINS` controls which frontend origins can access the API
- `APP_DATA_CSV_ENABLED` controls automatic CSV import on startup (default: true)
- `APP_DATA_CSV_PATH` specifies the CSV file location (default: data/initial_combinations.csv)

## Building and Running

### Using Docker Compose (Recommended)

From the project root or from the `backend/` directory in case you want to run only backend:
```bash
docker compose up --build -d
```

This starts all services (backend, PostgreSQL (frontend)).

### Running Locally

1. **Start PostgreSQL** (ensure it's running and accessible)

2. **Build the project:**
```bash
./gradlew build
```

3. **Run the application:**
```bash
./gradlew bootRun
```

The API will be available at `http://localhost:8080`

### Other Gradle Commands

```bash
# Clean build artifacts
./gradlew clean

# Build without tests
./gradlew build -x test

# Run static analysis (SpotBugs)
./gradlew spotbugsMain

# Run all checks (tests + SpotBugs)
./gradlew check
```

## Testing

### Running Tests

```bash
# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests WordServiceTest

# Run specific test method
./gradlew test --tests WordServiceTest.testSpecificMethod

# Run tests with coverage report (coverage report is auto-generated after tests)
./gradlew test

# Generate coverage report manually
./gradlew jacocoTestReport

# Verify coverage meets minimum threshold (70%)
./gradlew jacocoTestCoverageVerification
```

### Test Reports

After running tests, view the reports:

**Test Results:**
```
build/reports/tests/test/index.html
```

**Coverage Report:**
```
build/reports/jacoco/test/html/index.html
```

## Database

### Technology Stack
- **PostgreSQL 15+**
- **Flyway** for schema migrations
- **Spring Data JPA** for ORM

### Main Tables
- `word`: Stores Finnish words (subjects, verbs, objects)
- `word_group`: Word groups/categories for organizing verbs
- `allowed_combination`: Valid grammar combinations (SUBJECT-Verb-OBJECT)
- `users`: Admin user accounts

### CSV Data Import

On first startup (when the database is empty), the application automatically imports Finnish word combinations from a CSV file.

**Default CSV File:** `src/main/resources/data/initial_combinations.csv`

**CSV Format:**
```csv
SUBJECT,VERB,OBJECT
koira,SAADA,luu
mies,LUKEA,sanomalehti
lapsi,PELÄTÄ,pimeä
```

**How It Works:**
1. `DataInitializer.java` runs after application startup
2. Checks if `allowed_combination` table is empty
3. Reads CSV file from classpath
4. Creates unique words (avoiding duplicates)
5. Creates all word combinations
6. Logs import summary

**Configuration:**
```env
# Disable CSV import
APP_DATA_CSV_ENABLED=false

# Use custom CSV file
APP_DATA_CSV_PATH=data/custom_words.csv
```

**Custom CSV Files:**
- Place CSV files in `src/main/resources/data/`
- Use comma-separated format with header row
- Three columns: SUBJECT, VERB, OBJECT
- Words are automatically deduplicated by text and type

### Migrations

Flyway migrations are located in `src/main/resources/migrations/`:

```
V1__Initial_schema_setup.sql
V2__create_users_table.sql
V3__add_groups_table.sql
...
```

**Migration Rules:**
- Migrations run automatically on startup
- Use sequential versioning (V1, V2, V3...)
- Never modify existing migrations
- Use descriptive names with double underscore: `V{number}__{description}.sql`

## Architecture

### Layer Responsibilities

1. **Controllers**: Handle HTTP requests, validate input, return responses
2. **Services**: Business logic, transaction management
3. **Repositories**: Data access via Spring Data JPA
4. **Models**: JPA entities mapped to database tables
5. **DTOs**: Data transfer objects for API contracts

## API Documentation

The API is fully documented using **OpenAPI 3.0** (Swagger). The documentation is automatically generated from code annotations and stays up-to-date with the implementation.

### Interactive API Documentation (Swagger UI)

Access the interactive API documentation at:
```
http://localhost:8080/swagger-ui.html
```

**Features:**
- Browse all available endpoints
- View request/response schemas
- Test endpoints directly from the browser
- See example requests and responses
- Download OpenAPI specification

### OpenAPI Specification

The OpenAPI specification is available in JSON format:
```
http://localhost:8080/v3/api-docs
```

**Frontend Integration:**
- Use the OpenAPI spec to generate TypeScript types
- Generate API client libraries automatically
- Ensure frontend stays in sync with backend API changes

## Security

### Authentication Method
- **Form-based authentication** for admin UI
- **Session-based** with remember-me support
- **BCrypt password encoding** (strength 12)

### Configuration

Security is configured in `config/SecurityConfig.java`:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // Form login for admin UI
    // Public access to /api/** (GET requests)
    // Public access to /v3/api-docs/**, /swagger-ui/** (OpenAPI documentation)
    // ADMIN role required for admin endpoints
}
```

### User Management

Users are configured via the `APP_USERS` environment variable:
```
email:password:displayName:ROLE;email:password:displayName:ROLE
```

Users are automatically created on startup by `UserInitializer.java`.

### Security Features
- CSRF protection enabled
- Session fixation protection
- BCrypt password hashing
- Remember-me authentication
- Logout with session invalidation

## Admin UI

### Accessing the Admin UI

1. Start the backend application
2. Navigate to `http://localhost:8080/login`
3. Log in with credentials from `APP_USERS` environment variable

**Note**: Users need to have ADMIN role to access and edit words and combinations.

### Features

The admin UI provides:
- **Word Management**: Create, read, update, delete Finnish words
- **Combination Management**: Define and view valid Subject-Verb-Object combinations
- **Type-based Filtering**: View words by type (SUBJECT, VERB, OBJECT)

### Technology

- **Thymeleaf** templates for server-side rendering
- **Bootstrap** for responsive UI
- Served from root path (`/`) after authentication

## Development Workflow

### Adding New API Endpoints

When creating new REST API endpoints, add OpenAPI annotations to automatically update the documentation:

```java
@RestController
@RequestMapping("/api/example")
@Tag(name = "Example", description = "Example API endpoints")
public class ExampleController {

    @Operation(
        summary = "Get example data",
        description = "Detailed description of what this endpoint does"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Success response",
        content = @Content(schema = @Schema(implementation = YourResponseDto.class))
    )
    @GetMapping
    public ResponseEntity<YourResponseDto> getExample(
        @Parameter(description = "Parameter description", example = "exampleValue")
        @RequestParam String param) {
        // Implementation
    }
}
```

See `WordController.java` for a complete example.

### Code Quality

```bash
# Run static analysis
./gradlew spotbugsMain

# Check all quality gates
./gradlew check
```

## CI/CD

### GitHub Actions

CI pipeline (`.github/workflows/ci.yml`) runs on:
- Push to `main` branch
- Pull requests affecting `backend/**`

**Pipeline Steps:**
1. Checkout code
2. Set up Java 17 (Temurin)
3. Cache Gradle dependencies
4. Run tests: `./gradlew clean test`
5. Generate coverage report: `./gradlew jacocoTestReport`
6. Upload coverage report as artifact (retained for 30 days)
7. Run static analysis: `./gradlew spotbugsMain`
8. Security scan with Trivy (CRITICAL severity only)

## Troubleshooting

### Common Issues

**Database Connection Errors:**
- Verify PostgreSQL is running
- Check `.env` file configuration

**Port Already in Use:**
```bash
# Find process using port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080                  # macOS/Linux

# Kill the process or change port in application.properties
```

**Flyway Migration Failures:**
- Check migration file syntax
- Verify migration version sequence

**CSV Import Not Working:**
- Check that `APP_DATA_CSV_ENABLED` is not set to `false`
- Verify CSV file exists at the specified path
- Check application logs for import errors
- Ensure database is empty (CSV only imports if `allowed_combination` table has no data)
- To re-import: drop tables or use `docker compose down -v` and restart

**CORS Errors from Frontend:**
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check that the origin matches exactly (including protocol and port)
- Example: `http://195.148.20.75:8081` (not `https` or different port)
- Restart backend after changing CORS configuration
