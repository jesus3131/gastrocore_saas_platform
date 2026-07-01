export interface AccountRepository {
  findMany(tenantId: string, opts?: any): Promise<any[]>
  findFirst(where: any): Promise<any>
  create(data: any): Promise<any>
  update(id: string, data: any): Promise<any>
  delete(id: string): Promise<any>
}
