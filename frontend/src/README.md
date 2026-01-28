# Frontend del Proyecto de Voleibol

Este es el frontend para la aplicación de gestión de un club de voleibol. Está construido con **React**, **TypeScript** y **Vite**, ofreciendo una experiencia de desarrollo rápida y una aplicación optimizada.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

-   [Node.js](https://nodejs.org/) (versión 18.x o superior recomendada)
-   [NPM](https://www.npmjs.com/) (normalmente incluido con Node.js)

## 1. Instalación

Sigue estos pasos para preparar el entorno de desarrollo:

1.  **Navega a la carpeta del frontend** desde la raíz del proyecto:
    ```bash
    cd frontend
    ```

2.  **Instala las dependencias** necesarias ejecutando:
    ```bash
    npm install
    ```

## 2. Configuración

El frontend necesita comunicarse con el backend.

-   Por defecto, la aplicación está configurada para buscar el backend en `http://localhost:3001/api`.
-   Si tu backend está corriendo en otro puerto o URL, verifica el archivo `src/api/axios.ts` para ajustar la `baseURL`.

## 3. Ejecutar la Aplicación

Tienes varios scripts disponibles para diferentes propósitos:

### Modo Desarrollo (Recomendado)
Inicia el servidor de desarrollo con recarga automática (HMR).
```bash
npm run dev
