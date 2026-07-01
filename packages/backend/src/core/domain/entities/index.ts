export interface PaginationOpts {
  limit?: number
  offset?: number
}

export interface PosOrder {
  id: string
  tenantId: string
  branchId?: string | null
  tableId?: string | null
  customerId?: string | null
  userId?: string | null
  status: string
  type: string
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  items?: PosOrderItem[]
  table?: any | null
  customer?: any | null
}

export interface PosOrderItem {
  id: string
  orderId: string
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string | null
  modifiers?: PosOrderItemModifier[]
}

export interface PosOrderItemModifier {
  id: string
  orderItemId: string
  groupId: string
  optionId: string
  name: string
  price: number
}

export interface PosPayment {
  id: string
  orderId: string
  method: string
  amount: number
  reference?: string | null
  status: string
  metadata?: any
  createdAt: Date
}

export interface MenuCategory {
  id: string
  tenantId: string
  name: string
  sortOrder: number
  isActive: boolean
  menuItems?: MenuItem[]
  modifiers?: ModifierGroup[]
}

export interface MenuItem {
  id: string
  tenantId: string
  categoryId: string
  name: string
  description?: string | null
  price: number
  cost?: number | null
  imageUrl?: string | null
  available: boolean
  sortOrder: number
  recipes?: InventoryRecipe[]
}

export interface ModifierGroup {
  id: string
  categoryId: string
  name: string
  required: boolean
  maxSelections: number
  sortOrder: number
  options?: ModifierOption[]
}

export interface ModifierOption {
  id: string
  groupId: string
  name: string
  price: number
  sortOrder: number
}

export interface PosTable {
  id: string
  branchId: string
  areaId: string
  label: string
  capacity: number
  status: string
  xPos?: number | null
  yPos?: number | null
}

export interface Branch {
  id: string
  tenantId: string
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  isActive: boolean
  areas?: ServiceArea[]
  tables?: PosTable[]
}

export interface ServiceArea {
  id: string
  branchId: string
  name: string
  type: string
  sortOrder: number
  tables?: PosTable[]
}

export interface InventoryIngredient {
  id: string
  tenantId: string
  name: string
  sku: string
  category: string
  unit: string
  currentStock: number
  minimumStock: number
  unitCost: number
  supplier?: string | null
  isActive: boolean
}

export interface InventoryRecipe {
  id: string
  menuItemId: string
  name: string
  servings: number
  wastePercentage: number
  instructions?: string | null
  ingredients?: RecipeIngredient[]
  menuItem?: any | null
}

export interface RecipeIngredient {
  id: string
  recipeId: string
  ingredientId: string
  quantity: number
  ingredient?: InventoryIngredient
  name?: string
  unit?: string
}

export interface StockMovement {
  id: string
  ingredientId: string
  type: string
  quantity: number
  reference?: string | null
  notes?: string | null
  createdAt: Date
  ingredient?: { id: string; name: string; sku: string; unit: string }
}

export interface HrEmployee {
  id: string
  tenantId: string
  name: string
  email: string
  phone?: string | null
  role: string
  pinCode?: string | null
  isActive: boolean
  hourlyRate?: number | null
  commissionPct?: number | null
  hireDate: Date
  shifts?: Shift[]
}

export interface Shift {
  id: string
  employeeId: string
  date: Date
  startTime: Date
  endTime?: Date | null
  status: string
  notes?: string | null
  employee?: { id: string; name: string; role: string }
}

export interface Commission {
  id: string
  employeeId: string
  orderId?: string | null
  amount: number
  rate: number
  status: string
  employee?: { id: string; name: string }
}

export interface CrmCustomer {
  id: string
  tenantId: string
  name: string
  email?: string | null
  phone?: string | null
  totalVisits: number
  totalSpent: number
  loyaltyPoints: number
  loyaltyTier: string
  lastVisitAt?: Date | null
  segment: string
  tags: string[]
  notes?: string | null
  metadata?: any
}

export interface LoyaltyProgram {
  id: string
  tenantId: string
  name: string
  pointsPerUnit: number
  unitPerPoint: number
  isActive: boolean
  tiers?: any
}

export interface LoyaltyRedemption {
  id: string
  customerId: string
  programId: string
  points: number
  reward: string
  status: string
}

export interface AuthUser {
  id: string
  tenantId?: string | null
  email: string
  passwordHash: string
  name: string
  role: string
  isActive: boolean
  lastLoginAt?: Date | null
  refreshToken?: RefreshTokenEntity | null
}

export interface Tenant {
  id: string
  name: string
  slug: string
  businessType: string
  subscriptionPlan: string
  subscriptionStatus: string
  locale: string
  timezone: string
  currency: string
  settings?: any
  customFields?: any
}

export interface RefreshTokenEntity {
  id: string
  userId: string
  tokenHash: string
  family: string
  expiresAt: Date
  revokedAt?: Date | null
}

export interface AccountEntry {
  id: string
  tenantId: string
  code: string
  name: string
  type: string
  subtype?: string | null
  parentId?: string | null
  isActive: boolean
  isSystem: boolean
}

export interface JournalEntryEntity {
  id: string
  tenantId: string
  entryDate: Date
  description: string
  reference?: string | null
  entryType: string
  status: string
  createdBy?: string | null
  approvedBy?: string | null
  periodId?: string | null
  period?: { id: string; name: string }
  lines?: JournalLineEntity[]
}

export interface JournalLineEntity {
  id: string
  journalEntryId: string
  accountId: string
  debit: number
  credit: number
  description?: string | null
  account?: AccountEntry
}

export interface AccountingPeriodEntity {
  id: string
  tenantId: string
  name: string
  startDate: Date
  endDate: Date
  isClosed: boolean
  closedAt?: Date | null
}

export interface SubscriptionEntity {
  id: string
  tenantId: string
  plan: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialEndsAt?: Date | null
  canceledAt?: Date | null
}

export interface SubscriptionInvoiceEntity {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  status: string
  stripeInvoiceId?: string | null
  periodStart: Date
  periodEnd: Date
  paidAt?: Date | null
}

export interface IntegrationEntity {
  id: string
  tenantId: string
  provider: string
  type: string
  enabled: boolean
  config?: any
}

export interface TenantFeatureFlagEntity {
  id: string
  tenantId: string
  feature: string
  enabled: boolean
  config?: any
}
