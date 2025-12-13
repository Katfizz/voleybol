# Documentación de la API - Voleyball App

Esta es la documentación oficial para la API del backend de la aplicación de gestión del club de voleibol.

**URL Base**: `/api`

## Autenticación

Todas las rutas, excepto `/api/auth/login`, requieren un token de autenticación JWT. El token debe ser enviado en la cabecera `Authorization` con el formato `Bearer <token>`.

---

## Endpoints de Autenticación (`/api/auth`)

### 1. Iniciar Sesión

*   **Endpoint**: `POST /login`
*   **Descripción**: Autentica a un usuario y devuelve un token JWT.
*   **Acceso**: Público.
*   **Body (Request)**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
*   **Respuesta (Success 200)**:
    ```json
    {
      "ok": true,
      "msg": "Inicio de sesión exitoso",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "ADMIN"
      },
      "token": "ey..."
    }
    ```

---

## Endpoints de Perfil (`/api/profile`)

### 1. Obtener Perfil Propio

*   **Endpoint**: `GET /`
*   **Descripción**: Devuelve la información del perfil del usuario autenticado.
*   **Acceso**: Cualquier usuario autenticado.
*   **Respuesta (Success 200)**:
    ```json
    {
      "ok": true,
      "profile": {
        "id": 1,
        "email": "user@example.com",
        "role": "PLAYER",
        "profile": {
          "id": 1,
          "full_name": "Juan Pérez",
          ...
        }
      }
    }
    ```

---

## Endpoints de Categorías (`/api/categories`)

### 1. Obtener Todas las Categorías

*   **Endpoint**: `GET /`
*   **Acceso**: Cualquier usuario autenticado.

### 2. Obtener Categoría por ID

*   **Endpoint**: `GET /:id`
*   **Acceso**: Cualquier usuario autenticado.

### 3. Crear una Categoría

*   **Endpoint**: `POST /`
*   **Acceso**: `ADMIN`, `COACH`.
*   **Body (Request)**:
    ```json
    {
      "name": "Sub-18 Femenino",
      "description": "Categoría para jugadoras menores de 18 años."
    }
    ```

### 4. Actualizar una Categoría

*   **Endpoint**: `PUT /:id`
*   **Acceso**: `ADMIN`, `COACH`.
*   **Body (Request)**:
    ```json
    {
      "name": "Nuevo Nombre",
      "description": "Nueva descripción."
    }
    ```

### 5. Eliminar una Categoría

*   **Endpoint**: `DELETE /:id`
*   **Acceso**: `ADMIN`, `COACH`.

### 6. Desasignar un Jugador de una Categoría

*   **Endpoint**: `DELETE /:id/players/:playerId`
*   **Descripción**: Elimina la asignación de un jugador a una categoría.
*   **Acceso**: `ADMIN`, `COACH`.

### 6. Asignar un Jugador a una Categoría

*   **Endpoint**: `POST /:id/players`
*   **Acceso**: `ADMIN`, `COACH`.
*   **Body (Request)**:
    ```json
    {
      "playerId": 25
    }
    ```

### 7. Asignar un Coach a una Categoría

*   **Endpoint**: `POST /:id/coaches`
*   **Descripción**: Asigna un coach a una categoría. La lógica de permisos es la siguiente:
    *   Un `ADMIN` puede asignar cualquier usuario con rol `COACH`.
    *   Un `COACH` solo puede asignarse a sí mismo (debe enviar su propio ID en el body).
*   **Acceso**: `ADMIN`, `COACH`.
*   **Body (Request)**:
    ```json
    {
      "coachId": 12
    }
    ```

### 8. Desasignar un Coach de una Categoría

