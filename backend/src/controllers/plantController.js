import db from '../config/db.js'

export function getAllPlants(req, res, next) {
  try {
    const plants = db.prepare(`
      SELECT p.*, COUNT(ps.id) as stages_count
      FROM plants p
      LEFT JOIN plant_stages ps ON p.id = ps.plant_id
      GROUP BY p.id
      ORDER BY p.id ASC
    `).all()

    return res.json({ plants })
  } catch (err) {
    next(err)
  }
}

export function getPlantById(req, res, next) {
  try {
    const { id } = req.params
    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(id)

    if (!plant) {
      return res.status(404).json({ error: 'Растение не найдено' })
    }

    const stages = db.prepare(`
      SELECT * FROM plant_stages
      WHERE plant_id = ?
      ORDER BY stage_order ASC
    `).all(id)

    const parsedStages = stages.map(st => ({
      ...st,
      game_payload: JSON.parse(st.game_payload_json)
    }))

    return res.json({ plant, stages: parsedStages })
  } catch (err) {
    next(err)
  }
}
