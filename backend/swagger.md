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
*   **Respuesta (Success 200)**:
    ```json
    {
        "ok": true,
        "events": [
            {
                "id": 5,
                "name": "Jornada de Sábado - Liga Juvenil",
                "type": "MATCH",
                "date_time": "2024-09-21T09:00:00.000Z",
                "location": "Cancha Central",
                "categories": [ { "id": 1, "name": "Equipo A" }, ... ],
                "_count": {
                    "matches": 2
                }
            }
        ]
    }
    ```

### 2. Obtener Evento por ID

*   **Endpoint**: `GET /:id`
*   **Descripción**: Devuelve los detalles de un evento específico, incluyendo sus partidos y detalles de práctica si aplica.
*   **Acceso**: Cualquier usuario autenticado.
*   **Respuesta (Success 200)**:
    ```json
    {
        "ok": true,
        "event": { ... "matches": [ { "id": 10, ... }, { "id": 11, ... } ] }
    }
    ```

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
    // Ejemplo para crear una JORNADA DE PARTIDOS
    {
      "name": "Jornada de Fin de Semana - Liga Juvenil",
      "type": "MATCH",
      "date_time": "2024-08-17T09:00:00Z",
      "location": "Cancha Central",
      "description": "Partidos correspondientes a la fecha 5.",
      "categoryIds": [1, 2, 3, 4]
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
      "description": "Descripción actualizada.",
      "categoryIds": [3, 4]
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

---

## Endpoints de Partidos (`/api/matches`)

### 1. Obtener Todos los Partidos

*   **Endpoint**: `GET /`
*   **Descripción**: Devuelve una lista de todos los partidos con información básica de los equipos y el evento.
*   **Acceso**: Cualquier usuario autenticado.
*   **Respuesta (Success 200)**:
    ```json
    {
        "ok": true,
        "matches": [
            {
                "id": 2,
                "event_id": 1,
                "home_category_id": 1,
                "away_category_id": 2,
                "home_sets_won": 2,
                "away_sets_won": 1,
                "winner_category_id": 1,
                "event": { "name": "Jornada de Fin de Semana" },
                "homeCategory": { "name": "Sub-17 Masculino" },
                "awayCategory": { "name": "Sub-19 Masculino" },
                "winnerCategory": { "name": "Sub-17 Masculino" }
            }
        ]
    }
    ```

### 2. Obtener Partido por ID

*   **Endpoint**: `GET /:id`
*   **Descripción**: Devuelve los detalles completos de un partido, incluyendo todos sus sets.
*   **Acceso**: Cualquier usuario autenticado.
*   **Respuesta (Success 200)**:
    ```json
    {
        "ok": true,
        "match": {
            "id": 2,
            "event_id": 1,
            "home_category_id": 1,
            "away_category_id": 2,
            "home_sets_won": 2,
            "away_sets_won": 1,
            "winner_category_id": 1,
            "event": { "name": "Jornada de Fin de Semana" },
            "homeCategory": { "name": "Sub-17 Masculino" },
            "awayCategory": { "name": "Sub-19 Masculino" },
            "winnerCategory": { "name": "Sub-17 Masculino" },
            "sets": [ { ... } ]
        }
    }
    ```

### 3. Registrar Resultados de un Partido

*   **Endpoint**: `PUT /:id/results`
*   **Descripción**: Registra o actualiza los resultados de los sets para un partido específico. El sistema recalcula los sets ganados y el ganador del partido.
*   **Acceso**: `ADMIN`, `COACH`.
*   **Body (Request)**:
    ```json
    {
      "sets": [
        { "set_number": 1, "home_score": 25, "away_score": 20 },
        { "set_number": 2, "home_score": 23, "away_score": 25 },
        { "set_number": 3, "home_score": 25, "away_score": 22 }
      ]
    }
    ```
*   **Respuesta (Success 200)**:
    ```json
    {
        "ok": true,
        "match": { ...el objeto del partido actualizado con sus sets... }
    }
    ```

### 4. Eliminar un Partido

*   **Endpoint**: `DELETE /:id`
*   **Descripción**: Elimina un partido de la base de datos.
*   **Acceso**: `ADMIN`, `COACH`.
*   **Respuesta (Success 200)**:
    ```json
    {
        "ok": true,
        "msg": "Partido eliminado exitosamente."
    }
    ```

---

## Endpoints de Asistencia (`/api/attendance`)

### 1. Obtener Asistencia de un Evento

*   **Endpoint**: `GET /event/:eventId`
*   **Descripción**: Obtiene la lista de asistencia para un evento específico. Se puede filtrar por fecha si el evento dura varios días.
*   **Acceso**: Cualquier usuario autenticado.
*   **Query Params**:
    *   `date` (Opcional): Fecha en formato `YYYY-MM-DD` para filtrar la asistencia de un día específico.
*   **Respuesta (Success 200)**:
    ```json
    {
        "ok": true,
        "attendance": [
            {
                "id": 1,
                "date": "2024-09-21T00:00:00.000Z",
                "player_profile_id": 10,
                "event_id": 5,
                "status": "PRESENT",
                "notes": null,
                "player_profile": {
                    "full_name": "Juan Pérez",
                    "position": "Setter"
                },
                "recorded_by": {
                    "email": "coach@example.com"
                }
            }
        ]
    }
    ```

### 2. Registrar Asistencia

*   **Endpoint**: `POST /event/:eventId`
*   **Descripción**: Registra o actualiza la asistencia de múltiples jugadores para un evento en una fecha específica.
*   **Acceso**: `ADMIN`, `COACH`.
*   **Body (Request)**:
    ```json
    {
      "date": "2024-09-21",
      "attendances": [
        { "player_profile_id": 10, "status": "PRESENT" },
        { "player_profile_id": 11, "status": "ABSENT", "notes": "Enfermedad" },
        { "player_profile_id": 12, "status": "EXCUSED" }
      ]
    }
    ```
*   **Respuesta (Success 200)**:
    ```json
    {
        "ok": true,
        "msg": "Asistencia registrada exitosamente.",
        "results": [ ...registros actualizados... ]
    }
    ```

### 3. Eliminar Registro de Asistencia

*   **Endpoint**: `DELETE /:id`
*   **Descripción**: Elimina un registro de asistencia específico por su ID.
*   **Acceso**: `ADMIN`, `COACH`.
*   **Respuesta (Success 200)**:
    ```json
    {
        "ok": true,
        "msg": "Registro de asistencia eliminado."
    }
    ```