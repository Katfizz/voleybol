const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcrypt");
const config = require("../src/config/config"); // Usar la configuración centralizada

const prisma = new PrismaClient();
async function main() {
  console.log("Iniciando el proceso de seed...");

  const adminEmail = config.adminEmail;
  const adminPassword = config.adminPassword;

  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync(adminPassword, salt);

  try {
    // Usamos upsert: Si existe (where email), no hace nada (update {}). Si no, lo crea.
    // Esto evita errores de nombres de tablas y maneja la concurrencia correctamente.
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password_hash: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log(`Usuario administrador '${adminEmail}' procesado correctamente.`);
  } catch (error) {
    console.error("Error crítico en el seed:", error);
    throw error;
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
