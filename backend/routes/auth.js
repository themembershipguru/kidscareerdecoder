import { Router } from 'express'
import {
  registerParent,
  loginParent,
  addChild,
  getChildren,
} from '../controllers/authController.js'
import { verifyToken, requireRole } from '../middleware/auth.js'

const router = Router()

router.post('/register', registerParent)
router.post('/login', loginParent)
router.post('/add-child', verifyToken, requireRole('parent'), addChild)
router.get('/children', verifyToken, requireRole('parent'), getChildren)

export default router
