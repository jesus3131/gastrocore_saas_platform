import { injectable } from 'tsyringe'
import { prisma } from '../../config/database/prisma.js'
import { AppError } from '../../common/filters/error-handler.js'

@injectable()
export class MenuService {
  async getFullMenu(tenantId: string) {
    return prisma.menuCategory.findMany({
      where: { tenantId },
      include: {
        menuItems: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    })
  }

  async getCategoryById(tenantId: string, id: string) {
    const cat = await prisma.menuCategory.findFirst({ where: { id, tenantId } })
    if (!cat) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Categoría no encontrada')
    return cat
  }

  async createCategory(tenantId: string, data: { name: string; sortOrder?: number; isActive?: boolean }) {
    return prisma.menuCategory.create({ data: { ...data, tenantId } })
  }

  async updateCategory(tenantId: string, id: string, data: { name?: string; sortOrder?: number; isActive?: boolean }) {
    await this.getCategoryById(tenantId, id)
    return prisma.menuCategory.update({ where: { id }, data })
  }

  async deleteCategory(tenantId: string, id: string) {
    await this.getCategoryById(tenantId, id)
    const itemCount = await prisma.menuItem.count({ where: { categoryId: id } })
    if (itemCount > 0) {
      throw new AppError(400, 'CATEGORY_HAS_ITEMS', `La categoría tiene ${itemCount} plato(s). Reasigna o elimínalos primero.`)
    }
    return prisma.menuCategory.delete({ where: { id } })
  }

  async getItemById(tenantId: string, id: string) {
    const item = await prisma.menuItem.findFirst({ where: { id, tenantId } })
    if (!item) throw new AppError(404, 'ITEM_NOT_FOUND', 'Plato no encontrado')
    return { ...item, price: Number(item.price), cost: item.cost ? Number(item.cost) : null }
  }

  async createItem(tenantId: string, data: any) {
    await this.getCategoryById(tenantId, data.categoryId)
    return prisma.menuItem.create({ data: { ...data, tenantId } })
  }

  async updateItem(tenantId: string, id: string, data: any) {
    await this.getItemById(tenantId, id)
    return prisma.menuItem.update({ where: { id }, data })
  }

  async deleteItem(tenantId: string, id: string) {
    await this.getItemById(tenantId, id)
    return prisma.menuItem.delete({ where: { id } })
  }
}
