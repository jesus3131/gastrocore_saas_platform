import type { Request, Response } from 'express'
import { container } from 'tsyringe'
import { LocalStorageProvider } from '../../infrastructure/storage/storage.service.js'
import { PrismaMenuRepository } from '../../infrastructure/persistence/repositories/prisma-menu.repository.js'
import { AppError } from '../../common/filters/error-handler.js'
import { wrapAsync } from '../../common/utils/async-handler.js'
import { PrismaUnitOfWork } from '../../infrastructure/persistence/unit-of-work.js'
import { prisma } from '../../config/database/prisma.js'

class ImagesController {
  private storage = container.resolve(LocalStorageProvider)
  private menuRepo = new PrismaMenuRepository()

  async upload(req: Request, res: Response) {
    if (!req.file) throw new AppError(400, 'NO_FILE', 'No file uploaded')

    const entityType = req.body.entityType as string
    const entityId = req.body.entityId as string

    if (!entityType || !entityId) {
      throw new AppError(400, 'MISSING_FIELDS', 'entityType and entityId are required')
    }

    const validTypes = ['menu-item', 'ingredient']
    if (!validTypes.includes(entityType)) {
      throw new AppError(400, 'INVALID_ENTITY_TYPE', `entityType must be one of: ${validTypes.join(', ')}`)
    }

    const client = PrismaUnitOfWork.getTransaction() || prisma

    // Delete old image if it exists
    if (entityType === 'menu-item') {
      const item = await client.menuItem.findUnique({ where: { id: entityId }, select: { imageUrl: true } })
      if (item?.imageUrl) await this.storage.deleteImage(item.imageUrl)
    } else {
      const ing = await client.ingredient.findUnique({ where: { id: entityId }, select: { imageUrl: true } })
      if (ing?.imageUrl) await this.storage.deleteImage(ing.imageUrl)
    }

    const url = await this.storage.saveImage(req.file.buffer, req.file.originalname, entityType)

    if (entityType === 'menu-item') {
      await this.menuRepo.updateMenuItem(entityId, { imageUrl: url })
    } else if (entityType === 'ingredient') {
      await client.ingredient.update({ where: { id: entityId }, data: { imageUrl: url } })
    }

    res.json({ success: true, data: { url } })
  }

  async remove(req: Request, res: Response) {
    const entityType = req.params.entityType as string
    const entityId = req.params.id as string

    const validTypes = ['menu-item', 'ingredient']
    if (!validTypes.includes(entityType)) {
      throw new AppError(400, 'INVALID_ENTITY_TYPE', `entityType must be one of: ${validTypes.join(', ')}`)
    }

    const client = PrismaUnitOfWork.getTransaction() || prisma
    let currentImageUrl: string | null = null

    if (entityType === 'menu-item') {
      const item = await client.menuItem.findUnique({ where: { id: entityId }, select: { imageUrl: true } })
      currentImageUrl = item?.imageUrl ?? null
    } else {
      const ing = await client.ingredient.findUnique({ where: { id: entityId }, select: { imageUrl: true } })
      currentImageUrl = ing?.imageUrl ?? null
    }

    if (currentImageUrl) {
      await this.storage.deleteImage(currentImageUrl)
    }

    if (entityType === 'menu-item') {
      await this.menuRepo.updateMenuItem(entityId, { imageUrl: null })
    } else {
      await client.ingredient.update({ where: { id: entityId }, data: { imageUrl: null } })
    }

    res.json({ success: true, data: null })
  }
}

export const imagesController = wrapAsync(new ImagesController())
export { ImagesController }
