import { Router } from 'express'
import { menuController } from './menu.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import {
  createCategorySchema,
  updateCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
} from './menu.validation.js'

const router = Router()

router.use(authGuard)

router.get('/', requirePermission('menu:read'), menuController.getFullMenu)
router.get('/categories/:id', requirePermission('menu:read'), menuController.getCategory)
router.post('/categories', requirePermission('menu:write'), validate(createCategorySchema), menuController.createCategory)
router.put('/categories/:id', requirePermission('menu:write'), validate(updateCategorySchema), menuController.updateCategory)
router.delete('/categories/:id', requirePermission('menu:delete'), menuController.deleteCategory)
router.get('/items/:id', requirePermission('menu:read'), menuController.getItem)
router.post('/items', requirePermission('menu:write'), validate(createMenuItemSchema), menuController.createItem)
router.put('/items/:id', requirePermission('menu:write'), validate(updateMenuItemSchema), menuController.updateItem)
router.delete('/items/:id', requirePermission('menu:delete'), menuController.deleteItem)

export { router as menuRouter }
