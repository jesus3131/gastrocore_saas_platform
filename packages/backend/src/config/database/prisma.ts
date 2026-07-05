import { PrismaClient } from '@prisma/client'
import { env } from '../env.js'
import { logger } from '../logger.js'
import { TenantContext } from '../../common/context/tenant.context.js'

const TENANT_SCOPED = new Set([
  'Branch', 'MenuCategory', 'MenuItem', 'Order', 'Payment',
  'Ingredient', 'StockMovement', 'Employee', 'Shift', 'Commission',
  'Customer', 'LoyaltyProgram', 'TenantFeatureFlag',
  'Subscription', 'Integration', 'Account', 'JournalEntry',
  'AccountingPeriod', 'Invoice', 'UserPermission',
])

const baseClient = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['warn', 'error'],
})

function extendWithTenant(client: any): any {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          const tenantId = TenantContext.getId()
          if (!tenantId || !TENANT_SCOPED.has(model)) {
            return query(args)
          }

          if (operation === 'create' && args.data && !args.data.tenantId) {
            args.data.tenantId = tenantId
          }
          if (operation === 'createMany' && args.data) {
            const items = Array.isArray(args.data) ? args.data : [args.data]
            for (const item of items) {
              if (!item.tenantId) item.tenantId = tenantId
            }
          }
          if (operation === 'upsert') {
            if (args.create && !args.create.tenantId) args.create.tenantId = tenantId
            if (args.update && !args.update.tenantId) args.update.tenantId = tenantId
          }

          const scopeOps = new Set(['findUnique', 'findFirst', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany', 'count', 'aggregate'])
          if (scopeOps.has(operation) && args.where && !args.where.tenantId) {
            if (operation === 'findUnique') {
              args.where = { ...args.where, tenantId }
            } else {
              args.where.tenantId = tenantId
            }
          }

          return query(args)
        },
      },
    },
  })
}

export const prisma: PrismaClient = extendWithTenant(baseClient) as any

export function getRawClient(): PrismaClient {
  return baseClient
}

export function createScopedTransactionClient(client: any): any {
  try {
    if (client && typeof client.$extends === 'function') {
      return extendWithTenant(client)
    }
  } catch {
    // Transaction client may not support $extends
  }
  return client
}

export async function connectDatabase() {
  try {
    await baseClient.$connect()
    logger.info('Database connected successfully')
  } catch (error) {
    logger.error(error, 'Failed to connect to database')
    process.exit(1)
  }
}

export async function disconnectDatabase() {
  await baseClient.$disconnect()
  logger.info('Database disconnected')
}
