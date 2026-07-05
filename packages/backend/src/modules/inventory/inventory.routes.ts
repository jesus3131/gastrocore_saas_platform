import { Router } from 'express'
import { inventoryController } from './inventory.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createIngredientSchema, updateIngredientSchema, createRecipeSchema, updateRecipeSchema } from './inventory.validation.js'

const router = Router()

router.use(authGuard)

router.get('/ingredients', requirePermission('inventory:read'), inventoryController.getIngredients)
router.post('/ingredients', requirePermission('inventory:write'), requireFullAuth, validate(createIngredientSchema), inventoryController.createIngredient)
router.put('/ingredients/:id', requirePermission('inventory:write'), requireFullAuth, validate(updateIngredientSchema), inventoryController.updateIngredient)
router.get('/recipes', requirePermission('inventory:read'), inventoryController.getRecipes)
router.post('/recipes', requirePermission('inventory:write'), requireFullAuth, validate(createRecipeSchema), inventoryController.createRecipe)
router.put('/recipes/:id', requirePermission('inventory:write'), requireFullAuth, validate(updateRecipeSchema), inventoryController.updateRecipe)
router.get('/recipes/:menuItemId', requirePermission('inventory:read'), inventoryController.getRecipeByItem)
router.get('/stock/alerts', requirePermission('inventory:read'), inventoryController.getStockAlerts)
router.get('/stock/movements', requirePermission('inventory:read'), inventoryController.getStockMovements)

export { router as inventoryRouter }
