// ─── Business Types ──────────────────────────────────────────

export type BusinessType = 'fine_dining' | 'fast_food' | 'cafe' | 'food_truck' | 'bar' | 'franchise' | 'bakery' | 'ghost_kitchen'

export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise'

export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'canceled' | 'paused'

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'canceled'

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mercadopago' | 'stripe'

export type EmployeeRole = 'super_admin' | 'admin' | 'manager' | 'chef' | 'waiter' | 'cashier' | 'host' | 'delivery' | 'accountant'

export type ShiftStatus = 'scheduled' | 'checked_in' | 'on_break' | 'checked_out' | 'absent'

// ─── Feature Flag Types ──────────────────────────────────────

export type FeatureFlag =
  | 'kds'              // Kitchen Display System
  | 'online_ordering'  // Online order reception
  | 'bcg_matrix'       // BCG Menu Analysis
  | 'loyalty_program'  // Customer loyalty/rewards
  | 'multi_branch'     // Multi-branch management
  | 'inventory_auto'   // Automatic inventory deduction
  | 'hr_scheduling'    // Staff scheduling
  | 'crm_full'         // Full CRM with segmentation
  | 'delivery_integration' // Delivery platform integration
  | 'table_management' // Interactive table map
  | 'split_bills'      // Bill splitting
  | 'electronic_invoice' // Electronic invoicing
  | 'pos'              // Point of Sale
  | 'analytics'        // Analytics & reports
  | 'accounting'       // Accounting module

// ─── Feature Flag Configuration ──────────────────────────────

export interface FeatureFlagConfig {
  feature: FeatureFlag
  enabled: boolean
  config?: Record<string, unknown>
}

// ─── Tenant Types ────────────────────────────────────────────

export interface TenantConfig {
  id: string
  name: string
  businessType: BusinessType
  subscriptionPlan: SubscriptionPlan
  subscriptionStatus: SubscriptionStatus
  features: FeatureFlagConfig[]
  settings: Record<string, unknown>
  customFields: Record<string, unknown>
  locale: string
  timezone: string
  currency: string
}

// ─── API Response Types ──────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ─── User / Auth Types ───────────────────────────────────────

export interface JwtPayload {
  sub: string          // user id
  tenantId?: string
  role: EmployeeRole
  email: string
  authMethod?: 'password' | 'pin'
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// ─── POS Types ───────────────────────────────────────────────

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  modifiers?: ModifierGroup[]
  imageUrl?: string
  available: boolean
}

export interface ModifierGroup {
  id: string
  name: string
  required: boolean
  maxSelections: number
  options: ModifierOption[]
}

export interface ModifierOption {
  id: string
  name: string
  price: number
}

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  modifiers: SelectedModifier[]
  notes?: string
}

export interface SelectedModifier {
  groupId: string
  optionId: string
  name: string
  price: number
}

export interface Order {
  id: string
  tenantId: string
  tableId?: string
  customerId?: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  taxes: number
  discount?: number
  paymentMethod?: PaymentMethod
  createdAt: Date
  updatedAt: Date
}

// ─── Inventory Types ─────────────────────────────────────────

export interface Recipe {
  id: string
  menuItemId: string
  name: string
  servings: number
  ingredients: RecipeIngredient[]
  wastePercentage: number
  totalCost: number
  suggestedPrice: number
  profitMargin: number
}

export interface RecipeIngredient {
  ingredientId: string
  name: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
}

export interface Ingredient {
  id: string
  name: string
  sku: string
  category: string
  unit: string
  currentStock: number
  minimumStock: number
  unitCost: number
  supplier?: string
}

// ─── CRM Types ───────────────────────────────────────────────

export interface Customer {
  id: string
  tenantId: string
  name: string
  email: string
  phone?: string
  totalVisits: number
  totalSpent: number
  lastVisit?: Date
  segment: string
  tags: string[]
  loyaltyPoints: number
  loyaltyTier: string
}

// ─── Analytics Types ─────────────────────────────────────────

export interface SalesSummary {
  totalRevenue: number
  totalOrders: number
  averageTicket: number
  peakHours: { hour: number, orders: number }[]
  topItems: { itemId: string, name: string, quantity: number, revenue: number }[]
}

export interface BcgMatrixItem {
  itemId: string
  name: string
  category: string
  revenue: number
  revenueShare: number
  profitMargin: number
  growthRate: number
  quadrant: 'star' | 'cash_cow' | 'question_mark' | 'dog'
}
