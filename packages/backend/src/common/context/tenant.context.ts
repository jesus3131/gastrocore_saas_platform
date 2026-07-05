import { AsyncLocalStorage } from 'async_hooks'

export class TenantContext {
  private static storage = new AsyncLocalStorage<string | null>()

  static run<T>(tenantId: string | null, fn: () => T): T {
    return this.storage.run(tenantId, fn)
  }

  static getId(): string | null {
    return this.storage.getStore() ?? null
  }
}
