# Backend del Proyecto de Voleibol

Este es el backend para la aplicación de gestión de un club de voleibol. Está construido con Node.js, Express y Prisma.

## Requisitos Previos

-   [Node.js](https://nodejs.org/) (versión 18.x o superior)
-   [PostgreSQL](https://www.postgresql.org/) (o Docker para ejecutar una instancia)
-   [Git](https://git-scm.com/)

## 1. Configuración de la Base de Datos

La aplicación utiliza PostgreSQL como base de datos.

### Usando Docker (Recomendado)

Si tienes Docker instalado, puedes levantar una base de datos PostgreSQL fácilmente.

1.  **Crear un archivo `docker-compose.yml`** en la raíz de la carpeta `backend`:

    ```yaml
    version: '3.8'
    services:
      postgres:
        image: postgres:13
        container_name: voley-postgres
        restart: always
        ports:
          - "5433:5432"
        environment:
          - POSTGRES_USER=voleyuser
          - POSTGRES_PASSWORD=voleypass
          - POSTGRES_DB=voley_db
        volumes:
          - postgres_data:/var/lib/postgresql/data

    volumes:
      postgres_data:
    ```

2.  **Iniciar el contenedor:**
    ```bash
    docker-compose up -d
    ```

### Configuración Manual

Si prefieres instalar PostgreSQL manualmente, asegúrate de crear un usuario y una base de datos para el proyecto.

## 2. Configuración del Entorno

1.  **Navega a la carpeta del backend:**
    ```bash
    cd backend
    ```

2.  **Crea una copia del archivo de ejemplo `.env.example`** y renómbrala a `.env`:
    ```bash
    cp .env.example .env
    ```

3.  **Edita el archivo `.env`** y configura la variable `DATABASE_URL` con tu cadena de conexión a PostgreSQL.

    -   **Si usas el `docker-compose.yml` anterior:**
        ```
        DATABASE_URL="postgresql://voleyuser:voleypass@localhost:5433/voley_db?schema=public"
        ```
    -   **Si usas una configuración manual**, ajústala según tus credenciales.

4.  **Establece un secreto para JWT** en la variable `JWT_SECRET`. Puedes generar uno aleatorio.
    ```
    JWT_SECRET="ESTE_ES_UN_SECRETO_MUY_SEGURO_Y_LARGO"
    ```

## 3. Instalación y Migración

1.  **Instala las dependencias del proyecto:**
    ```bash
    npm install
    ```

2.  **Aplica las migraciones de la base de datos** con Prisma. Esto creará las tablas definidas en `prisma/schema.prisma`.
    ```bash
    npx prisma migrate dev --name init
    ```

## 4. Ejecutar la Aplicación

-   **Para desarrollo (con recarga automática):**
    ```bash
    npm run dev
    ```
-   **Para producción:**
    ```bash
    npm start
    ```

El servidor se iniciará en el puerto especificado en tu archivo `.env` (por defecto, 3001).

## 5. Pruebas (Testing)

Actualmente, el proyecto no cuenta con un framework de pruebas automatizadas. Se recomienda encarecidamente añadir uno para garantizar la calidad y estabilidad del código.

### Configuración Sugerida: Jest + Supertest

**Jest** es un framework de pruebas popular, y **Supertest** permite probar los endpoints de la API de manera sencilla.

1.  **Instalar dependencias de desarrollo:**
    ```bash
    npm install --save-dev jest supertest
    ```

2.  **Configurar Jest:** Crea un archivo `jest.config.js` en la raíz de `backend`:
    ```javascript
    module.exports = {
      testEnvironment: 'node',
      verbose: true,
    };
    ```

3.  **Añadir un script de prueba** en tu `package.json`:
    ```json
    "scripts": {
      // ... otros scripts
      "test": "jest --runInBand"
    },
    ```

4.  **Crear una prueba de ejemplo:** Crea una carpeta `__tests__` en `src` y dentro un archivo `app.test.js`:

    ```javascript
    // src/__tests__/app.test.js
    const request = require('supertest');
    const app = require('../app'); // Asegúrate de que tu app.js exporta la app de Express

    describe('GET /', () => {
      it('should return 200 OK with a welcome message', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Voleyball App Backend is running!');
      });
    });
    ```

5.  **Ejecutar las pruebas:**
    ```bash
    npm test
    ```

Esta configuración inicial te permitirá empezar a construir un conjunto de pruebas robusto para tu aplicación.
