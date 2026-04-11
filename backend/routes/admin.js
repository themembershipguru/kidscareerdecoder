import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { getAdminSummary } from '../controllers/adminController.js'
import {
  listAdminUsers,
  getAdminUser,
  patchAdminUser,
} from '../controllers/adminUsersController.js'
import {
  listAdminSessions,
  getAdminSession,
} from '../controllers/adminSessionsController.js'
import {
  getAiStatus,
  patchAiProvider,
  clearAiProviderOverride,
} from '../controllers/adminSettingsController.js'
import { getAttributionBreakdown } from '../controllers/adminAnalyticsController.js'
import { getAdminInsights } from '../controllers/adminInsightsController.js'
import {
  listAdminQuizzes,
  getAdminQuiz,
  createAdminQuiz,
  patchAdminQuiz,
  deleteAdminQuiz,
  createAdminQuestion,
  patchAdminQuestion,
  deleteAdminQuestion,
  createAdminOption,
  patchAdminOption,
  deleteAdminOption,
  labelQuizDifficultyWithOpenAI,
} from '../controllers/adminQuizzesController.js'

const router = Router()

router.use(verifyToken, requireRole('admin'))

router.get('/summary', getAdminSummary)
router.get('/insights', getAdminInsights)

router.get('/users', listAdminUsers)
router.get('/users/:id', getAdminUser)
router.patch('/users/:id', patchAdminUser)

router.get('/sessions', listAdminSessions)
router.get('/sessions/:id', getAdminSession)

router.get('/ai-status', getAiStatus)
router.patch('/settings/ai-provider', patchAiProvider)
router.delete('/settings/ai-provider', clearAiProviderOverride)

router.get('/analytics/attribution', getAttributionBreakdown)

router.get('/quizzes', listAdminQuizzes)
router.post('/quizzes', createAdminQuiz)
router.get('/quizzes/:id', getAdminQuiz)
router.patch('/quizzes/:id', patchAdminQuiz)
router.delete('/quizzes/:id', deleteAdminQuiz)
router.post('/quizzes/:id/label-difficulty-openai', labelQuizDifficultyWithOpenAI)

router.post('/quizzes/:quizId/questions', createAdminQuestion)
router.patch('/quizzes/:quizId/questions/:questionId', patchAdminQuestion)
router.delete('/quizzes/:quizId/questions/:questionId', deleteAdminQuestion)

router.post(
  '/quizzes/:quizId/questions/:questionId/options',
  createAdminOption,
)
router.patch(
  '/quizzes/:quizId/questions/:questionId/options/:optionId',
  patchAdminOption,
)
router.delete(
  '/quizzes/:quizId/questions/:questionId/options/:optionId',
  deleteAdminOption,
)

export default router
