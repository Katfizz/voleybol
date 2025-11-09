# Guía de Uso de PrismaClient en el Proyecto

Este documento explica cómo se utiliza y debe utilizarse `PrismaClient` en este backend. El objetivo es mantener un código consistente, eficiente y robusto para todas las operaciones de base de datos.

## 1. El Patrón Singleton: Una Única Instancia

Para evitar agotar las conexiones a la base de datos y para mejorar el rendimiento, **siempre debemos usar una única instancia de `PrismaClient`** en toda la aplicación.

Este patrón se implementa en el archivo `src/db/prisma.js`:

```javascript
// src/db/prisma.js
const { PrismaClient } = require('@prisma/client');

// Se instancia el cliente una sola vez.
const prisma = new PrismaClient();

// Se exporta la instancia para ser usada en otros archivos.
module.exports = prisma;
```

### Cómo usarlo

En cualquier servicio, controlador o middleware que necesite acceso a la base de datos, simplemente importa esta instancia:

```javascript
const prisma = require('../db/prisma');

// Ahora puedes usar `prisma` para hacer consultas.
// Ejemplo:
// const allUsers = await prisma.user.findMany();
```

**NUNCA** debes crear una nueva instancia con `new PrismaClient()` fuera de este archivo.

---

## 2. Operaciones Básicas (CRUD)

Prisma ofrece métodos intuitivos para interactuar con tus modelos.

### Leer Registros

-   **Obtener múltiples registros:**
    ```javascript
    const allUsers = await prisma.user.findMany();
    ```
-   **Obtener un registro único por ID o campo único:**
    ```javascript
    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });
    ```

### Crear Registros

```javascript
const newUser = await prisma.user.create({
  data: {
    email: 'example@test.com',
    password_hash: '...',
    role: 'PLAYER',
  },
});
```

### Actualizar Registros

```javascript
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: {
    email: 'new-email@test.com',
  },
});
```

### Eliminar Registros

```javascript
const deletedUser = await prisma.user.delete({
  where: { id: 1 },
});
```

---

## 3. Manejo de Relaciones

Prisma facilita la carga de datos relacionados usando la opción `include`.

```javascript
// Obtener un usuario y también su perfil de jugador asociado
const userWithProfile = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    playerProfile: true, // El nombre del campo de la relación en el schema
  },
});
```

Si solo necesitas campos específicos, usa `select` para un rendimiento óptimo.

---

## 4. Transacciones Atómicas

Cuando una operación requiere múltiples escrituras en la base de datos (por ejemplo, crear un usuario y su perfil al mismo tiempo), es crucial usar transacciones. Esto asegura que **todas las operaciones se completen con éxito, o ninguna lo haga**.

En este proyecto, usamos las **Transacciones Interactivas** de Prisma.

### Ejemplo de `createUser`

```javascript
const newUser = await prisma.$transaction(async (tx) => {
  // 1. Crear el usuario
  const user = await tx.user.create({
    data: { /* ... */ },
  });

  // 2. Si el usuario es un jugador, crear su perfil
  if (user.role === 'PLAYER') {
    await tx.playerProfile.create({
      data: { userId: user.id, /* ... */ },
    });
  }

  // Si alguna de estas operaciones falla, Prisma revertirá la transacción.
  return user;
});
```

Dentro del callback de `$transaction`, debes usar el cliente de transacción (`tx` en el ejemplo) en lugar de `prisma`.
