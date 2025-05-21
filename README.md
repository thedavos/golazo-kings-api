# Golazo Kings API

A NestJS-based backend API for managing sports league data, focusing on entities like leagues (e.g., Kings League, Queens League), teams, players, and presidents. It provides CRUD operations, image management via Backblaze B2, and scraping capabilities to fetch data from official league websites.

## Features

*   **Comprehensive API:** CRUD operations for leagues, teams, players, and presidents.
*   **Image Management:** Upload and manage images with Backblaze B2 integration.
*   **Data Scraping:** Scrapes team and player data from official Kings League and Queens League websites.
*   **API Documentation:** Detailed API documentation available via Swagger.
*   **Configuration:** Environment-based configuration for flexibility across different setups (development, production).
*   **Database Migrations:** Uses TypeORM for managing database schema and migrations.

## Technologies Used

*   **Backend Framework:** [NestJS](https://nestjs.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Database:** [MySQL](https://www.mysql.com/)
*   **ORM:** [TypeORM](https://typeorm.io/)
*   **Containerization:** [Docker](https://www.docker.com/) & Docker Compose
*   **API Documentation:** [Swagger (OpenAPI)](https://swagger.io/)
*   **File Storage:** [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html)
*   **Package Manager:** [pnpm](https://pnpm.io/)
*   **Linting/Formatting:** ESLint, Prettier

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** Latest LTS version recommended (e.g., v18, v20+). You can check with `node -v`.
*   **pnpm:** Used for package management. Install via `npm install -g pnpm` if you don't have it. Check with `pnpm -v`.
*   **Docker & Docker Compose:** Required for running the application and database in containers. Visit the [Docker website](https://www.docker.com/get-started) for installation instructions.
*   **Git:** For cloning the repository.
*   **(Optional) MySQL Client:** If you plan to connect to the database directly without using the Docker setup (e.g., a local MySQL server or a cloud instance).

You will also need:

*   **Backblaze B2 Account:** For image upload functionality. You'll need to obtain API keys and a bucket name.

## Getting Started

Follow these steps to get the project up and running on your local machine.

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url> # Replace <repository_url> with the actual URL
    cd golazo-kings-api
    ```

2.  **Install Dependencies:**
    This project uses `pnpm` for package management.
    ```bash
    pnpm install
    ```

3.  **Set Up Environment Variables:**
    Environment variables are used to configure the application for different environments.
    *   Copy the example environment file for development:
        ```bash
        cp .env.example .env.development
        ```
    *   If you plan to run in production mode locally or build for production, also create a production environment file:
        ```bash
        cp .env.example .env.production
        ```
    *   Open `.env.development` (and `.env.production` if created) and update the variables according to your setup. Key variables to configure include:
        *   `PORT`: The port the application will run on (default: 3000).
        *   `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`, `DB_DATABASE`: MySQL database connection details. If using the provided Docker setup, these are often pre-configured in the `docker-compose.yml` but ensure `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` and `DB_ROOT_PASSWORD` in your `.env` files match what you expect or what `docker-compose.yml` sets up.
        *   `B2_ACCESS_KEY_ID`, `B2_SECRET_ACCESS_KEY`, `B2_BUCKET_NAME`, `B2_ENDPOINT`, `B2_REGION`, `B2_PUBLIC_URL_BASE`: Backblaze B2 credentials for image storage.
        *   `KINGS_LEAGUE_BASE_URL`, `QUEENS_LEAGUE_BASE_URL`: Base URLs for the official league websites used for scraping.

    Refer to `.env.example` for a full list and description of all environment variables.

## Running the Application

You can run the application in several ways:

### 1. Development Mode (Hot-Reloading)

This mode is ideal for development as it watches for file changes and automatically reloads the application.

```bash
pnpm run start:dev
```
The application will typically be available at `http://localhost:<PORT>` (e.g., `http://localhost:3000` if `PORT` is 3000).

### 2. Docker

The project is configured to run with Docker Compose, which will also set up a MySQL database container.

*   **Build the Docker images (if not already built or if changes were made):**
    ```bash
    pnpm run docker:dev:build
    ```
*   **Start the application and database containers in detached mode:**
    ```bash
    pnpm run docker:dev:up
    ```
*   **View logs:**
    ```bash
    pnpm run docker:dev:logs
    ```
*   **Stop and remove containers:**
    ```bash
    pnpm run docker:dev:down
    ```
When using Docker, the API will be accessible at `http://localhost:<PORT>` as specified in your `.env.development` file, mapped from the container. The database will be accessible to the application container via its service name as defined in `docker-compose.yml`.

### 3. Production Mode

To run the application in a production-like manner:

*   **Build the application:**
    ```bash
    pnpm run build
    ```
*   **Start the application:**
    ```bash
    pnpm run start:prod
    ```
This will run the compiled JavaScript files from the `dist` folder. Ensure your `.env.production` file is correctly configured for your production environment.

## API Documentation (Swagger)

This API uses Swagger (OpenAPI) for documentation. Once the application is running, you can access the Swagger UI in your browser to view all available endpoints, their parameters, request/response bodies, and test them directly.

The Swagger documentation is typically available at:

`http://localhost:<PORT>/<API_PREFIX>/<API_VERSION>/<SWAGGER_PATH>`

Based on default configurations (`.env.example`, `src/config/app.config.ts`, `src/config/swagger.config.ts`):
*   `PORT`: e.g., `3000`
*   `API_PREFIX`: `api`
*   `API_VERSION`: `v1` (default, can be different if specified in request URI)
*   `SWAGGER_PATH`: `api/docs`

So, the default URL would be: `http://localhost:3000/api/v1/api/docs`

**Note:** The `SWAGGER_PATH` itself defaults to `api/docs`. If you want the documentation at `http://localhost:3000/api/v1/docs`, you would change `SWAGGER_PATH` in your environment configuration to just `docs`.

## Available Scripts

This project includes several scripts defined in `package.json` to help with development, testing, and building:

*   `pnpm run build`: Compiles the TypeScript application into JavaScript, outputting to the `dist` folder.
*   `pnpm run format`: Formats code in `src` and `test` directories using Prettier.
*   `pnpm run start`: Starts the application (alias for `nest start`).
*   `pnpm run start:dev`: Starts the application in development mode with hot-reloading using `nest start --watch`.
*   `pnpm run start:debug`: Starts the application in debug mode with hot-reloading.
*   `pnpm run start:prod`: Starts the compiled application from the `dist` folder (for production).
*   `pnpm run lint`: Lints TypeScript files in `src`, `apps`, `libs`, and `test` directories using ESLint.
*   `pnpm run test`: Runs unit tests using Jest.
*   `pnpm run test:watch`: Runs unit tests in watch mode.
*   `pnpm run test:cov`: Runs unit tests and generates a coverage report.
*   `pnpm run test:debug`: Runs unit tests in debug mode.
*   `pnpm run test:e2e`: Runs end-to-end tests using Jest (requires a running application and database).

### Docker Scripts

*   `pnpm run docker:dev:up`: Starts Docker containers for development (application and database) in detached mode.
*   `pnpm run docker:dev:down`: Stops and removes Docker containers for development.
*   `pnpm run docker:dev:build`: Builds (or rebuilds) Docker images for development.
*   `pnpm run docker:dev:logs`: Tails logs from the running Docker containers.

### TypeORM Migration Scripts

These scripts use the TypeORM CLI for database schema migrations. Ensure your database connection details in `src/config/typeorm.config.cli.ts` (or the environment variables it uses) are correctly set up for your development or target database.

*   `pnpm run migration:generate src/migrations/MyNewMigration`: Generates a new migration file with SQL commands based on changes in your entities. Replace `MyNewMigration` with a descriptive name.
    *   Example: `pnpm run migration:generate src/migrations/CreateUserTable`
*   `pnpm run migration:run`: Applies all pending migrations to the database.
*   `pnpm run migration:revert`: Reverts the last applied migration.
*   `pnpm run migration:show`: Shows all migrations and their status (applied or not).

**Note:** For migration scripts, you might need to ensure that `DB_HOST` in your environment points to a host accessible from where you run the command (e.g., `localhost` if running directly, or the Docker host if your DB is in Docker and you're running migrations from outside the container against it, though typically migrations are run from within an environment that can see the DB directly or via a script that execs into the app container).

## Environment Variables

This project uses environment variables for configuration. A comprehensive list of all variables can be found in the `.env.example` file.

Key categories of environment variables include:

*   **API Configuration:**
    *   `NODE_ENV`: The environment mode (e.g., `development`, `production`, `test`).
    *   `PORT`: Port on which the application runs.
    *   `API_PREFIX`: Global prefix for all API routes (e.g., `api`).
    *   `API_VERSION`: Default API version.
    *   `HOST`: Hostname for the application.

*   **Database Configuration (MySQL):**
    *   `DB_HOST`: Database host.
    *   `DB_PORT`: Database port.
    *   `DB_USERNAME`: Database username.
    *   `DB_PASSWORD`: Database password.
    *   `DB_ROOT_PASSWORD`: Database root password (especially for Docker setup).
    *   `DB_DATABASE`: Database name.
    *   `DB_SYNCHRONIZE`: TypeORM synchronize option (typically `true` for development, `false` for production to use migrations).
    *   `DB_LOGGING`: TypeORM logging option.

*   **Backblaze B2 Credentials (S3 Compatible API):**
    *   `B2_ACCESS_KEY_ID`: Your Backblaze B2 Key ID.
    *   `B2_SECRET_ACCESS_KEY`: Your Backblaze B2 Application Key.
    *   `B2_BUCKET_NAME`: The name of your B2 bucket.
    *   `B2_ENDPOINT`: The S3 endpoint for your bucket's region (e.g., `https://s3.us-east-005.backblazeb2.com`).
    *   `B2_REGION`: The region of your B2 bucket (e.g., `us-east-005`).
    *   `B2_PUBLIC_URL_BASE`: The public base URL for accessing files in your bucket.

*   **Admin / Scraping Configuration:**
    *   `KINGS_LEAGUE_BASE_URL`: Base URL for the Kings League website.
    *   `QUEENS_LEAGUE_BASE_URL`: Base URL for the Queens League website.

To configure these, copy `.env.example` to `.env.development` (for development) and/or `.env.production` (for production) and fill in the appropriate values.
```bash
cp .env.example .env.development
# Edit .env.development with your values
```

## Project Structure

Here's a brief overview of the key directories and their contents:

```
golazo-kings-api/
├── .dockerignore         # Specifies intentionally untracked files for Docker
├── .env.example          # Example environment variables
├── .github/              # GitHub specific files (e.g., workflows for CI/CD - if you add them)
├── .vscode/              # VSCode editor settings (e.g., launch configurations, extensions - if you add them)
├── docker/               # Docker-related files
│   └── mysql/
│       └── init-db.sql   # Initial SQL script for creating databases
├── dist/                 # Compiled JavaScript output (after `pnpm run build`)
├── node_modules/         # Project dependencies
├── scripts/              # Shell scripts (e.g., entrypoint.sh for Docker)
├── src/                  # Source code
│   ├── app.controller.ts # Basic app controller
│   ├── app.module.ts     # Root application module
│   ├── app.service.ts    # Basic app service
│   ├── main.ts           # Application entry point, sets up NestJS app, Swagger, etc.
│   ├── common/           # Shared utilities, pipes, interceptors, decorators, DTOs
│   ├── config/           # Configuration files (app, database, swagger, etc.)
│   ├── infrastructure/   # Infrastructure modules (e.g., database setup)
│   ├── migrations/       # Database migration files generated by TypeORM
│   └── modules/          # Core feature modules
│       ├── admin/        # Admin functionalities, including data scraping
│       ├── image/        # Image upload and management
│       ├── leagues/      # League management
│       ├── players/      # Player management
│       ├── presidents/   # President management
│       └── teams/        # Team management
├── test/                 # End-to-end tests
├── .gitignore            # Specifies intentionally untracked files by Git
├── docker-compose.dev.yml # Docker Compose for development (overrides)
├── docker-compose.yml    # Base Docker Compose file
├── Dockerfile            # Instructions to build the application Docker image
├── eslint.config.mjs     # ESLint configuration
├── nest-cli.json         # NestJS CLI configuration
├── package.json          # Project metadata and dependencies
├── pnpm-lock.yaml        # Exact versions of dependencies
├── railway.json          # Railway deployment configuration (if used)
├── tsconfig.build.json   # TypeScript compiler options for building
└── tsconfig.json         # Base TypeScript compiler options
```

Key areas in `src/`:
*   `src/main.ts`: Bootstraps the NestJS application, configures global pipes, versioning, CORS, and Swagger documentation.
*   `src/common/`: Contains reusable components like custom pipes for validation (`not-empty.pipe.ts`), response interceptors (`response.interceptor.ts`), decorators, common DTOs, and utility functions.
*   `src/config/`: Manages application configuration using `@nestjs/config`. Each file typically exports a configuration object (e.g., `app.config.ts`, `database.config.ts`). `env.validation.ts` is often used to validate environment variables.
*   `src/modules/`: This is where the core business logic resides. Each subdirectory (e.g., `leagues`, `teams`, `players`, `admin`) represents a feature module, typically containing its own controllers, services, entities (if applicable), DTOs, and potentially repositories.
    *   The `admin` module notably contains the `scraping.service.ts` responsible for fetching data from external league websites.
    *   The `image` module handles file uploads, likely interacting with Backblaze B2.
*   `src/migrations/`: Stores database migration files generated and used by TypeORM.

## License

This project is currently **UNLICENSED** as indicated in the `package.json`.

If you intend to distribute or open-source this project, you should choose an appropriate open-source license and update both this section and the `license` field in the `package.json` file. Popular choices include MIT, Apache 2.0, or GPLv3. You can find more information on choosing a license at [choosealicense.com](https://choosealicense.com/).
