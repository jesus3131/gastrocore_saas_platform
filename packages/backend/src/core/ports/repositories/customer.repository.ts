export interface CustomerRepository {
  findMany(tenantId: string, opts?: any): Promise<any[]>
  findFirst(where: any): Promise<any>
  create(data: any): Promise<any>
  update(id: string, data: any): Promise<any>
  count(where: any): Promise<number>
  groupBy(tenantId: string, field: string): Promise<any[]>
}
