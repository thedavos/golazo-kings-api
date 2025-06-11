# Golazo Kings API

Una API backend desarrollada con NestJS para gestionar datos de ligas deportivas, enfocándose en entidades como ligas (Kings League, Queens League), equipos, jugadores, presidentes, temporadas, partidos y clasificaciones. Proporciona operaciones CRUD completas, gestión de imágenes a través de Backblaze B2, y capacidades de web scraping para obtener datos de los sitios web oficiales de las ligas.

## Características Principales

- **API Integral:** Operaciones CRUD para ligas, equipos, jugadores, presidentes, temporadas, partidos y clasificaciones
- **Gestión de Imágenes:** Subida y administración de imágenes con integración de Backblaze B2
- **Web Scraping:** Extrae datos de equipos y jugadores desde los sitios web oficiales de Kings League y Queens League
- **Documentación API:** Documentación detallada disponible a través de Swagger/OpenAPI
- **Configuración por Entornos:** Configuración basada en variables de entorno para flexibilidad entre diferentes setups
- **Migraciones de Base de Datos:** Utiliza TypeORM para gestionar esquemas y migraciones de base de datos
- **Arquitectura Modular:** Implementa Domain Driven Design (DDD) con separación clara de responsabilidades

## Arquitectura del Proyecto

El proyecto sigue una arquitectura hexagonal (Clean Architecture) con los siguientes módulos principales:

### Módulos de Dominio

- **Leagues:** Gestión de ligas, temporadas, partidos y clasificaciones
- **Teams:** Administración de equipos y sus datos
- **Players:** Gestión de jugadores y sus estadísticas
- **Presidents:** Administración de presidentes de equipos
- **Image:** Manejo de subida y almacenamiento de imágenes
- **Admin:** Funcionalidades administrativas incluyendo web scraping

### Entidades Principales

- **League:** Representa las ligas deportivas (Kings League, Queens League)
- **Season:** Temporadas dentro de cada liga
- **Team:** Equipos participantes en las ligas
- **Player:** Jugadores individuales
- **President:** Presidentes/representantes de los equipos
- **Match:** Partidos entre equipos
- **Standing:** Clasificaciones y posiciones de equipos
- **Image:** Metadatos de imágenes almacenadas

## Tecnologías Utilizadas

