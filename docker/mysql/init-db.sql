-- Crear bases de datos si no existen
CREATE DATABASE IF NOT EXISTS golazo_kings_dev;
CREATE DATABASE IF NOT EXISTS golazo_kings_test;

-- Definir privilegios para el usuario
GRANT ALL PRIVILEGES ON golazo_kings_dev.* TO '${MYSQL_USER}'@'%';
GRANT ALL PRIVILEGES ON golazo_kings_test.* TO '${MYSQL_USER}'@'%';

-- Actualizar privilegios
FLUSH PRIVILEGES;