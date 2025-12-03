# Documentación de la API (Estilo Swagger)

Esta documentación describe los endpoints de la API del proyecto de voleibol.

**URL Base:** `http://localhost:3000/api`

## Autenticación

La mayoría de las rutas de esta API están protegidas. Para acceder a ellas, primero debes obtener un token de autenticación JWT a través de la ruta de login. Luego, debes incluir este token en la cabecera `Authorization` de tus peticiones de la siguiente manera:

`Authorization: Bearer <tu_token_jwt>`

---

## Recurso: Autenticación (`/auth`)

### `POST /auth/login`

Autentica un usuario y devuelve un token JWT para ser usado en las demás peticiones.

*   **Permisos:** Público
*   **Request Body:**

    ```json
    {
        "email": "admin@example.com",
        "password": "your_secure_password"
    }
    ```

*   **Respuesta Exitosa (200 OK):**

    ```json
    {
        "ok": true,
        "msg": "Inicio de sesión exitoso",
        "user": { "id": 1, "email": "admin@example.com", "role": "ADMIN" },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

---

## Recurso: Usuarios (`/users`)

### `POST /users`

Crea un nuevo usuario en el sistema. El `body` varía según el rol (`role`).

*   **Permisos:**
    *   `ADMIN` puede crear `ADMIN`, `COACH`, y `PLAYER`.
    *   `COACH` puede crear `PLAYER`.

*   **Request Body (para `ADMIN` o `COACH`):**

    ```json
    {
        "email": "new.coach@example.com",
        "password": "passwordForCoach123",
        "role": "COACH"
    }
    ```

*   **Request Body (para `PLAYER`):**

    ```json
    {
        "email": "new.player@example.com",
        "password": "passwordForPlayer123",
        "role": "PLAYER",
        "profile": {
            "firstName": "Carlos",
            "lastName": "Vargas",
            "birthDate": "2006-04-15T00:00:00.000Z",
            "contact": {
                "phone": "555-123-4567",
                "address": "Avenida Central 101"
            },
            "representativeData": {
                "fullName": "Maria Vargas",
                "phone": "555-765-4321",
                "email": "maria.vargas@example.com"
            }
        }
    }
    ```

*   **Respuesta Exitosa (201 Created):**

    ```json
    {
        "ok": true,
        "msg": "Usuario creado exitosamente.",
        "user": { "id": 12, "email": "new.player@example.com", "role": "PLAYER" }
    }
    ```

### `GET /users`

Devuelve una lista de todos los usuarios del sistema.

*   **Permisos:** `ADMIN`
*   **Request Body:** Ninguno.

### `GET /users/:id`

Devuelve la información de un usuario específico.

*   **Permisos:** `ADMIN` o el propio usuario.
*   **Request Body:** Ninguno.

### `PUT /users/:id`

Actualiza la información de un usuario. Todos los campos en el `body` son opcionales.

*   **Permisos:** `ADMIN` o el propio usuario. Solo un `ADMIN` puede cambiar el rol.
*   **Request Body:**

    ```json
    {
        "full_name": "Carlos Alberto Vargas",
        "position": "Libero",
        "password": "newSecurePassword123"
    }
    ```

*   **Respuesta Exitosa (200 OK):**

    ```json
    {
        "ok": true,
        "msg": "Usuario actualizado exitosamente",
        "user": {
            "id": 12,
            "email": "new.player@example.com",
            "role": "PLAYER",
            "playerProfile": { "full_name": "Carlos Alberto Vargas", "position": "Libero" }
        }
    }
    ```

### `DELETE /users/:id`

Elimina un usuario del sistema.

*   **Permisos:** `ADMIN`
*   **Request Body:** Ninguno.

---

## Recurso: Perfil (`/profile`)

### `GET /profile`

Devuelve el perfil del jugador asociado al token de autenticación.

*   **Permisos:** Cualquier usuario autenticado (aunque solo devolverá datos si es un `PLAYER`).
*   **Request Body:** Ninguno.
*   **Respuesta Exitosa (200 OK):**

    ```json
    {
        "full_name": "Carlos Vargas",
        "birth_date": "2006-04-15T00:00:00.000Z",
        "position": null
    }
    ```

---

## Recurso: Categorías (`/categories`)

Este recurso permite a los `ADMIN` y `COACH` gestionar las categorías o equipos.

### `GET /categories`

Devuelve una lista de todas las categorías existentes.

*   **Permisos:** `ADMIN`, `COACH`
*   **Request Body:** Ninguno.
*   **Respuesta Exitosa (200 OK):**

    ```json
    {
        "ok": true,
        "categories": [
            {
                "id": 1,
                "name": "Sub-17 Femenino",
                "description": "Equipo de competencia regional.",
                "_count": {
                    "playerProfiles": 12,
                    "coaches": 1
                }
            },
            {
                "id": 2,
                "name": "Libre Masculino",
                "description": null,
                "_count": {
                    "playerProfiles": 15,
                    "coaches": 2
                }
            }
        ]
    }
    ```

### `GET /categories/:id`

Devuelve una categoría específica, incluyendo los perfiles de los jugadores y los coaches asociados.

*   **Permisos:** `ADMIN`, `COACH`
*   **Request Body:** Ninguno.

### `POST /categories`

Crea una nueva categoría.

*   **Permisos:** `ADMIN`, `COACH`
*   **Request Body:**

    ```json
    {
        "name": "Sub-19 Masculino",
        "description": "Equipo para el torneo nacional."
    }
    ```

*   **Respuesta Exitosa (201 Created):**

    ```json
    {
        "ok": true,
        "msg": "Categoría creada exitosamente.",
        "category": {
            "id": 3,
            "name": "Sub-19 Masculino",
            "description": "Equipo para el torneo nacional."
        }
    }
    ```

### `POST /categories/:id/players`

Asigna un jugador existente a una categoría.

*   **Permisos:** `ADMIN`, `COACH`
*   **Request Body:**

    ```json
    {
        "playerId": 15
    }
    ```

*   **Respuesta Exitosa (200 OK):**

    ```json
    {
        "ok": true,
        "msg": "Jugador asignado a la categoría 'Sub-19 Masculino' exitosamente.",
        "category": {
            "id": 3,
            "name": "Sub-19 Masculino",
            "playerProfiles": [ /* ...lista actualizada de perfiles... */ ]
        }
    }
    ```

### `PUT /categories/:id`

Actualiza el nombre o la descripción de una categoría.

*   **Permisos:** `ADMIN`, `COACH`
*   **Request Body:**

    ```json
    {
        "name": "Sub-19 Varonil",
        "description": "Equipo actualizado para el torneo nacional."
    }
    ```

### `DELETE /categories/:id`

Elimina una categoría del sistema.

*   **Permisos:** `ADMIN`, `COACH`
*   **Request Body:** Ninguno.
*   **Respuesta Exitosa (200 OK):**

    ```json
    {
        "ok": true,
        "msg": "Categoría eliminada exitosamente."
    }
    ```