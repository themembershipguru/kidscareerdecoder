import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import {
  startSession,
  submitAnswer,
  completeSession,
  getSession,
} from '../controllers/sessionController.js'

const router = Router()

router.post('/start', verifyToken, startSession)
router.post('/:sessionId/answer', verifyToken, submitAnswer)
router.post('/:sessionId/complete', verifyToken, completeSession)
router.get('/:sessionId', verifyToken, getSession)

export default router
