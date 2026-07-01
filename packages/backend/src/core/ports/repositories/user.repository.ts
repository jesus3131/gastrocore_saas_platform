export interface UserRepository {
  findByEmail(email: string): Promise<any>
  findById(id: string): Promise<any>
  create(data: any): Promise<any>
  update(id: string, data: any): Promise<any>
  findFirst(where: any): Promise<any>
}
