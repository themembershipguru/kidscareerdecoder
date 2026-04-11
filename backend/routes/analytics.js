import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { listChildrenSummary, getChildAnalytics } from '../controllers/analyticsController.js'

const router = Router()

router.use(verifyToken, requireRole('parent'))

router.get('/children', listChildrenSummary)
router.get('/child/:childId', getChildAnalytics)

export default router
