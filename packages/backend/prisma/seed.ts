import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.$transaction([
    prisma.journalLine.deleteMany(),
    prisma.journalEntry.deleteMany(),
    prisma.accountingPeriod.deleteMany(),
    prisma.account.deleteMany(),
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
    prisma.integration.deleteMany(),
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

  // ─── Integrations ─────────────────────────────────────────
  await prisma.integration.createMany({
    data: [
      { tenantId: tenant.id, provider: 'rappi', type: 'delivery', enabled: true, config: { apiKey: 'test_rappi_key', commission: 0.15 } },
      { tenantId: tenant.id, provider: 'uber_eats', type: 'delivery', enabled: true, config: { apiKey: 'test_uber_key', commission: 0.18 } },
      { tenantId: tenant.id, provider: 'mercado_pago', type: 'payment', enabled: true, config: { publicKey: 'test_mp_key' } },
    ],
  })

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
  const area3 = await prisma.serviceArea.create({
    data: { branchId: branch.id, name: 'Bar', type: 'bar', sortOrder: 3 },
  })

  const area1Tables = []
  const tableDefs = [
    { areaId: area1.id, label: 'M1', capacity: 2 },
    { areaId: area1.id, label: 'M2', capacity: 4 },
    { areaId: area1.id, label: 'M3', capacity: 4 },
    { areaId: area1.id, label: 'M4', capacity: 6 },
    { areaId: area1.id, label: 'M5', capacity: 2 },
    { areaId: area1.id, label: 'M6', capacity: 8 },
    { areaId: area2.id, label: 'T1', capacity: 4 },
    { areaId: area2.id, label: 'T2', capacity: 4 },
    { areaId: area2.id, label: 'T3', capacity: 6 },
    { areaId: area2.id, label: 'T4', capacity: 2 },
    { areaId: area3.id, label: 'Barra 1', capacity: 1 },
    { areaId: area3.id, label: 'Barra 2', capacity: 1 },
    { areaId: area3.id, label: 'Barra 3', capacity: 2 },
  ]
  for (const t of tableDefs) {
    const table = await prisma.table.create({ data: { ...t, branchId: branch.id } })
    area1Tables.push(table)
  }

  // ─── Menu Categories ───────────────────────────────────────
  const catEntradas = await prisma.menuCategory.create({ data: { tenantId: tenant.id, name: 'Entradas', sortOrder: 1 } })
  const catPlatos = await prisma.menuCategory.create({ data: { tenantId: tenant.id, name: 'Platos Fuertes', sortOrder: 2 } })
  const catPostres = await prisma.menuCategory.create({ data: { tenantId: tenant.id, name: 'Postres', sortOrder: 3 } })
  const catBebidas = await prisma.menuCategory.create({ data: { tenantId: tenant.id, name: 'Bebidas', sortOrder: 4 } })

  // ─── Menu Items ────────────────────────────────────────────
  const menuItems = await Promise.all([
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catEntradas.id, name: 'Bruschetta Clásica', description: 'Pan tostado con tomate, albahaca y aceite de oliva', price: 89, cost: 25 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catEntradas.id, name: 'Ceviche de Camarón', description: 'Camarón fresco con limón, cebolla y cilantro', price: 129, cost: 45 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catEntradas.id, name: 'Guacamole con Totopos', description: 'Aguacate fresco con totopos artesanales', price: 99, cost: 28 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catEntradas.id, name: 'Alitas BBQ', description: 'Alitas de pollo bañadas en salsa BBQ ahumada', price: 139, cost: 48 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catPlatos.id, name: 'Filete Wagyu', description: 'Filete wagyu con reducción de vino tinto y puré de trufa', price: 549, cost: 200 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catPlatos.id, name: 'Salmón Glaseado', description: 'Salmón con glaseado de miel y mostaza, servido con espárragos', price: 349, cost: 120 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catPlatos.id, name: 'Pasta Carbonara', description: 'Spaghetti con huevo, queso pecorino y panceta', price: 189, cost: 55 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catPlatos.id, name: 'Rib Eye 300g', description: 'Rib eye angus con papas rostizadas y chimichurri', price: 469, cost: 165 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catPlatos.id, name: 'Pollo al Carbón', description: 'Media pierna de pollo marinado con verduras asadas', price: 199, cost: 65 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catPostres.id, name: 'Tiramisú', description: 'Clásico tiramisú italiano con mascarpone y café', price: 99, cost: 28 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catPostres.id, name: 'Crème Brûlée', description: 'Vainilla con costra de caramelo quemado', price: 89, cost: 22 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catPostres.id, name: 'Pastel de Chocolate', description: 'Pastel de chocolate belga con helado de vainilla', price: 119, cost: 35 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catBebidas.id, name: 'Margarita Clásica', description: 'Tequila, limón y triple sec', price: 79, cost: 25 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catBebidas.id, name: 'Vino Tinto Casa', description: 'Copa de vino tinto de la casa', price: 69, cost: 20 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catBebidas.id, name: 'Agua Mineral', description: 'Agua mineral natural o con gas', price: 29, cost: 8 } }),
    prisma.menuItem.create({ data: { tenantId: tenant.id, categoryId: catBebidas.id, name: 'Cerveza Artesanal', description: 'Cerveza artesanal mexicana IPA', price: 59, cost: 18 } }),
  ])

  // ─── Inventory Ingredients ─────────────────────────────────
  const ings: Record<string, any> = {}
  const ingredientDefs = [
    { key: 'wagyu', name: 'Filete Wagyu', sku: 'CAR-WAG-001', cat: 'Carnes', unit: 'kg', stock: 15, min: 5, cost: 350, sup: 'Carnes Premium SA' },
    { key: 'salmon', name: 'Salmón Fresco', sku: 'PES-SAL-001', cat: 'Pescados', unit: 'kg', stock: 10, min: 3, cost: 180, sup: 'Pescados del Mar' },
    { key: 'panceta', name: 'Panceta', sku: 'CAR-PAN-001', cat: 'Carnes', unit: 'kg', stock: 8, min: 2, cost: 120 },
    { key: 'spaghetti', name: 'Spaghetti', sku: 'PAS-SPA-001', cat: 'Pastas', unit: 'kg', stock: 20, min: 5, cost: 25, sup: 'La Italiana' },
    { key: 'huevo', name: 'Huevo', sku: 'LAC-HUE-001', cat: 'Lácteos', unit: 'units', stock: 60, min: 24, cost: 3.5 },
    { key: 'pecorino', name: 'Queso Pecorino', sku: 'LAC-PEC-001', cat: 'Lácteos', unit: 'kg', stock: 5, min: 2, cost: 180 },
    { key: 'ciabatta', name: 'Pan Ciabatta', sku: 'PAN-CIA-001', cat: 'Pan', unit: 'units', stock: 30, min: 10, cost: 5 },
    { key: 'tomate', name: 'Tomate', sku: 'VER-TOM-001', cat: 'Verduras', unit: 'kg', stock: 8, min: 3, cost: 15 },
    { key: 'aguacate', name: 'Aguacate', sku: 'VER-AGU-001', cat: 'Verduras', unit: 'kg', stock: 12, min: 4, cost: 35, sup: 'Central de Abastos' },
    { key: 'cebolla', name: 'Cebolla Morada', sku: 'VER-CEB-001', cat: 'Verduras', unit: 'kg', stock: 10, min: 3, cost: 12 },
    { key: 'camaron', name: 'Camarón', sku: 'PES-CAM-001', cat: 'Pescados', unit: 'kg', stock: 6, min: 2, cost: 220, sup: 'Pescados del Mar' },
    { key: 'limon', name: 'Limón', sku: 'VER-LIM-001', cat: 'Verduras', unit: 'kg', stock: 15, min: 5, cost: 18 },
    { key: 'pollo', name: 'Pollo Pierna', sku: 'CAR-POL-001', cat: 'Carnes', unit: 'kg', stock: 18, min: 6, cost: 55, sup: 'Avícola La Granja' },
    { key: 'ribeye', name: 'Rib Eye Angus', sku: 'CAR-RIB-001', cat: 'Carnes', unit: 'kg', stock: 10, min: 3, cost: 280, sup: 'Carnes Premium SA' },
    { key: 'chocolate', name: 'Chocolate Belga', sku: 'PAS-CHO-001', cat: 'Pastelería', unit: 'kg', stock: 4, min: 1, cost: 250, sup: 'Chocolates Finos SA' },
    { key: 'tequila', name: 'Tequila Reposado', sku: 'LIC-TEQ-001', cat: 'Licores', unit: 'l', stock: 8, min: 2, cost: 320, sup: 'Distribuidora de Licores' },
    { key: 'vino_tinto', name: 'Vino Tinto (Copa)', sku: 'LIC-VIN-001', cat: 'Licores', unit: 'l', stock: 15, min: 5, cost: 120, sup: 'Distribuidora de Licores' },
  ]
  for (const def of ingredientDefs) {
    ings[def.key] = await prisma.ingredient.create({
      data: { tenantId: tenant.id, name: def.name, sku: def.sku, category: def.cat, unit: def.unit, currentStock: def.stock, minimumStock: def.min, unitCost: def.cost, supplier: def.sup as string | undefined },
    })
  }

  // ─── Recipes ───────────────────────────────────────────────
  const recipes: Record<string, any> = {}
  const recipeData = [
    { key: 'bruschetta', itemIdx: 0, servings: 1, waste: 3, ing: [{ id: ings.ciabatta.id, qty: 2 }, { id: ings.tomate.id, qty: 0.1 }] },
    { key: 'ceviche', itemIdx: 1, servings: 1, waste: 5, ing: [{ id: ings.camaron.id, qty: 0.15 }, { id: ings.limon.id, qty: 0.05 }, { id: ings.cebolla.id, qty: 0.03 }] },
    { key: 'carbonara', itemIdx: 6, servings: 1, waste: 5, ing: [{ id: ings.spaghetti.id, qty: 0.2 }, { id: ings.huevo.id, qty: 2 }, { id: ings.pecorino.id, qty: 0.05 }, { id: ings.panceta.id, qty: 0.08 }] },
    { key: 'wagyu', itemIdx: 4, servings: 1, waste: 8, ing: [{ id: ings.wagyu.id, qty: 0.3 }] },
    { key: 'salmon', itemIdx: 5, servings: 1, waste: 5, ing: [{ id: ings.salmon.id, qty: 0.25 }] },
    { key: 'ribeye', itemIdx: 7, servings: 1, waste: 8, ing: [{ id: ings.ribeye.id, qty: 0.35 }] },
    { key: 'pollo', itemIdx: 8, servings: 1, waste: 10, ing: [{ id: ings.pollo.id, qty: 0.3 }] },
    { key: 'margarita', itemIdx: 12, servings: 1, waste: 2, ing: [{ id: ings.tequila.id, qty: 0.06 }, { id: ings.limon.id, qty: 0.03 }] },
    { key: 'tinto', itemIdx: 13, servings: 1, waste: 1, ing: [{ id: ings.vino_tinto.id, qty: 0.15 }] },
  ]
  for (const r of recipeData) {
    recipes[r.key] = await prisma.recipe.create({
      data: { menuItemId: menuItems[r.itemIdx].id, name: `Receta ${menuItems[r.itemIdx].name}`, servings: r.servings, wastePercentage: r.waste },
    })
    await prisma.recipeIngredient.createMany({
      data: r.ing.map(i => ({ recipeId: recipes[r.key].id, ingredientId: i.id, quantity: i.qty })),
    })
  }

  // ─── Employees ────────────────────────────────────────────
  const empDefs = [
    { name: 'Carlos Hernández', email: 'carlos@lacocina.com', role: 'chef' as const, pin: '1234', rate: 120 },
    { name: 'María García', email: 'maria@lacocina.com', role: 'waiter' as const, pin: '2345', rate: 45, comm: 5 },
    { name: 'José López', email: 'jose@lacocina.com', role: 'waiter' as const, pin: '3456', rate: 45, comm: 5 },
    { name: 'Ana Martínez', email: 'ana@lacocina.com', role: 'cashier' as const, pin: '4567', rate: 50 },
    { name: 'Sofía Torres', email: 'sofia@lacocina.com', role: 'manager' as const, rate: 80 },
    { name: 'Luis Mendoza', email: 'luis@lacocina.com', role: 'waiter' as const, rate: 45, comm: 5 },
    { name: 'Diego Ramírez', email: 'diego@lacocina.com', role: 'host' as const, rate: 42 },
    { name: 'Valentina Ruiz', email: 'valentina@lacocina.com', role: 'delivery' as const, rate: 38 },
  ]
  const employees: any[] = []
  for (const e of empDefs) {
    employees.push(await prisma.employee.create({
      data: { tenantId: tenant.id, name: e.name, email: e.email, role: e.role, pinCode: (e as any).pin || null, hourlyRate: e.rate, commissionPct: (e as any).comm || null },
    }))
  }

  // ─── Shifts ───────────────────────────────────────────────
  const today = new Date()
  const shiftStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0)
  const shiftEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0)
  for (const emp of employees) {
    await prisma.shift.create({
      data: { employeeId: emp.id, date: today, startTime: shiftStart, endTime: shiftEnd, status: 'checked_in' },
    })
  }

  // ─── Customers ────────────────────────────────────────────
  const customerDefs = [
    { name: 'Roberto Sánchez', email: 'roberto@email.com', phone: '555-0101', visits: 12, spent: 12500, tier: 'gold', pts: 2500, segment: 'VIP', tags: ['frecuente', 'postres'] },
    { name: 'Laura Fernández', email: 'laura@email.com', phone: '555-0102', visits: 8, spent: 8400, tier: 'gold', pts: 1680, segment: 'VIP', tags: ['vino tinto'] },
    { name: 'Pedro Ramírez', email: 'pedro@email.com', phone: '555-0103', visits: 3, spent: 2100, tier: 'silver', pts: 420, segment: 'regular', tags: [] },
    { name: 'Carmen Díaz', email: 'carmen@email.com', phone: '555-0104', visits: 20, spent: 22000, tier: 'platinum', pts: 4400, segment: 'VIP', tags: ['frecuente', 'recomienda', 'eventos'] },
    { name: 'Miguel Ángel Torres', email: 'miguel@email.com', phone: '555-0105', visits: 1, spent: 549, tier: 'bronze', pts: 109, segment: 'nuevo', tags: ['wagyu'] },
    { name: 'Gabriela Ortiz', email: 'gabriela@email.com', visits: 5, spent: 3800, tier: 'silver', pts: 760, segment: 'regular', tags: ['postres', 'sin alcohol'] },
    { name: 'Fernando Herrera', visits: 15, spent: 18000, tier: 'gold', pts: 3600, segment: 'VIP', tags: ['vino', 'negocios'] },
    { name: 'Patricia Vega', email: 'patricia@email.com', visits: 2, spent: 1600, tier: 'bronze', pts: 320, segment: 'regular', tags: [] },
  ]
  for (const c of customerDefs) {
    await prisma.customer.create({
      data: { tenantId: tenant.id, name: c.name, email: c.email || undefined, phone: (c as any).phone, totalVisits: c.visits, totalSpent: c.spent, loyaltyTier: c.tier, loyaltyPoints: c.pts, segment: c.segment, tags: c.tags as string[] },
    })
  }

  // ─── Loyalty ──────────────────────────────────────────────
  const loyalty = await prisma.loyaltyProgram.create({
    data: { tenantId: tenant.id, name: 'RestoPro Rewards', pointsPerUnit: 10, unitPerPoint: 1, tiers: JSON.stringify([
      { name: 'Bronce', minPoints: 0, color: '#CD7F32', benefits: ['Acceso básico'] },
      { name: 'Plata', minPoints: 500, color: '#C0C0C0', benefits: ['Descuento 5%', 'Postre gratis en tu cumpleaños'] },
      { name: 'Oro', minPoints: 1500, color: '#FFD700', benefits: ['Descuento 10%', 'Postre gratis', 'Prioridad en reservas'] },
      { name: 'Platino', minPoints: 3500, color: '#E5E4E2', benefits: ['Descuento 15%', 'Menú degustación gratis', 'Eventos exclusivos', 'Acceso VIP'] },
    ]) },
  })

  // ─── Orders ───────────────────────────────────────────────
  const customers = await prisma.customer.findMany({ where: { tenantId: tenant.id } })
  const tables = await prisma.table.findMany({ where: { branchId: branch.id } })
  const orderStatuses = ['paid', 'paid', 'paid', 'paid', 'served', 'ready', 'preparing', 'pending'] as const

  for (let i = 0; i < 8; i++) {
    const daysAgo = i
    const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    const tableIdx = i % tables.length
    const customerIdx = i % customers.length
    const itemCount = 2 + (i % 3)
    const selectedItems = menuItems.slice(itemCount * i % menuItems.length, itemCount * i % menuItems.length + itemCount)
    const subtotal = selectedItems.reduce((s, mi) => s + Number(mi.price), 0)
    const tax = Math.round(subtotal * 0.16 * 100) / 100
    const total = subtotal + tax

    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        tableId: tables[tableIdx].id,
        customerId: customers[customerIdx].id,
        status: orderStatuses[i % orderStatuses.length],
        type: 'dine_in',
        subtotal,
        tax,
        total,
        paymentMethod: i % 2 === 0 ? 'card' : 'cash',
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    })

    for (const mi of selectedItems) {
      await prisma.orderItem.create({
        data: { orderId: order.id, menuItemId: mi.id, name: mi.name, quantity: 1 + (i % 2), unitPrice: mi.price, totalPrice: Number(mi.price) * (1 + (i % 2)), status: 'served' },
      })
    }

    await prisma.payment.create({
      data: { orderId: order.id, method: i % 2 === 0 ? 'card' : 'cash', amount: total, status: 'completed' },
    })
  }

  // ─── Accounting: Chart of Accounts ─────────────────────────
  const accountDefs: { code: string; name: string; type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'; subtype?: string; children?: { code: string; name: string; type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'; subtype?: string }[] }[] = [
    { code: '1000', name: 'Activo', type: 'asset', children: [
      { code: '1100', name: 'Activo Circulante', type: 'asset', subtype: 'current_asset', children: [
        { code: '1101', name: 'Caja y Bancos', type: 'asset', subtype: 'current_asset' },
        { code: '1102', name: 'Cuentas por Cobrar', type: 'asset', subtype: 'current_asset' },
        { code: '1103', name: 'Inventarios', type: 'asset', subtype: 'current_asset' },
      ]},
      { code: '1200', name: 'Activo Fijo', type: 'asset', subtype: 'fixed_asset', children: [
        { code: '1201', name: 'Equipo de Cocina', type: 'asset', subtype: 'fixed_asset' },
        { code: '1202', name: 'Mobiliario', type: 'asset', subtype: 'fixed_asset' },
        { code: '1203', name: 'Equipo de Cómputo', type: 'asset', subtype: 'fixed_asset' },
      ]},
    ]},
    { code: '2000', name: 'Pasivo', type: 'liability', children: [
      { code: '2100', name: 'Pasivo Circulante', type: 'liability', subtype: 'current_liability', children: [
        { code: '2101', name: 'Proveedores', type: 'liability', subtype: 'current_liability' },
        { code: '2102', name: 'IVA por Pagar', type: 'liability', subtype: 'current_liability' },
        { code: '2103', name: 'ISR por Pagar', type: 'liability', subtype: 'current_liability' },
      ]},
      { code: '2200', name: 'Pasivo Largo Plazo', type: 'liability', subtype: 'long_term_liability', children: [
        { code: '2201', name: 'Préstamo Bancario', type: 'liability', subtype: 'long_term_liability' },
      ]},
    ]},
    { code: '3000', name: 'Capital Contable', type: 'equity', children: [
      { code: '3101', name: 'Capital Social', type: 'equity' },
      { code: '3102', name: 'Utilidades Retenidas', type: 'equity' },
      { code: '3103', name: 'Utilidad del Ejercicio', type: 'equity' },
    ]},
    { code: '4000', name: 'Ingresos', type: 'income', children: [
      { code: '4101', name: 'Venta de Alimentos', type: 'income', subtype: 'operating_revenue' },
      { code: '4102', name: 'Venta de Bebidas', type: 'income', subtype: 'operating_revenue' },
      { code: '4103', name: 'Ingresos por Delivery', type: 'income', subtype: 'operating_revenue' },
    ]},
    { code: '5000', name: 'Gastos', type: 'expense', children: [
      { code: '5101', name: 'Costo de Alimentos', type: 'expense', subtype: 'cost_of_sales' },
      { code: '5102', name: 'Costo de Bebidas', type: 'expense', subtype: 'cost_of_sales' },
      { code: '5201', name: 'Sueldos y Salarios', type: 'expense', subtype: 'operating_expense' },
      { code: '5202', name: 'Renta', type: 'expense', subtype: 'operating_expense' },
      { code: '5203', name: 'Servicios (Agua/Luz/Internet)', type: 'expense', subtype: 'operating_expense' },
      { code: '5204', name: 'Publicidad y Marketing', type: 'expense', subtype: 'operating_expense' },
      { code: '5205', name: 'Comisiones por Delivery', type: 'expense', subtype: 'operating_expense' },
    ]},
  ]

  async function createAccountTree(parentId: string | null, defs: any[]): Promise<any[]> {
    const results: any[] = []
    for (const def of defs) {
      const acc = await prisma.account.create({
        data: { tenantId: tenant.id, code: def.code, name: def.name, type: def.type, subtype: def.subtype, parentId, isSystem: def.code.startsWith('1') || def.code.startsWith('2') || def.code.startsWith('3') },
      })
      results.push(acc)
      const children = def.children
      if (children) {
        await createAccountTree(acc.id, children)
      }
    }
    return results
  }
  const coa = await createAccountTree(null, accountDefs)
  const accMap: Record<string, any> = {}
  for (const acc of coa) {
    accMap[acc.code] = acc
  }

  // ─── Accounting Period ────────────────────────────────────
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const period = await prisma.accountingPeriod.create({
    data: { tenantId: tenant.id, name: `${now.toLocaleString('default', { month: 'long' }).charAt(0).toUpperCase() + now.toLocaleString('default', { month: 'long' }).slice(1)} ${now.getFullYear()}`, startDate: periodStart, endDate: periodEnd },
  })

  // ─── Journal Entries ──────────────────────────────────────
  // 1. Capital contribution
  await prisma.journalEntry.create({
    data: {
      tenantId: tenant.id, entryDate: periodStart, description: 'Aportación inicial de capital', reference: 'CAP-001', entryType: 'manual', status: 'posted', periodId: period.id,
      lines: { create: [
        { accountId: accMap['1101'].id, debit: 500000, credit: 0, description: 'Aportación inicial' },
        { accountId: accMap['3101'].id, debit: 0, credit: 500000, description: 'Capital social' },
      ]},
    },
  })

  // 2. Purchase of kitchen equipment
  await prisma.journalEntry.create({
    data: {
      tenantId: tenant.id, entryDate: new Date(periodStart.getTime() + 86400000), description: 'Compra de equipo de cocina', reference: 'INV-001', entryType: 'manual', status: 'posted', periodId: period.id,
      lines: { create: [
        { accountId: accMap['1201'].id, debit: 150000, credit: 0, description: 'Estufa industrial, horno, refrigeración' },
        { accountId: accMap['1101'].id, debit: 0, credit: 150000, description: 'Pago a proveedor' },
      ]},
    },
  })

  // 3. Daily sales revenue (aggregated)
  const salesEntry = await prisma.journalEntry.create({
    data: {
      tenantId: tenant.id, entryDate: new Date(periodStart.getTime() + 2 * 86400000), description: 'Ventas del día', reference: 'POS-001', entryType: 'automatic', status: 'posted', periodId: period.id,
      lines: { create: [
        { accountId: accMap['1101'].id, debit: 15000, credit: 0, description: 'Efectivo + tarjetas' },
        { accountId: accMap['4101'].id, debit: 0, credit: 12931, description: 'Venta de alimentos' },
        { accountId: accMap['2102'].id, debit: 0, credit: 2069, description: 'IVA 16%' },
      ]},
    },
  })

  // 4. Cost of goods sold
  await prisma.journalEntry.create({
    data: {
      tenantId: tenant.id, entryDate: new Date(periodStart.getTime() + 2 * 86400000), description: 'COGS ventas del día', reference: 'COGS-001', entryType: 'automatic', status: 'posted', periodId: period.id,
      lines: { create: [
        { accountId: accMap['5101'].id, debit: 4500, credit: 0, description: 'Costo de alimentos vendidos' },
        { accountId: accMap['1103'].id, debit: 0, credit: 4500, description: 'Salida de inventario' },
      ]},
    },
  })

  // 5. Payroll
  await prisma.journalEntry.create({
    data: {
      tenantId: tenant.id, entryDate: new Date(periodStart.getTime() + 15 * 86400000), description: 'Nómina quincenal', reference: 'NOM-001', entryType: 'manual', status: 'posted', periodId: period.id,
      lines: { create: [
        { accountId: accMap['5201'].id, debit: 85000, credit: 0, description: 'Sueldos y salarios brutos' },
        { accountId: accMap['2102'].id, debit: 0, credit: 6800, description: 'IVA retenido' },
        { accountId: accMap['1101'].id, debit: 0, credit: 78200, description: 'Pago neto a empleados' },
      ]},
    },
  })

  // 6. Rent payment
  await prisma.journalEntry.create({
    data: {
      tenantId: tenant.id, entryDate: new Date(periodStart.getTime() + 5 * 86400000), description: 'Renta del mes', reference: 'RENT-001', entryType: 'manual', status: 'posted', periodId: period.id,
      lines: { create: [
        { accountId: accMap['5202'].id, debit: 35000, credit: 0, description: 'Renta local' },
        { accountId: accMap['1101'].id, debit: 0, credit: 35000, description: 'Pago de renta' },
      ]},
    },
  })

  // 7. Supplier payment (inventory)
  await prisma.journalEntry.create({
    data: {
      tenantId: tenant.id, entryDate: new Date(periodStart.getTime() + 3 * 86400000), description: 'Compra de ingredientes a proveedores', reference: 'PROV-001', entryType: 'manual', status: 'posted', periodId: period.id,
      lines: { create: [
        { accountId: accMap['1103'].id, debit: 28000, credit: 0, description: 'Ingredientes y bebidas' },
        { accountId: accMap['2101'].id, debit: 0, credit: 28000, description: 'Cuenta por pagar a proveedores' },
      ]},
    },
  })

  // 8. Draft entry (not yet posted)
  await prisma.journalEntry.create({
    data: {
      tenantId: tenant.id, entryDate: new Date(), description: 'Estimación gastos publicidad', reference: 'EST-001', entryType: 'manual', status: 'draft', periodId: period.id,
      lines: { create: [
        { accountId: accMap['5204'].id, debit: 8000, credit: 0, description: 'Campaña redes sociales' },
        { accountId: accMap['2101'].id, debit: 0, credit: 8000, description: 'Pendiente de pago' },
      ]},
    },
  })

  // ─── Stock movements for some ingredients ─────────────────
  await prisma.stockMovement.createMany({
    data: [
      { ingredientId: ings.wagyu.id, type: 'in', quantity: 20, reference: 'ORD-001', notes: 'Compra semanal' },
      { ingredientId: ings.wagyu.id, type: 'out', quantity: 3, reference: 'COGS-001', notes: 'Usado en pedidos' },
      { ingredientId: ings.salmon.id, type: 'in', quantity: 15, reference: 'ORD-002', notes: 'Compra semanal' },
      { ingredientId: ings.tomate.id, type: 'in', quantity: 10, reference: 'ORD-003', notes: 'Verdura fresca' },
      { ingredientId: ings.tomate.id, type: 'out', quantity: 2.5, reference: 'COGS-002', notes: 'Consumo cocina' },
      { ingredientId: ings.limon.id, type: 'in', quantity: 10, reference: 'ORD-004', notes: 'Cítricos' },
      { ingredientId: ings.huevo.id, type: 'in', quantity: 60, reference: 'ORD-005', notes: 'Huevo fresco' },
      { ingredientId: ings.huevo.id, type: 'out', quantity: 12, reference: 'COGS-003', notes: 'Usado en Carbonara' },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log(`   Tenant: ${tenant.name}`)
  console.log('   Admin: admin@lacocina.com / admin123')
  console.log(`   Accounts: ${coa.length} created`)
  console.log(`   Menu items: ${menuItems.length}`)
  console.log(`   Employees: ${employees.length}`)
  console.log(`   Customers: ${customerDefs.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
