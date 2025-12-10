openapi: 3.0.0
info:
  title: Voleyball Project API
  description: API para la gestión de equipos, jugadores y eventos de voleibol.
  version: 1.0.0

servers:
  - url: http://localhost:8080/api
    description: Servidor de desarrollo

tags:
  - name: Auth
    description: Autenticación y obtención de tokens
  - name: Users
    description: Gestión de usuarios (jugadores, coaches, admins)
  - name: Categories
    description: Gestión de categorías (equipos)
  - name: Events & Matches
    description: Gestión de eventos (prácticas, jornadas) y partidos

paths:
  /auth/login:
    post:
      tags:
        - Auth
      summary: Iniciar sesión para obtener un token JWT
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  example: admin@test.com
                password:
                  type: string
                  example: '123456'
      responses:
        '200':
          description: Login exitoso, devuelve el token.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginSuccess'
        '401':
          description: Credenciales no válidas.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # --- Events ---
  /events:
    post:
      tags:
        - Events & Matches
      summary: Crear un nuevo evento (práctica o jornada de partidos)
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            examples:
              create_practice:
                summary: Ejemplo para crear una Práctica
                value:
                  name: "Entrenamiento de Saque y Recepción"
                  type: "PRACTICE"
                  date_time: "2024-08-15T18:00:00Z"
                  location: "Gimnasio Principal"
                  description: "Práctica enfocada en fundamentos."
                  categoryIds: [1, 2]
                  practice:
                    objective: "Mejorar la efectividad del primer saque."
              create_match_day:
                summary: Ejemplo para crear una Jornada de Partidos
                value:
                  name: "Jornada de Fin de Semana - Liga Juvenil"
                  type: "MATCH"
                  date_time: "2024-08-17T09:00:00Z"
                  location: "Cancha Central"
                  description: "Partidos correspondientes a la fecha 5."
                  categoryIds: [1, 2, 3, 4]
      responses:
        '201':
          description: Evento creado exitosamente.
        '400':
          description: Datos inválidos.
        '401':
          description: No autenticado.
        '403':
          description: No autorizado (rol incorrecto).
        '409':
          description: Ya existe un evento con ese nombre.

    get:
      tags:
        - Events & Matches
      summary: Obtener todos los eventos
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Lista de eventos.

  /events/{id}:
    get:
      tags:
        - Events & Matches
      summary: Obtener un evento por su ID
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Detalles del evento.
        '404':
          description: Evento no encontrado.

    put:
      tags:
        - Events & Matches
      summary: Actualizar un evento
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                date_time:
                  type: string
                  format: date-time
                location:
                  type: string
      responses:
        '200':
          description: Evento actualizado.
        '404':
          description: Evento no encontrado.

    delete:
      tags:
        - Events & Matches
      summary: Eliminar un evento
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Evento eliminado.
        '404':
          description: Evento no encontrado.

  # --- Matches ---
  /events/{id}/matches:
    post:
      tags:
        - Events & Matches
      summary: Añadir un partido a un evento existente
      description: Crea un nuevo partido y lo asocia a un evento de tipo 'MATCH' o 'TOURNAMENT'.
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          description: El ID del evento contenedor.
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                home_category_id:
                  type: integer
                  description: ID de la categoría (equipo) local.
                  example: 1
                away_category_id:
                  type: integer
                  description: ID de la categoría (equipo) visitante.
                  example: 2
      responses:
        '201':
          description: Partido creado y añadido al evento exitosamente.
        '400':
          description: Datos inválidos (ej. el evento no es de tipo 'MATCH', o los equipos son el mismo).
        '404':
          description: El evento o una de las categorías no existen.

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    LoginSuccess:
      type: object
      properties:
        ok:
          type: boolean
          example: true
        user:
          type: object
          properties:
            id:
              type: integer
            email:
              type: string
            role:
              type: string
        token:
          type: string
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    Error:
      type: object
      properties:
        ok:
          type: boolean
          example: false
        msg:
          type: string
          example: "Error interno del servidor."

    Event:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        type:
          type: string
          enum: [MATCH, PRACTICE, TOURNAMENT]
        date_time:
          type: string
          format: date-time
        location:
          type: string
        description:
          type: string
        categories:
          type: array
          items:
            $ref: '#/components/schemas/Category'
        practice:
          $ref: '#/components/schemas/Practice'
        matches:
          type: array
          items:
            $ref: '#/components/schemas/Match'

    Practice:
      type: object
      properties:
        objective:
          type: string
        notes:
          type: string
        drills:
          type: object

    Match:
      type: object
      properties:
        id:
          type: integer
        event_id:
          type: integer
        home_category_id:
          type: integer
        away_category_id:
          type: integer
        home_sets_won:
          type: integer
        away_sets_won:
          type: integer

    Category:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        description:
          type: string