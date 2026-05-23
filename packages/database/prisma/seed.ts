import { prisma } from '../src/client';

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

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { name: permission.name },
      create: permission
    });
  }

  const roles = [
    { key: 'SUPER_ADMIN', name: 'Super Admin', permissions: permissions.map((permission) => permission.key) },
    { key: 'ADMIN', name: 'Admin', permissions: ['products.read', 'products.write', 'catalog.write', 'articles.write', 'deals.write', 'analytics.read', 'scrapers.manage', 'affiliate.write', 'admin.access'] },
    { key: 'EDITOR', name: 'Editor', permissions: ['products.read', 'articles.write', 'deals.write', 'affiliate.write'] },
    { key: 'ANALYST', name: 'Analyst', permissions: ['products.read', 'analytics.read'] },
    { key: 'OPERATOR', name: 'Operator', permissions: ['products.read', 'scrapers.manage'] }
  ] as const;

  for (const role of roles) {
    const record = await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name },
      create: { key: role.key, name: role.name }
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: record.id } });
    const permissionRecords = await prisma.permission.findMany({ where: { key: { in: role.permissions } } });
    await prisma.rolePermission.createMany({
      data: permissionRecords.map((permission) => ({ roleId: record.id, permissionId: permission.id })),
      skipDuplicates: true
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
    process.exit(1);
  });
