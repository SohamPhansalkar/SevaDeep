# Use the official MySQL 8.0 image as the base
FROM mysql:8.0

# The official MySQL image is programmed to look inside the /docker-entrypoint-initdb.d/ folder.
# It will automatically execute any .sql files it finds there the very first time the database boots up.
COPY dataBase.sql /docker-entrypoint-initdb.d/