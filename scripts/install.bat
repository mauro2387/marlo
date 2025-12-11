@echo off
REM Script de instalación para Windows
REM Uso: scripts\install.bat

echo.
echo ========================================
echo  Instalando MarLo Cookies System
echo ========================================
echo.

REM Verificar Node.js
echo Verificando prerequisitos...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor instala Node.js 18+ desde: https://nodejs.org
    pause
    exit /b 1
)
node -v
echo [OK] Node.js instalado

REM Verificar npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm no esta instalado
    pause
    exit /b 1
)
npm -v
echo [OK] npm instalado

REM Verificar PostgreSQL
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARN] PostgreSQL no detectado. Asegurate de tenerlo instalado.
) else (
    psql --version
    echo [OK] PostgreSQL instalado
)

echo.
echo Instalando dependencias del Backend...
cd backend
if not exist ".env" (
    echo [WARN] Copiando .env.example a .env
    copy .env.example .env
    echo [WARN] Por favor configura el archivo backend\.env
)
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion del backend
    pause
    exit /b 1
)
echo [OK] Backend instalado
cd ..

echo.
echo Instalando dependencias del Frontend...
cd frontend
if not exist ".env.local" (
    echo [WARN] Copiando .env.example a .env.local
    copy .env.example .env.local
    echo [WARN] Por favor configura el archivo frontend\.env.local
)
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion del frontend
    pause
    exit /b 1
)
echo [OK] Frontend instalado
cd ..

echo.
echo ========================================
echo  Instalacion completada!
echo ========================================
echo.
echo Proximos pasos:
echo.
echo 1. Configura las variables de entorno:
echo    - backend\.env
echo    - frontend\.env.local
echo.
echo 2. Crea la base de datos PostgreSQL:
echo    psql -U postgres
echo    CREATE DATABASE marlocookies;
echo    \q
echo.
echo 3. Ejecuta el schema:
echo    psql -U postgres -d marlocookies -f database\schema.sql
echo.
echo 4. Ejecuta el seed:
echo    psql -U postgres -d marlocookies -f database\seed.sql
echo.
echo 5. Inicia el backend:
echo    cd backend
echo    npm run start:dev
echo.
echo 6. En otra terminal, inicia el frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 7. Accede a:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001
echo    API Docs: http://localhost:3001/api/docs
echo.
echo Que tengas un excelente desarrollo!
echo.
pause
