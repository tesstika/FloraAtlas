import { Router } from 'express'
import {
  getUserObservations,
  startObservation,
  getObservationDetails,
  useFertilizer,
  completeStage
} from '../controllers/observationController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(authenticateToken)

router.get('/', getUserObservations)
router.post('/', startObservation)
router.get('/:id', getObservationDetails)
router.post('/:id/use-fertilizer', useFertilizer)
router.post('/:id/complete-stage', completeStage)

export default router
