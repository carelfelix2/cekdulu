import { prisma } from '../src/client';
import { hashSync } from 'bcryptjs';

async function main() {
  const permissions = [
    { key: 'products.read', name: 'Read Products' },
    { key: 'products.write', name: 'Write Products' },
    { key: 'catalog.write', name: 'Write Catalog' },
    { key: 'articles.write', name: 'Write Articles' },
    { key: 'deals.write', name: 'Write Deals' },
    { key: 'analytics.read', name: 'Read Analytics' },
    { key: 'scrapers.manage', name: 'Manage Scrapers' },
    { key: 'affiliate.write', name: 'Write Affiliate Links' },
    { key: 'admin.access', name: 'Access Admin Dashboard' }
  ];

  const getPasswordHash = (password: string) => hashSync(password, 12);

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { name: permission.name },
      create: permission
    });
  }

  const marketplaces = [
    { slug: 'shopee', name: 'Shopee', displayName: 'Shopee', color: '#EE1D1D', logoUrl: 'https://cdn-icons-png.flaticon.com/512/3541/3541368.png' },
    { slug: 'tokopedia', name: 'Tokopedia', displayName: 'Tokopedia', color: '#00AA00', logoUrl: 'https://cdn-icons-png.flaticon.com/512/9568/9568544.png' },
    { slug: 'lazada', name: 'Lazada', displayName: 'Lazada', color: '#0A4FB7', logoUrl: 'https://cdn-icons-png.flaticon.com/512/7201/7201432.png' },
    { slug: 'blibli', name: 'Blibli', displayName: 'Blibli', color: '#FF6600', logoUrl: 'https://cdn-icons-png.flaticon.com/512/1987/1987672.png' },
  ];

  for (const marketplace of marketplaces) {
    await prisma.marketplace.upsert({
      where: { slug: marketplace.slug },
      update: { name: marketplace.name },
      create: marketplace
    });
  }

  const roles = [
    { key: 'USER', name: 'User', permissions: [] },
    { key: 'SUPER_ADMIN', name: 'Super Admin', permissions: permissions.map((permission) => permission.key) },
    { key: 'ADMIN', name: 'Admin', permissions: ['products.read', 'products.write', 'catalog.write', 'articles.write', 'deals.write', 'analytics.read', 'scrapers.manage', 'affiliate.write', 'admin.access'] },
    { key: 'EDITOR', name: 'Editor', permissions: ['products.read', 'articles.write', 'deals.write', 'affiliate.write'] },
    { key: 'ANALYST', name: 'Analyst', permissions: ['products.read', 'analytics.read'] },
    { key: 'OPERATOR', name: 'Operator', permissions: ['products.read', 'scrapers.manage'] }
  ] as const;

  for (const role of roles) {
    const record = await prisma.role.upsert({
      where: { key: role.key as any },
      update: { name: role.name },
      create: { key: role.key as any, name: role.name }
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: record.id } });
    const permissionRecords = await prisma.permission.findMany({ where: { key: { in: role.permissions } } });
    await prisma.rolePermission.createMany({
      data: permissionRecords.map((permission: { id: string }) => ({ roleId: record.id, permissionId: permission.id })),
      skipDuplicates: true
    });
  }

  const userRole = await prisma.role.findFirst({ where: { name: 'User' } });
  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });

  if (userRole) {
    const user = await prisma.user.upsert({
      where: { email: 'user@cekdulu.test' },
      update: {
        name: 'Demo User',
        status: 'ACTIVE',
        passwordHash: await getPasswordHash('User12345!')
      },
      create: {
        email: 'user@cekdulu.test',
        name: 'Demo User',
        status: 'ACTIVE',
        passwordHash: await getPasswordHash('User12345!')
      }
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: userRole.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: userRole.id
      }
    });
  }

  if (adminRole) {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@cekdulu.test' },
      update: {
        name: 'Demo Admin',
        status: 'ACTIVE',
        passwordHash: await getPasswordHash('Admin12345!')
      },
      create: {
        email: 'admin@cekdulu.test',
        name: 'Demo Admin',
        status: 'ACTIVE',
        passwordHash: await getPasswordHash('Admin12345!')
      }
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: adminRole.id
        }
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: adminRole.id
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    throw error;
  });
