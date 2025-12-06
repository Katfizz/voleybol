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

---

## Endpoints de Usuarios (`/api/users`)

### 1. Obtener Todos los Usuarios

*   **Endpoint**: `GET /`
*   **Acceso**: `ADMIN`.

### 2. Crear un Nuevo Usuario

*   **Endpoint**: `POST /`
*   **Descripción**: Crea un nuevo usuario en el sistema. Esta acción requiere que un usuario ya esté autenticado.
*   **Acceso**:
    *   `ADMIN`: Puede crear `ADMIN`, `COACH`, y `PLAYER`.
    *   `COACH`: Puede crear `PLAYER`.
*   **Body (Request para PLAYER)**:
    ```json
    {
      "email": "player@example.com",
      "password": "password123",
      "role": "PLAYER",
      "profile": {
        "full_name": "Juan Pérez",
        "birthDate": "2005-08-15T00:00:00.000Z",
        "contact_data": {
          "phone": "123-456-7890",
          "address": "Calle Falsa 123"
        },
        "representative_data": {
          "name": "Maria Pérez",
          "phone": "987-654-3210"
        }
      }
    }
    ```
*   **Body (Request para COACH/ADMIN)**:
    ```json
    {
      "email": "coach@example.com",
      "password": "password123",
      "role": "COACH"
    }
    ```
*   **Respuesta (Success 201)**:
    ```json
    {
      "ok": true,
      "msg": "Usuario creado exitosamente.",
      "user": { ... }
    }
    ```

### 2. Obtener Usuario por ID

*   **Endpoint**: `GET /:id`
*   **Acceso**: `ADMIN` o el propio usuario.

### 3. Actualizar un Usuario

*   **Endpoint**: `PUT /:id`
*   **Acceso**: `ADMIN` o el propio usuario. Solo un `ADMIN` puede cambiar el rol.
*   **Body (Request)**:
    ```json
    {
      "email": "nuevo@email.com",
      "profile": {
        "full_name": "Nuevo Nombre Completo"
      }
    }
    ```

### 4. Eliminar un Usuario

*   **Endpoint**: `DELETE /:id`
*   **Acceso**: `ADMIN`.