import { Router } from 'express'
import { InventoryController } from './inventory.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { validate } from '../../common/decorators/validate.js'
import { createIngredientSchema, updateIngredientSchema, createRecipeSchema, updateRecipeSchema } from './inventory.validation.js'

const router = Router()
const controller = new InventoryController()

router.use(authGuard)

router.get('/ingredients', controller.getIngredients.bind(controller))
router.post('/ingredients', validate(createIngredientSchema), controller.createIngredient.bind(controller))
router.put('/ingredients/:id', validate(updateIngredientSchema), controller.updateIngredient.bind(controller))
router.get('/recipes', controller.getRecipes.bind(controller))
router.post('/recipes', validate(createRecipeSchema), controller.createRecipe.bind(controller))
router.put('/recipes/:id', validate(updateRecipeSchema), controller.updateRecipe.bind(controller))
router.get('/recipes/:menuItemId', controller.getRecipeByItem.bind(controller))
router.get('/stock/alerts', controller.getStockAlerts.bind(controller))
router.get('/stock/movements', controller.getStockMovements.bind(controller))

export { router as inventoryRouter }
