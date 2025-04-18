#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Log message indicating migrations are starting
echo "Running database migrations..."

# Execute the TypeORM migration command
npm run migration:run

# Log message indicating application is starting
echo "Migrations finished. Starting the application..."

# Execute the command passed as arguments to the script (which will be the CMD from Dockerfile)
exec "$@"