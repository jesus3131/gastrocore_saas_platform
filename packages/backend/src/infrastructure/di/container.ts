import { container } from 'tsyringe'
import type { UnitOfWork } from '../../core/ports/unit-of-work.js'
import type { EventBus } from '../../core/ports/event-bus.js'
import type { EventStore } from '../../core/ports/event-store.js'
import type { OrderRepository } from '../../core/ports/repositories/order.repository.js'
import type { MenuRepository } from '../../core/ports/repositories/menu.repository.js'
import type { InventoryRepository } from '../../core/ports/repositories/inventory.repository.js'
import type { TableRepository } from '../../core/ports/repositories/table.repository.js'
import type { EmployeeRepository } from '../../core/ports/repositories/employee.repository.js'
import type { TenantRepository } from '../../core/ports/repositories/tenant.repository.js'
import type { UserRepository } from '../../core/ports/repositories/user.repository.js'
import type { CustomerRepository } from '../../core/ports/repositories/customer.repository.js'
import type { LoyaltyRepository } from '../../core/ports/repositories/loyalty.repository.js'
import type { AccountRepository } from '../../core/ports/repositories/account.repository.js'
import type { JournalRepository } from '../../core/ports/repositories/journal.repository.js'
import type { AccountingPeriodRepository } from '../../core/ports/repositories/accounting-period.repository.js'
import type { SubscriptionRepository } from '../../core/ports/repositories/subscription.repository.js'
import type { IntegrationRepository } from '../../core/ports/repositories/integration.repository.js'
import type { AnalyticsRepository } from '../../core/ports/repositories/analytics.repository.js'
import type { PaymentRepository } from '../../core/ports/repositories/payment.repository.js'
import type { RefreshTokenRepository } from '../../core/ports/repositories/refresh-token.repository.js'
import { PrismaUnitOfWork } from '../persistence/unit-of-work.js'
import { OutboxEventBus } from '../events/outbox-event-bus.js'
import { PrismaEventStore } from '../persistence/repositories/prisma-event-store.js'
import { PrismaOrderRepository } from '../persistence/repositories/prisma-order.repository.js'
import { PrismaMenuRepository } from '../persistence/repositories/prisma-menu.repository.js'
import { PrismaInventoryRepository } from '../persistence/repositories/prisma-inventory.repository.js'
import { PrismaTableRepository } from '../persistence/repositories/prisma-table.repository.js'
import { PrismaEmployeeRepository } from '../persistence/repositories/prisma-employee.repository.js'
import { PrismaTenantRepository } from '../persistence/repositories/prisma-tenant.repository.js'
import { PrismaUserRepository } from '../persistence/repositories/prisma-user.repository.js'
import { PrismaCustomerRepository } from '../persistence/repositories/prisma-customer.repository.js'
import { PrismaLoyaltyRepository } from '../persistence/repositories/prisma-loyalty.repository.js'
import { PrismaAccountRepository } from '../persistence/repositories/prisma-account.repository.js'
import { PrismaJournalRepository } from '../persistence/repositories/prisma-journal.repository.js'
import { PrismaAccountingPeriodRepository } from '../persistence/repositories/prisma-accounting-period.repository.js'
import { PrismaSubscriptionRepository } from '../persistence/repositories/prisma-subscription.repository.js'
import { PrismaIntegrationRepository } from '../persistence/repositories/prisma-integration.repository.js'
import { PrismaAnalyticsRepository } from '../persistence/repositories/prisma-analytics.repository.js'
import { PrismaRefreshTokenRepository } from '../persistence/repositories/prisma-refresh-token.repository.js'
import { PrismaPaymentRepository } from '../persistence/repositories/prisma-payment.repository.js'
import { CreateOrderUseCase } from '../../core/use-cases/pos/create-order.use-case.js'
import { CreateEmployeeUseCase } from '../../core/use-cases/hr/create-employee.use-case.js'
import { UpdateFeaturesUseCase } from '../../core/use-cases/tenants/update-features.use-case.js'
import { RedeemPointsUseCase } from '../../core/use-cases/crm/redeem-points.use-case.js'
import { CreateIngredientUseCase } from '../../core/use-cases/inventory/create-ingredient.use-case.js'
import { GetSalesSummaryUseCase } from '../../core/use-cases/analytics/get-sales-summary.use-case.js'
import { ChangePlanUseCase } from '../../core/use-cases/subscriptions/change-plan.use-case.js'
import { CreateJournalEntryUseCase } from '../../core/use-cases/accounting/create-journal-entry.use-case.js'
import { ConnectDeliveryUseCase } from '../../core/use-cases/integrations/connect-delivery.use-case.js'
import { RegisterTenantUseCase } from '../../core/use-cases/auth/register-tenant.use-case.js'
import { CreateCompanyUseCase } from '../../core/use-cases/super-admin/create-company.use-case.js'
import { CompleteOnboardingUseCase } from '../../core/use-cases/onboarding/complete-onboarding.use-case.js'
import { PosService } from '../../modules/pos/pos.service.js'
import { AuthService } from '../../modules/auth/auth.service.js'
import { AccountingService } from '../../modules/accounting/accounting.service.js'
import { AnalyticsService } from '../../modules/analytics/analytics.service.js'
import { CrmService } from '../../modules/crm/crm.service.js'
import { HrService } from '../../modules/hr/hr.service.js'
import { InventoryService } from '../../modules/inventory/inventory.service.js'
import { IntegrationService } from '../../modules/integrations/integration.service.js'
import { OnboardingService } from '../../modules/onboarding/onboarding.service.js'
import { SubscriptionService } from '../../modules/subscriptions/subscription.service.js'
import { SuperAdminService } from '../../modules/super-admin/super-admin.service.js'
import { TenantService } from '../../modules/tenants/tenant.service.js'

