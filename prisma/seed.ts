import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // SUPER_ADMIN
const superAdmin = await prisma.user.upsert({
  where: { email: 'superadmin@gmail.com' },
  update: {},
  create: {
    email: 'superadmin@gmail.com',
    passwordHash: await bcrypt.hash('SuperAdmin@123', 12),
    firstName: 'Super',
    lastName: 'Admin',
    role: Role.SUPER_ADMIN,
    isActive: true,
    isEmailVerified: true,
  },
});

// SUB_ADMIN
const subAdmin = await prisma.user.upsert({
  where: { email: 'subadmin@gmail.com' },
  update: {},
  create: {
    email: 'subadmin@gmail.com',
    passwordHash: await bcrypt.hash('SubAdmin@123456', 12),
    firstName: 'Sub',
    lastName: 'Admin',
    role: Role.SUB_ADMIN,
    isActive: true,
    isEmailVerified: true,
  },
});

// USER
const user = await prisma.user.upsert({
  where: { email: 'user@gmail.com' },
  update: {},
  create: {
    email: 'user@gmail.com',
    passwordHash: await bcrypt.hash('User@123456', 12),
    firstName: 'Regular',
    lastName: 'User',
    role: Role.USER,
    isActive: true,
    isEmailVerified: true,
  },
});

  console.log('✅ Seeded users:', {
    superAdmin: superAdmin.email,
    subAdmin: subAdmin.email,
    user: user.email,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
