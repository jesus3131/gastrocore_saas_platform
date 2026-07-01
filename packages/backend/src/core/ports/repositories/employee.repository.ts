export interface EmployeeRepository {
  create(tenantId: string, data: any): Promise<any>
  findById(tenantId: string, id: string): Promise<any>
  findMany(tenantId: string): Promise<any[]>
  update(tenantId: string, id: string, data: any): Promise<any>
  countActive(tenantId: string): Promise<number>
}
