import { Router } from 'express'
import {
  getGroups,
  getStudentsByGroup,
  getStudentObservations,
  updateStudentObservation,
  updatePlantContent
} from '../controllers/teacherController.js'
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

router.use(authenticateToken, requireRole('teacher'))

router.get('/groups', getGroups)
router.get('/students', getStudentsByGroup)
router.get('/student-observations/:student_id', getStudentObservations)
router.patch('/observations/:id', updateStudentObservation)
router.put('/plants/:id', updatePlantContent)

export default router
