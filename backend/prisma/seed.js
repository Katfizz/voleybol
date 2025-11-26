const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const config = require('../src/config/config'); // Importar la configuración central

const prisma = new PrismaClient();

async function main() {
  const { adminEmail, adminPassword } = config;

  if (!adminEmail || !adminPassword) {
    console.error(
      'Error: Las variables de entorno ADMIN_EMAIL y ADMIN_PASSWORD son obligatorias.'
    );
    process.exit(1);
  }

  console.log('Iniciando el proceso de seed...');

  // Hashear la contraseña
  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync(adminPassword, salt);

  // Usar 'upsert' para crear el admin solo si no existe
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // No hacer nada si ya existe
    create: {
      email: adminEmail,
      password_hash: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`Usuario administrador '${admin.email}' asegurado en la base de datos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
