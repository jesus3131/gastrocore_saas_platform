export interface AccountingPeriodRepository {
  findMany(tenantId: string): Promise<any[]>
  findFirst(where: any): Promise<any>
  create(data: any): Promise<any>
  update(id: string, data: any): Promise<any>
}
