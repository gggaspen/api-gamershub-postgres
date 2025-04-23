@echo off
echo Eliminando archivos Docker...

del Dockerfile
del docker-compose.yml
del .dockerignore
del railway.toml

echo Archivos Docker eliminados correctamente.
pause
