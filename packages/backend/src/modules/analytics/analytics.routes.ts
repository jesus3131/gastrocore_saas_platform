import { Router } from 'express'
import { AnalyticsController } from './analytics.controller.js'
import { authGuard } from '../../common/guards/auth.guard.js'

const router = Router()
const controller = new AnalyticsController()

router.use(authGuard)

router.get('/sales', controller.getSalesSummary.bind(controller))
router.get('/bcg-matrix', controller.getBcgMatrix.bind(controller))
router.get('/performance', controller.getPerformance.bind(controller))
router.get('/peak-hours', controller.getPeakHours.bind(controller))
router.get('/multi-branch', controller.getMultiBranchReport.bind(controller))

export { router as analyticsRouter }
