export interface TableRepository {
  updateStatus(id: string, status: string): Promise<any>
  findById(id: string): Promise<any>
}
