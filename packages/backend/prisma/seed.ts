import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.$transaction([
    prisma.stockMovement.deleteMany(),
    prisma.recipeIngredient.deleteMany(),
    prisma.recipe.deleteMany(),
    prisma.orderItemModifier.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.order.deleteMany(),
    prisma.shift.deleteMany(),
    prisma.commission.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.loyaltyRedemption.deleteMany(),
    prisma.loyaltyProgram.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.tenantFeatureFlag.deleteMany(),
    prisma.subscriptionInvoice.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.modifierOption.deleteMany(),
    prisma.modifierGroup.deleteMany(),
    prisma.menuCategory.deleteMany(),
    prisma.table.deleteMany(),
    prisma.serviceArea.deleteMany(),
    prisma.branch.deleteMany(),
    prisma.ingredient.deleteMany(),
    prisma.user.deleteMany(),
    prisma.tenant.deleteMany(),
  ])

  // ─── Tenant ───────────────────────────────────────────────
  const tenant = await prisma.tenant.create({
    data: {
      name: 'La Cocina de Juan',
      slug: 'la-cocina-de-juan',
      businessType: 'fine_dining',
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      locale: 'es-MX',
      timezone: 'America/Mexico_City',
      currency: 'MXN',
      settings: { onboardingCompleted: true },
    },
  })

  // ─── User ─────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 12)
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@lacocina.com',
      passwordHash,
      name: 'Juan Admin',
      role: 'admin',
    },
  })

  // ─── Feature Flags ────────────────────────────────────────
  const features = ['kds', 'table_management', 'split_bills', 'inventory_auto', 'hr_scheduling', 'bcg_matrix', 'crm_full', 'loyalty_program']
  for (const feature of features) {
    await prisma.tenantFeatureFlag.create({
      data: { tenantId: tenant.id, feature, enabled: true },
    })
  }

  // ─── Branch & Areas & Tables ──────────────────────────────
  const branch = await prisma.branch.create({
    data: { tenantId: tenant.id, name: 'Sucursal Centro', address: 'Av. Reforma 123, CDMX' },
  })

  const area1 = await prisma.serviceArea.create({
    data: { branchId: branch.id, name: 'Salón Principal', type: 'dining', sortOrder: 1 },
  })
  const area2 = await prisma.serviceArea.create({
    data: { branchId: branch.id, name: 'Terraza', type: 'terrace', sortOrder: 2 },
  })

  const tableData = [
    { areaId: area1.id, label: 'M1', capacity: 2 },
    { areaId: area1.id, label: 'M2', capacity: 4 },
    { areaId: area1.id, label: 'M3', capacity: 4 },
    { areaId: area1.id, label: 'M4', capacity: 6 },
    { areaId: area1.id, label: 'M5', capacity: 2 },
    { areaId: area2.id, label: 'T1', capacity: 4 },
    { areaId: area2.id, label: 'T2', capacity: 4 },
    { areaId: area2.id, label: 'T3', capacity: 6 },
  ]
  for (const t of tableData) {
    await prisma.table.create({ data: { ...t, branchId: branch.id } })
  }

  // ─── Menu ─────────────────────────────────────────────────
  const appetizerCat = await prisma.menuCategory.create({
    data: { tenantId: tenant.id, name: 'Entradas', sortOrder: 1 },
  })
  const mainCat = await prisma.menuCategory.create({
    data: { tenantId: tenant.id, name: 'Platos Fuertes', sortOrder: 2 },
  })
  const dessertCat = await prisma.menuCategory.create({
    data: { tenantId: tenant.id, name: 'Postres', sortOrder: 3 },
  })
  const drinkCat = await prisma.menuCategory.create({
    data: { tenantId: tenant.id, name: 'Bebidas', sortOrder: 4 },
  })

  const menuItems = await Promise.all([
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: appetizerCat.id, name: 'Bruschetta Clásica', description: 'Pan tostado con tomate, albahaca y aceite de oliva', price: 89, cost: 25 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: appetizerCat.id, name: 'Ceviche de Camarón', description: 'Camarón fresco con limón, cebolla y cilantro', price: 129, cost: 45 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: mainCat.id, name: 'Filete Wagyu', description: 'Filete wagyu con reducción de vino tinto y puré de trufa', price: 549, cost: 200 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: mainCat.id, name: 'Salmón Glaseado', description: 'Salmón con glaseado de miel y mostaza, servido con espárragos', price: 349, cost: 120 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: mainCat.id, name: 'Pasta Carbonara', description: 'Spaghetti con huevo, queso pecorino y panceta', price: 189, cost: 55 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: dessertCat.id, name: 'Tiramisú', description: 'Clásico tiramisú italiano con mascarpone y café', price: 99, cost: 28 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: dessertCat.id, name: 'Crème Brûlée', description: 'Vainilla con costra de caramelo quemado', price: 89, cost: 22 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: drinkCat.id, name: 'Margarita Clásica', description: 'Tequila, limón y triple sec', price: 79, cost: 25 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: drinkCat.id, name: 'Vino Tinto Casa', description: 'Copa de vino tinto de la casa', price: 69, cost: 20 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: drinkCat.id, name: 'Agua Mineral', description: 'Agua mineral natural o con gas', price: 29, cost: 8 } }),
  ])

  // ─── Inventory & Recipes ──────────────────────────────────
  const ingredients = await Promise.all([
    prisma.ingredient.create({ data: { tenantId: tenant.id, name: 'Filete Wagyu', sku: 'CAR-WAG-001', category: 'Carnes', unit: 'kg', currentStock: 15, minimumStock: 5, unitCost: 350, supplier: 'Carnes Premium SA' } }),
    prisma.ingredient.create({ data: { tenantId: tenant.id, name: 'Salmón Fresco', sku: 'PES-SAL-001', category: 'Pescados', unit: 'kg', currentStock: 10, minimumStock: 3, unitCost: 180, supplier: 'Pescados del Mar' } }),
    prisma.ingredient.create({ data: { tenantId: tenant.id, name: 'Panceta', sku: 'CAR-PAN-001', category: 'Carnes', unit: 'kg', currentStock: 8, minimumStock: 2, unitCost: 120 } }),
    prisma.ingredient.create({ data: { tenantId: tenant.id, name: 'Spaghetti', sku: 'PAS-SPA-001', category: 'Pastas', unit: 'kg', currentStock: 20, minimumStock: 5, unitCost: 25, supplier: 'La Italiana' }),
    prisma.ingredient.create({ data: { tenantId: tenant.id, name: 'Huevo', sku: 'LAC-HUE-001', category: 'Lácteos', unit: 'units', currentStock: 60, minimumStock: 24, unitCost: 3.5 } }),
    prisma.ingredient.create({ data: { tenantId: tenant.id, name: 'Queso Pecorino', sku: 'LAC-PEC-001', category: 'Lácteos', unit: 'kg', currentStock: 5, minimumStock: 2, unitCost: 180 } }),
    prisma.ingredient.create({ data: { tenantId: tenant.id, name: 'Pan Ciabatta', sku: 'PAN-CIA-001', category: 'Pan', unit: 'units', currentStock: 30, minimumStock: 10, unitCost: 5 } }),
    prisma.ingredient.create({ data: { tenantId: tenant.id, name: 'Tomate', sku: 'VER-TOM-001', category: 'Verduras', unit: 'kg', currentStock: 8, minimumStock: 3, unitCost: 15 } }),
  ])

  // Create recipe for Pasta Carbonara
  const pastaRecipe = await prisma.recipe.create({
    data: { menuItemId: menuItems[4].id, name: 'Receta Pasta Carbonara', servings: 1, wastePercentage: 5 },
  })
  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: pastaRecipe.id, ingredientId: ingredients[3].id, quantity: 0.2 },  // 200g spaghetti
      { recipeId: pastaRecipe.id, ingredientId: ingredients[4].id, quantity: 2 },     // 2 eggs
      { recipeId: pastaRecipe.id, ingredientId: ingredients[5].id, quantity: 0.05 },  // 50g pecorino
      { recipeId: pastaRecipe.id, ingredientId: ingredients[2].id, quantity: 0.08 },  // 80g panceta
    ],
  })

  // ─── Employees ────────────────────────────────────────────
  await prisma.employee.createMany({
    data: [
      { tenantId: tenant.id, name: 'Carlos Hernández', email: 'carlos@lacocina.com', role: 'chef', pinCode: '1234', hourlyRate: 120 },
      { tenantId: tenant.id, name: 'María García', email: 'maria@lacocina.com', role: 'waiter', pinCode: '2345', hourlyRate: 45, commissionPct: 5 },
      { tenantId: tenant.id, name: 'José López', email: 'jose@lacocina.com', role: 'waiter', pinCode: '3456', hourlyRate: 45, commissionPct: 5 },
      { tenantId: tenant.id, name: 'Ana Martínez', email: 'ana@lacocina.com', role: 'cashier', pinCode: '4567', hourlyRate: 50 },
    ],
  })

  // ─── Customers ────────────────────────────────────────────
  await prisma.customer.createMany({
    data: [
      { tenantId: tenant.id, name: 'Roberto Sánchez', email: 'roberto@email.com', phone: '555-0101', totalVisits: 12, totalSpent: 12500, segment: 'VIP', tags: ['frecuente', 'postres'] },
      { tenantId: tenant.id, name: 'Laura Fernández', email: 'laura@email.com', phone: '555-0102', totalVisits: 8, totalSpent: 8400, segment: 'VIP', tags: ['vino tinto'] },
      { tenantId: tenant.id, name: 'Pedro Ramírez', email: 'pedro@email.com', phone: '555-0103', totalVisits: 3, totalSpent: 2100, segment: 'regular', tags: [] },
    ],
  })

  // ─── Subscription ─────────────────────────────────────────
  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      plan: 'pro',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log(`   Tenant: ${tenant.name}`)
  console.log('   Admin: admin@lacocina.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
