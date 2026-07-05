import { Router } from 'express'
import { imagesController } from './images.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'
import { requirePermission } from '../../common/guards/permission.guard.js'
import { upload } from '../../common/middleware/upload.middleware.js'

const router = Router()

router.use(authGuard)

router.post('/upload', requirePermission('inventory:write'), upload.single('file'), imagesController.upload)
router.delete('/:entityType/:id', requirePermission('inventory:write'), imagesController.remove)

export { router as imagesRouter }
