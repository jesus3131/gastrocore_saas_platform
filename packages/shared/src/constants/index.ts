import type { BusinessType, FeatureFlag, SubscriptionPlan } from '../types'

// ─── Subscription Plans ─────────────────────────────────────

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, {
  name: string
  priceMonthly: number
  priceYearly: number
  maxUsers: number
  maxBranches: number
  maxTransactions: number
  storageGb: number
  features: FeatureFlag[]
}> = {
  basic: {
    name: 'Básico',
    priceMonthly: 49,
    priceYearly: 470,  // ~20% discount
    maxUsers: 3,
    maxBranches: 1,
    maxTransactions: 1000,
    storageGb: 5,
    features: [
      'kds',
      'table_management',
      'split_bills',
      'pos',
    ],
  },
  pro: {
    name: 'Profesional',
    priceMonthly: 129,
    priceYearly: 1238,
    maxUsers: 15,
    maxBranches: 3,
    maxTransactions: 10000,
    storageGb: 50,
    features: [
      'kds',
      'table_management',
      'split_bills',
      'online_ordering',
      'inventory_auto',
      'hr_scheduling',
      'electronic_invoice',
      'delivery_integration',
      'crm_full',
      'pos',
      'analytics',
      'accounting',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    priceMonthly: 349,
    priceYearly: 3350,
    maxUsers: 999,
    maxBranches: 999,
    maxTransactions: 999999,
    storageGb: 500,
    features: [
      'kds',
      'table_management',
      'split_bills',
      'online_ordering',
      'inventory_auto',
      'hr_scheduling',
      'electronic_invoice',
      'delivery_integration',
      'crm_full',
      'bcg_matrix',
      'loyalty_program',
      'multi_branch',
      'pos',
      'analytics',
      'accounting',
    ],
  },
}

// ─── Business Type → Default Features ───────────────────────

export const BUSINESS_TYPE_FEATURES: Record<BusinessType, FeatureFlag[]> = {
  fine_dining: ['table_management', 'split_bills', 'kds', 'crm_full', 'loyalty_program', 'bcg_matrix', 'inventory_auto', 'hr_scheduling', 'pos', 'analytics', 'accounting'],
  fast_food: ['kds', 'online_ordering', 'delivery_integration', 'inventory_auto', 'pos', 'analytics'],
  cafe: ['kds', 'online_ordering', 'loyalty_program', 'inventory_auto', 'pos', 'analytics'],
  food_truck: ['kds', 'online_ordering', 'delivery_integration', 'pos'],
  bar: ['table_management', 'split_bills', 'kds', 'loyalty_program', 'hr_scheduling', 'pos', 'analytics', 'accounting'],
  franchise: ['multi_branch', 'kds', 'table_management', 'split_bills', 'inventory_auto', 'hr_scheduling', 'bcg_matrix', 'crm_full', 'pos', 'analytics', 'accounting'],
  bakery: ['kds', 'online_ordering', 'inventory_auto', 'loyalty_program', 'pos', 'analytics'],
  ghost_kitchen: ['kds', 'online_ordering', 'delivery_integration', 'inventory_auto', 'bcg_matrix', 'pos', 'analytics'],
}

// ─── Employee Permission Matrix ──────────────────────────────

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['super:manage', 'super:companies', 'super:subscriptions', 'super:metrics'],
  admin: [
    'pos:read', 'pos:write', 'pos:delete',
    'menu:read', 'menu:write', 'menu:delete',
    'inventory:read', 'inventory:write', 'inventory:delete',
    'hr:read', 'hr:write', 'hr:delete',
    'analytics:read',
    'crm:read', 'crm:write',
    'accounting:read', 'accounting:write',
    'tenants:read', 'tenants:write',
    'reports:read',
    'delivery:read',
    'kds:read',
  ],
  manager: ['pos:read', 'pos:write', 'inventory:read', 'inventory:write', 'hr:read', 'hr:write', 'analytics:read', 'crm:read', 'crm:write'],
  chef: ['pos:read', 'inventory:read', 'inventory:write', 'kds:read'],
  waiter: ['pos:read', 'pos:write', 'crm:read'],
  cashier: ['pos:read', 'pos:write'],
  host: ['pos:read', 'crm:read'],
  delivery: ['pos:read', 'delivery:read'],
  accountant: ['analytics:read', 'accounting:read', 'accounting:write', 'crm:read', 'reports:read'],
}

// ─── Locales ─────────────────────────────────────────────────

export const SUPPORTED_LOCALES = ['es-MX', 'en-US', 'pt-BR'] as const

// ─── Currencies ──────────────────────────────────────────────

export const SUPPORTED_CURRENCIES = ['MXN', 'USD', 'BRL', 'COP', 'ARS'] as const

// ─── API Routes ──────────────────────────────────────────────

export const API_PREFIX = '/api/v1'

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  TENANTS: {
    BASE: '/tenants',
    CONFIG: '/tenants/config',
    FEATURES: '/tenants/features',
  },
  POS: {
    ORDERS: '/pos/orders',
    MENU: '/pos/menu',
    TABLES: '/pos/tables',
    PAYMENTS: '/pos/payments',
  },
  INVENTORY: {
    INGREDIENTS: '/inventory/ingredients',
    RECIPES: '/inventory/recipes',
    STOCK: '/inventory/stock',
    ALERTS: '/inventory/stock/alerts',
  },
  HR: {
    EMPLOYEES: '/hr/employees',
    SHIFTS: '/hr/shifts',
    ROLES: '/hr/roles',
    COMMISSIONS: '/hr/commissions',
  },
  ANALYTICS: {
    SALES: '/analytics/sales',
    BCG: '/analytics/bcg-matrix',
    PERFORMANCE: '/analytics/performance',
    PEAK_HOURS: '/analytics/peak-hours',
  },
  CRM: {
    CUSTOMERS: '/crm/customers',
    SEGMENTS: '/crm/segments',
    LOYALTY: '/crm/loyalty',
    REWARDS: '/crm/rewards',
  },
  INTEGRATIONS: {
    DELIVERY: '/integrations/delivery',
    PAYMENTS: '/integrations/payments',
    WEBHOOKS: '/integrations/webhooks',
  },
  SUBSCRIPTIONS: {
    BASE: '/subscriptions',
    PLANS: '/subscriptions/plans',
    INVOICES: '/subscriptions/invoices',
  },
  ONBOARDING: {
    PROFILE: '/onboarding/profile',
    AREAS: '/onboarding/areas',
    MODULES: '/onboarding/modules',
    LAUNCH: '/onboarding/launch',
  },
} as const
