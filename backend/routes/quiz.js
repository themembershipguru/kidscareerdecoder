import { Router } from 'express'
import { listPublishedQuizzes, getQuizBySlug } from '../controllers/quizController.js'

const router = Router()

router.get('/', listPublishedQuizzes)
router.get('/:slug', getQuizBySlug)

export default router