*   **Endpoint**: `DELETE /:id/coaches/:coachId`
*   **Descripción**: Elimina la asignación de un coach a una categoría. Un `COACH` solo puede desasignarse a sí mismo.
*   **Acceso**: `ADMIN`, `COACH`.
    ```

---

## Endpoints de Usuarios (`/api/users`)

### 1. Obtener Todos los Usuarios

*   **Endpoint**: `GET /`
*   **Descripción**: Devuelve una lista de todos los usuarios del sistema.
*   **Acceso**: `ADMIN`.

### 2. Crear un Usuario

*   **Endpoint**: `POST /`
*   **Descripción**: Crea un nuevo usuario. La creación de perfiles (`profile`) es opcional.
    *   Un `ADMIN` puede crear usuarios con rol `ADMIN`, `COACH`, o `PLAYER`.
    *   Un `COACH` solo puede crear usuarios con rol `PLAYER`.
*   **Acceso**: `ADMIN`, `COACH`.
*   **Body (Request)**:
    ```json
    {
      "email": "new.player@test.com",
      "password": "password123",
      "role": "PLAYER",
      "profile": {
        "full_name": "Nuevo Jugador",
        "birth_date": "2008-05-20T00:00:00Z",
        "position": "Setter"
      }
    }
    ```

### 3. Obtener Usuario por ID

*   **Endpoint**: `GET /:id`
*   **Descripción**: Devuelve la información de un usuario específico.
    *   Un `ADMIN` puede ver cualquier usuario.
    *   Otros usuarios (`COACH`, `PLAYER`) solo pueden ver su propio perfil.
*   **Acceso**: Cualquier usuario autenticado (con restricciones).

### 4. Actualizar un Usuario

*   **Endpoint**: `PUT /:id`
*   **Descripción**: Actualiza la información de un usuario.
    *   Un `ADMIN` puede actualizar cualquier usuario y cambiar su rol.
    *   Otros usuarios solo pueden actualizar su propio perfil (email, datos de perfil, etc.), pero no su rol.
*   **Acceso**: Cualquier usuario autenticado (con restricciones).
*   **Body (Request)**:
    ```json
    {
      "email": "updated.email@test.com",
      "profile": {
        "position": "Libero"
      }
    }
    ```

### 5. Eliminar un Usuario

*   **Endpoint**: `DELETE /:id`
*   **Descripción**: Elimina un usuario del sistema.
*   **Acceso**: `ADMIN`.

---

## Endpoints de Eventos (`/api/events`)

### 1. Obtener Todos los Eventos

*   **Endpoint**: `GET /`
*   **Descripción**: Devuelve una lista de todos los eventos, ordenados por fecha.
*   **Acceso**: Cualquier usuario autenticado.

### 2. Obtener Evento por ID

*   **Endpoint**: `GET /:id`
*   **Descripción**: Devuelve los detalles de un evento específico, incluyendo sus partidos y detalles de práctica si aplica.
*   **Acceso**: Cualquier usuario autenticado.

### 3. Crear un Evento

*   **Endpoint**: `POST /`
*   **Descripción**: Crea un nuevo evento, que puede ser de tipo `PRACTICE` (práctica) o `MATCH` (jornada de partidos).
*   **Acceso**: `ADMIN`, `COACH`.
*   **Body (Request)**:
    ```json
    // Ejemplo para crear una PRÁCTICA
    {
      "name": "Entrenamiento de Saque y Recepción",
      "type": "PRACTICE",
      "date_time": "2024-08-15T18:00:00Z",
      "location": "Gimnasio Principal",
      "description": "Práctica enfocada en fundamentos.",
      "categoryIds": [1, 2],
      "practice": {
        "objective": "Mejorar la efectividad del primer saque."
      }
    }
    ```

### 4. Actualizar un Evento

*   **Endpoint**: `PUT /:id`
*   **Acceso**: `ADMIN`, `COACH`.

*   **Body (Request)**:
    ```json
    {
      "name": "Nuevo Nombre del Evento",
      "location": "Cancha Alterna",
      "description": "Descripción actualizada."
    }
    ```

### 5. Eliminar un Evento

*   **Endpoint**: `DELETE /:id`
*   **Acceso**: `ADMIN`, `COACH`.

### 6. Añadir un Partido a un Evento

*   **Endpoint**: `POST /:id/matches`
*   **Descripción**: Crea un partido y lo asocia a un evento existente de tipo `MATCH` o `TOURNAMENT`.
*   **Acceso**: `ADMIN`, `COACH`.
*   **Body (Request)**:
    ```json
    {
      "home_category_id": 1,
      "away_category_id": 2
    }
    ```