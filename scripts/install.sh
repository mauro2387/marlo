#!/bin/bash

# Script de instalación completa del proyecto MarLo Cookies
# Uso: ./scripts/install.sh

set -e  # Salir si hay algún error

echo "🍪 Instalando MarLo Cookies System..."
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar prerequisitos
echo ""
echo "📋 Verificando prerequisitos..."

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Por favor instala Node.js 18+ desde: https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"

# npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm $NPM_VERSION${NC}"

# PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL no detectado. Asegúrate de tenerlo instalado.${NC}"
else
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✅ $PSQL_VERSION${NC}"
fi

# Instalar Backend
echo ""
echo "📦 Instalando dependencias del Backend..."
cd backend
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Copiando .env.example a .env${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Por favor configura el archivo backend/.env antes de continuar${NC}"
fi
npm install
echo -e "${GREEN}✅ Backend instalado${NC}"
cd ..

# Instalar Frontend
echo ""
echo "📦 Instalando dependencias del Frontend..."
cd frontend
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Copiando .env.example a .env.local${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Por favor configura el archivo frontend/.env.local antes de continuar${NC}"
fi
npm install
echo -e "${GREEN}✅ Frontend instalado${NC}"
cd ..

# Instrucciones finales
echo ""
echo "======================================"
echo -e "${GREEN}✅ ¡Instalación completada!${NC}"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Configura las variables de entorno:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo ""
echo "2. Crea la base de datos PostgreSQL:"
echo "   psql -U postgres"
echo "   CREATE DATABASE marlocookies;"
echo "   \\q"
echo ""
echo "3. Ejecuta el schema:"
echo "   psql -U postgres -d marlocookies -f database/schema.sql"
echo ""
echo "4. Ejecuta el seed (datos iniciales):"
echo "   psql -U postgres -d marlocookies -f database/seed.sql"
echo ""
echo "5. Inicia el backend:"
echo "   cd backend && npm run start:dev"
echo ""
echo "6. En otra terminal, inicia el frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "7. Accede a:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   API Docs: http://localhost:3001/api/docs"
echo ""
echo "🍪 ¡Que tengas un excelente desarrollo!"
