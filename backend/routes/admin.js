import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { getAdminSummary } from '../controllers/adminController.js'

const router = Router()

router.use(verifyToken, requireRole('admin'))
router.get('/summary', getAdminSummary)

export default router
