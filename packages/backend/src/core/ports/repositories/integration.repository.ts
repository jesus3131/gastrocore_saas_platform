export interface IntegrationRepository {
  findMany(tenantId: string, type?: string): Promise<any[]>
  findFirst(where: any): Promise<any>
  findUnique(where: any): Promise<any>
  create(data: any): Promise<any>
  update(id: string, data: any): Promise<any>
  delete(id: string): Promise<any>
}
