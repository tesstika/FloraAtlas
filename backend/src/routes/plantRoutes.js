import { Router } from 'express'
import { getAllPlants, getPlantById } from '../controllers/plantController.js'

const router = Router()

router.get('/', getAllPlants)
router.get('/:id', getPlantById)

export default router