- **Framework Backend:** [NestJS](https://nestjs.com/) v11.0.1
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) v5.7.3
- **Base de Datos:** [MySQL](https://www.mysql.com/)
- **ORM:** [TypeORM](https://typeorm.io/) v0.3.22
- **Contenedorización:** [Docker](https://www.docker.com/) & Docker Compose
- **Documentación API:** [Swagger (OpenAPI)](https://swagger.io/)
- **Almacenamiento de Archivos:** [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html) (compatible con S3)
- **Gestor de Paquetes:** [pnpm](https://pnpm.io/)
- **Web Scraping:** [Cheerio](https://cheerio.js.org/) v1.0.0
- **Validación:** Class Validator & Class Transformer
- **Testing:** Jest v29.7.0
- **Linting/Formateo:** ESLint v9.18.0, Prettier v3.4.2

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js:** Versión LTS más reciente recomendada (v18, v20+). Verificar con `node -v`
- **pnpm:** Para gestión de paquetes. Instalar con `npm install -g pnpm`. Verificar con `pnpm -v`
- **Docker & Docker Compose:** Requerido para ejecutar la aplicación y base de datos en contenedores
- **Git:** Para clonar el repositorio
- **(Opcional) Cliente MySQL:** Si planeas conectarte directamente a la base de datos

También necesitarás:

- **Cuenta Backblaze B2:** Para funcionalidad de subida de imágenes. Deberás obtener claves API y nombre de bucket

## Getting Started

1.  **Clonar el Repositorio:**
    ```bash
    git clone <repository_url> # Replace <repository_url> with the actual URL
    cd golazo-kings-api
    ```

2.  **Instalar Dependencias:**
    ```bash
    pnpm install
    ```

3. **Configurar Variables de Entorno:**
   ```bash
   cp .env.example .env.development
   # Editar .env.development con tus valores
   ```

   Variables clave a configurar:
    - **API:** `PORT`, `API_PREFIX`, `API_VERSION`
    - **Base de Datos:** `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
    - **Backblaze B2:** `B2_ACCESS_KEY_ID`, `B2_SECRET_ACCESS_KEY`, `B2_BUCKET_NAME`, `B2_ENDPOINT`
    - **Scraping:** `KINGS_LEAGUE_BASE_URL`, `QUEENS_LEAGUE_BASE_URL`

## Ejecución de la Aplicación

### 1. Modo Desarrollo (Hot-Reloading)

Este modo es ideal para el desarrollo, ya que observa los cambios en los archivos y actualiza automáticamente la aplicación.

```bash
pnpm run start:dev
```
La aplicación estará disponible en `http://localhost:3000` (o el puerto configurado).

### 2. Docker

El proyecto está configurado para ejecutarse con Docker Compose, que también configurará un contenedor de base de datos MySQL.

*   **Crea las imágenes Docker (si aún no se han creado o si se han realizado cambios):**
    ```bash
    pnpm run docker:dev:build
    ```
*   **Inicia contenedores:**
    ```bash
    pnpm run docker:dev:up
    ```
*   **Ver logs:**
    ```bash
    pnpm run docker:dev:logs
    ```
*   **Detener contenedores:**
    ```bash
    pnpm run docker:dev:down
    ```

### 3. Modo Producción

*   **Build:**
    ```bash
    pnpm run build
    ```
*   **Inicia la aplicación:**
    ```bash
    pnpm run start:prod
    ```
Esto ejecutará los archivos JavaScript compilados de la carpeta `dist`. Asegúrate de que el archivo `.env.production` está correctamente configurado para tu entorno de producción.

## API Documentation (Swagger)

Esta API utiliza Swagger (OpenAPI) para la documentación. Una vez que la aplicación se está ejecutando, puede acceder a la Swagger UI en tu navegador para ver todos los endpoints disponibles, sus parámetros, body de request / response, y probarlos directamente.

La documentación de Swagger suele estar disponible en

`http://localhost:<PORT>/<API_PREFIX>/<API_VERSION>/<SWAGGER_PATH>`

Basado en configuraciones por defecto (`.env.example`, `src/config/app.config.ts`, `src/config/swagger.config.ts`):
*   `PORT`: e.g., `3000`
*   `API_PREFIX`: `api`
*   `API_VERSION`: `v1` (default)
*   `SWAGGER_PATH`: `api/docs`

Así, la URL por defecto sería: `http://localhost:3000/api/api/docs`

**Nota:** El `SWAGGER_PATH` por defecto es `api/docs`. Si quieres la documentación en `http://localhost:3000/api/docs`, debes cambiar `SWAGGER_PATH` en la configuración de tu entorno a `docs`.

## Endpoints Principales
### Ligas
- `GET /api/leagues` - Obtener todas las ligas
- `POST /api/leagues` - Crear nueva liga
- `GET /api/leagues/:id` - Obtener liga específica
- `PUT /api/leagues/:id` - Actualizar liga
- `DELETE /api/leagues/:id` - Eliminar liga

### Equipos
- `GET /api/teams` - Obtener todos los equipos
- `POST /api/teams` - Crear nuevo equipo
- `GET /api/teams/:id` - Obtener equipo específico
- `PUT /api/teams/:id` - Actualizar equipo
- `DELETE /api/teams/:id` - Eliminar equipo

### Jugadores
- `GET /api/players` - Obtener todos los jugadores
- `POST /api/players` - Crear nuevo jugador
- `GET /api/players/:id` - Obtener jugador específico
- `PUT /api/players/:id` - Actualizar jugador
- `DELETE /api/players/:id` - Eliminar jugador

### Presidentes
- `GET /api/presidents` - Obtener todos los presidentes
- `POST /api/presidents` - Crear nuevo presidente
- `GET /api/presidents/:id` - Obtener presidente específico
- `PUT /api/presidents/:id` - Actualizar presidente
- `DELETE /api/presidents/:id` - Eliminar presidente

### Imágenes
- `POST /api/images/upload` - Subir imagen a Backblaze B2
- `GET /api/images/:id` - Obtener metadatos de imagen
- `DELETE /api/images/:id` - Eliminar imagen

### Administración
- `POST /api/admin/scrape` - Ejecutar scraping de datos de ligas


## Scripts Disponibles

### Desarrollo
- `pnpm run start:dev` - Iniciar en modo desarrollo con hot-reload
- `pnpm run start:debug` - Iniciar en modo debug
- `pnpm run build` - Construir aplicación para producción
- `pnpm run start:prod` - Ejecutar versión de producción

### Testing
- `pnpm run test` - Ejecutar tests unitarios
- `pnpm run test:watch` - Ejecutar tests en modo watch
- `pnpm run test:cov` - Ejecutar tests con reporte de cobertura
- `pnpm run test:e2e` - Ejecutar tests end-to-end

### Docker
- `pnpm run docker:dev:up` - Iniciar contenedores de desarrollo
- `pnpm run docker:dev:down` - Detener contenedores
- `pnpm run docker:dev:build` - Construir imágenes Docker
- `pnpm run docker:dev:logs` - Ver logs de contenedores

### Migraciones TypeORM
- `pnpm run migration:generate src/migrations/NombreMigracion` - Generar nueva migración
- `pnpm run migration:run` - Ejecutar migraciones pendientes
- `pnpm run migration:revert` - Revertir última migración
- `pnpm run migration:show` - Mostrar estado de migraciones

### Calidad de Código
- `pnpm run lint` - Ejecutar ESLint
- `pnpm run format` - Formatear código con Prettier

### Docker Scripts

*   `pnpm run docker:dev:up`: Starts Docker containers for development (application and database) in detached mode.
*   `pnpm run docker:dev:down`: Stops and removes Docker containers for development.
*   `pnpm run docker:dev:build`: Builds (or rebuilds) Docker images for development.
*   `pnpm run docker:dev:logs`: Tails logs from the running Docker containers.

## Variables de Entorno

Consulta para ver todas las variables disponibles `.env.example`

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
    *   `B2_ACCESS_KEY_ID`: Backblaze B2 Key ID.
    *   `B2_SECRET_ACCESS_KEY`: Backblaze B2 Application Key.
    *   `B2_BUCKET_NAME`: The name of your B2 bucket.
    *   `B2_ENDPOINT`: The S3 endpoint for your bucket's region (e.g., `https://s3.us-east-005.backblazeb2.com`).
    *   `B2_REGION`: The region of your B2 bucket (e.g., `us-east-005`).
    *   `B2_PUBLIC_URL_BASE`: The public base URL for accessing files in your bucket.

*   **Admin / Scraping Configuration:**
    *   `KINGS_LEAGUE_BASE_URL`: Base URL for the Kings League website.
    *   `QUEENS_LEAGUE_BASE_URL`: Base URL for the Queens League website.

Para configurar estos, copia `.env.example` a `.env.development` (para desarrollo) y/o `.env.production` (para producción) y completa con los valores correspondientes.
```bash
cp .env.example .env.development
# Edita .env.development con nuevos valores
```

## Project Structure

He aquí un breve resumen de los directorios clave y su contenido:

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

## Web Scraping

El módulo de administración incluye funcionalidades de web scraping para extraer datos automáticamente de:

- **Kings League:** Equipos, jugadores y estadísticas
- **Queens League:** Equipos, jugadores y estadísticas

El scraping se ejecuta mediante:

```bash
POST /api/admin/scrape
```

Los datos extraídos se procesan y almacenan automáticamente en la base de datos, manteniendo la integridad referencial entre entidades.

## Gestión de Imágenes
El sistema utiliza Backblaze B2 (compatible con S3) para almacenamiento de imágenes:
- Subida de archivos con validación de tipo y tamaño
- Generación automática de URLs públicas
- Gestión de metadatos en base de datos
- Eliminación segura de archivos

## Contribución
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request


## License

Este proyecto está licenciado bajo la Licencia MIT 
- ver el archivo `LICENSE` para más detalles.

## Soporte

Para reportar bugs o solicitar nuevas funcionalidades, por favor abre un issue en el repositorio del proyecto.
