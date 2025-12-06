const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const config = require("../src/config/config"); // Usar la configuración centralizada

const prisma = new PrismaClient();
async function main() {
  console.log("Iniciando el proceso de seed...");

  const adminEmail = config.adminEmail;
  const adminPassword = config.adminPassword;

  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync(adminPassword, salt);

  // ÚLTIMO RECURSO: Usar SQL crudo para evitar el bug del motor de Prisma.
  try {
    // Usamos $executeRawUnsafe porque $executeRaw no soporta ENUMs directamente como parámetros.
    // Es seguro en este contexto porque los valores no vienen del usuario.
    await prisma.$executeRawUnsafe(
      `INSERT INTO "public"."users" ("email", "password_hash", "role") VALUES ($1, $2, CAST($3 AS "public"."Role"))`,
      adminEmail,
      hashedPassword,
      Role.ADMIN
    );
    console.log(
      `Usuario administrador '${adminEmail}' creado exitosamente con SQL crudo.`
    );
  } catch (error) {
    // El código de error para violación de unicidad en PostgreSQL es '23505'
    if (
      error.code === "P2002" ||
      error.code === "P2010" ||
      (error.nativeError && error.nativeError.code === "23505")
    ) {
      console.log(
        `Usuario administrador '${adminEmail}' ya existe. No se realizaron cambios.`
      );
    } else {
      throw error; // Si es otro error, lo lanzamos para no ocultar problemas reales.
    }
  }
  console.log("Proceso de seed finalizado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // Asegurarse de desconectar la instancia local
  });
