import { Router } from 'express'
import { verifyToken, requireAnyRole } from '../middleware/auth.js'
import { listChildrenSummary, getChildAnalytics } from '../controllers/analyticsController.js'

const router = Router()

router.use(verifyToken, requireAnyRole(['parent', 'admin']))

router.get('/children', listChildrenSummary)
router.get('/child/:childId', getChildAnalytics)

export default router
