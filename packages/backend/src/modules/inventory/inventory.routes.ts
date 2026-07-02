import { Router } from 'express'
import { InventoryController } from './inventory.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission, requireFullAuth } from '../../common/guards/permission.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createIngredientSchema, updateIngredientSchema, createRecipeSchema, updateRecipeSchema } from './inventory.validation.js'

const router = Router()
const controller = new InventoryController()

router.use(authGuard)

router.get('/ingredients', requirePermission('inventory:read'), controller.getIngredients.bind(controller))
router.post('/ingredients', requirePermission('inventory:write'), requireFullAuth, validate(createIngredientSchema), controller.createIngredient.bind(controller))
router.put('/ingredients/:id', requirePermission('inventory:write'), requireFullAuth, validate(updateIngredientSchema), controller.updateIngredient.bind(controller))
router.get('/recipes', requirePermission('inventory:read'), controller.getRecipes.bind(controller))
router.post('/recipes', requirePermission('inventory:write'), requireFullAuth, validate(createRecipeSchema), controller.createRecipe.bind(controller))
router.put('/recipes/:id', requirePermission('inventory:write'), requireFullAuth, validate(updateRecipeSchema), controller.updateRecipe.bind(controller))
router.get('/recipes/:menuItemId', requirePermission('inventory:read'), controller.getRecipeByItem.bind(controller))
router.get('/stock/alerts', requirePermission('inventory:read'), controller.getStockAlerts.bind(controller))
router.get('/stock/movements', requirePermission('inventory:read'), controller.getStockMovements.bind(controller))

export { router as inventoryRouter }
