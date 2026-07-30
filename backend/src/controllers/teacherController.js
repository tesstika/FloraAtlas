import db from '../config/db.js'

export function getGroups(req, res, next) {
  try {
    const groups = db.prepare(`
      SELECT DISTINCT group_name
      FROM users
      WHERE role = 'student'
      ORDER BY group_name ASC
    `).all()

    return res.json({ groups: groups.map(g => g.group_name) })
  } catch (err) {
    next(err)
  }
}

export function getStudentsByGroup(req, res, next) {
  try {
    const { group_name } = req.query
    let query = `SELECT id, name, email, group_name FROM users WHERE role = 'student'`
    const params = []

    if (group_name) {
      query += ` AND group_name = ?`
      params.push(group_name)
    }

    const students = db.prepare(query).all(...params)
    return res.json({ students })
  } catch (err) {
    next(err)
  }
}

export function getStudentObservations(req, res, next) {
  try {
    const { student_id } = req.params
    const observations = db.prepare(`
      SELECT o.*, p.name as plant_name, p.icon as plant_icon, u.name as student_name
      FROM user_plant_observations o
      JOIN plants p ON o.plant_id = p.id
      JOIN users u ON o.user_id = u.id
      WHERE o.user_id = ?
    `).all(student_id)

    return res.json({ observations })
  } catch (err) {
    next(err)
  }
}

export function updateStudentObservation(req, res, next) {
  try {
    const { id } = req.params
    const { health, current_stage_index } = req.body

    const observation = db.prepare('SELECT * FROM user_plant_observations WHERE id = ?').get(id)
    if (!observation) {
      return res.status(404).json({ error: 'Наблюдение не найдено' })
    }

    const updatedHealth = health !== undefined ? Math.max(0, Math.min(100, Number(health))) : observation.health
    const updatedStage = current_stage_index !== undefined ? Number(current_stage_index) : observation.current_stage_index

    db.prepare(`
      UPDATE user_plant_observations
      SET health = ?, current_stage_index = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(updatedHealth, updatedStage, id)

    return res.json({
      message: 'Параметры наблюдения студента обновлены',
      observation_id: id,
      health: updatedHealth,
      current_stage_index: updatedStage
    })
  } catch (err) {
    next(err)
  }
}

export function updatePlantContent(req, res, next) {
  try {
    const { id } = req.params
    const { name, description, stages_count, region_name } = req.body

    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(id)
    if (!plant) {
      return res.status(404).json({ error: 'Растение не найдено' })
    }

    db.prepare(`
      UPDATE plants
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          stages_count = COALESCE(?, stages_count),
          region_name = COALESCE(?, region_name)
      WHERE id = ?
    `).run(name, description, stages_count, region_name, id)

    return res.json({ message: 'Карточка растения успешно обновлена' })
  } catch (err) {
    next(err)
  }
}
