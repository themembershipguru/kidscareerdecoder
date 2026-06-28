import { Router } from 'express'
import {
  registerParent,
  loginParent,
  getDemoAccounts,
  demoLogin,
  addChild,
  getChildren,
} from '../controllers/authController.js'
import {
  requestPasswordReset,
  resetPasswordWithToken,
} from '../controllers/passwordResetController.js'
import { verifyToken, requireAnyRole } from '../middleware/auth.js'

const router = Router()

router.post('/register', registerParent)
router.post('/login', loginParent)
router.get('/demo-accounts', getDemoAccounts)
router.post('/demo-login', demoLogin)
router.post('/forgot-password', requestPasswordReset)
router.post('/reset-password', resetPasswordWithToken)
router.post('/add-child', verifyToken, requireAnyRole(['parent', 'admin']), addChild)
router.get('/children', verifyToken, requireAnyRole(['parent', 'admin']), getChildren)

export default router