export function registerDependencies() {
  container.registerSingleton<UnitOfWork>('UnitOfWork', PrismaUnitOfWork)
  const eventBus = new OutboxEventBus()
  container.registerInstance<EventBus>('EventBus', eventBus)
  container.registerInstance<OutboxEventBus>(OutboxEventBus, eventBus)
  container.registerSingleton<EventStore>('EventStore', PrismaEventStore)

  // Repositories
  container.registerSingleton<OrderRepository>('OrderRepository', PrismaOrderRepository)
  container.registerSingleton<MenuRepository>('MenuRepository', PrismaMenuRepository)
  container.registerSingleton<InventoryRepository>('InventoryRepository', PrismaInventoryRepository)
  container.registerSingleton<TableRepository>('TableRepository', PrismaTableRepository)
  container.registerSingleton<EmployeeRepository>('EmployeeRepository', PrismaEmployeeRepository)
  container.registerSingleton<TenantRepository>('TenantRepository', PrismaTenantRepository)
  container.registerSingleton<UserRepository>('UserRepository', PrismaUserRepository)
  container.registerSingleton<CustomerRepository>('CustomerRepository', PrismaCustomerRepository)
  container.registerSingleton<LoyaltyRepository>('LoyaltyRepository', PrismaLoyaltyRepository)
  container.registerSingleton<AccountRepository>('AccountRepository', PrismaAccountRepository)
  container.registerSingleton<JournalRepository>('JournalRepository', PrismaJournalRepository)
  container.registerSingleton<AccountingPeriodRepository>('AccountingPeriodRepository', PrismaAccountingPeriodRepository)
  container.registerSingleton<SubscriptionRepository>('SubscriptionRepository', PrismaSubscriptionRepository)
  container.registerSingleton<IntegrationRepository>('IntegrationRepository', PrismaIntegrationRepository)
  container.registerSingleton<AnalyticsRepository>('AnalyticsRepository', PrismaAnalyticsRepository)
  container.registerSingleton<RefreshTokenRepository>('RefreshTokenRepository', PrismaRefreshTokenRepository)
  container.registerSingleton<PaymentRepository>('PaymentRepository', PrismaPaymentRepository)

  // Services
  container.registerSingleton(PosService)
  container.registerSingleton(AuthService)
  container.registerSingleton(AccountingService)
  container.registerSingleton(AnalyticsService)
  container.registerSingleton(CrmService)
  container.registerSingleton(HrService)
  container.registerSingleton(InventoryService)
  container.registerSingleton(IntegrationService)
  container.registerSingleton(OnboardingService)
  container.registerSingleton(SubscriptionService)
  container.registerSingleton(SuperAdminService)
  container.registerSingleton(TenantService)

  // Use Cases
  container.registerSingleton(CreateOrderUseCase)
  container.registerSingleton(CreateEmployeeUseCase)
  container.registerSingleton(UpdateFeaturesUseCase)
  container.registerSingleton(RedeemPointsUseCase)
  container.registerSingleton(CreateIngredientUseCase)
  container.registerSingleton(GetSalesSummaryUseCase)
  container.registerSingleton(ChangePlanUseCase)
  container.registerSingleton(CreateJournalEntryUseCase)
  container.registerSingleton(ConnectDeliveryUseCase)
  container.registerSingleton(RegisterTenantUseCase)
  container.registerSingleton(CreateCompanyUseCase)
  container.registerSingleton(CompleteOnboardingUseCase)
}

export { container }
