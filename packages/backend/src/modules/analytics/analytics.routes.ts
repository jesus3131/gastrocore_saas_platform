import { Router } from 'express'
import { analyticsController } from './analytics.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'

const router = Router()

router.use(authGuard)

router.get('/sales', analyticsController.getSalesSummary)
router.get('/bcg-matrix', analyticsController.getBcgMatrix)
router.get('/performance', analyticsController.getPerformance)
router.get('/peak-hours', analyticsController.getPeakHours)
router.get('/multi-branch', analyticsController.getMultiBranchReport)

export { router as analyticsRouter }
