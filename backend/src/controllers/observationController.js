import db from '../config/db.js'

export function getUserObservations(req, res, next) {
  try {
    const userId = req.user.id
    const observations = db.prepare(`
      SELECT o.*, p.name as plant_name, p.icon as plant_icon, p.description as plant_description
      FROM user_plant_observations o
      JOIN plants p ON o.plant_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.updated_at DESC
    `).all(userId)

    return res.json({ observations })
  } catch (err) {
    next(err)
  }
}

export function startObservation(req, res, next) {
  try {
    const userId = req.user.id
    const { plant_id, time_mode = 'virtual' } = req.body

    if (!plant_id) {
      return res.status(400).json({ error: 'Укажите plant_id' })
    }

    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(plant_id)
    if (!plant) {
      return res.status(404).json({ error: 'Растение не найдено' })
    }

    const existing = db.prepare(`
      SELECT * FROM user_plant_observations
      WHERE user_id = ? AND plant_id = ? AND status = 'active'
    `).get(userId, plant_id)

    if (existing) {
      return res.json({ message: 'Наблюдение за этим растением уже активно', observation: existing })
    }

    const result = db.prepare(`
      INSERT INTO user_plant_observations (user_id, plant_id, time_mode, health, fertilizer_count, current_stage_index)
      VALUES (?, ?, ?, 100, 0, 0)
    `).run(userId, plant_id, time_mode)

    const observation = db.prepare('SELECT * FROM user_plant_observations WHERE id = ?').get(result.lastInsertRowid)

    return res.status(201).json({ message: 'Наблюдение успешно создано', observation })
  } catch (err) {
    next(err)
  }
}

export function getObservationDetails(req, res, next) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const observation = db.prepare(`
      SELECT o.*, p.name as plant_name, p.icon as plant_icon, p.description as plant_description
      FROM user_plant_observations o
      JOIN plants p ON o.plant_id = p.id
      WHERE o.id = ? AND (o.user_id = ? OR ? = 'teacher')
    `).get(id, userId, req.user.role)

    if (!observation) {
      return res.status(404).json({ error: 'Наблюдение не найдено' })
    }

    const stages = db.prepare(`
      SELECT * FROM plant_stages
      WHERE plant_id = ?
      ORDER BY stage_order ASC
    `).all(observation.plant_id)

    const parsedStages = stages.map(st => ({
      ...st,
      game_payload: JSON.parse(st.game_payload_json)
    }))

    return res.json({ observation, stages: parsedStages })
  } catch (err) {
    next(err)
  }
}

export function useFertilizer(req, res, next) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const observation = db.prepare(`
      SELECT * FROM user_plant_observations
      WHERE id = ? AND user_id = ?
    `).get(id, userId)

    if (!observation) {
      return res.status(404).json({ error: 'Наблюдение не найдено' })
    }

    if (observation.fertilizer_count <= 0) {
      return res.status(400).json({ error: 'У вас нет доступных удобрений' })
    }

    if (observation.health >= 100) {
      return res.status(400).json({ error: 'Здоровье растения уже на максимуме (100%)' })
    }

    const newHealth = Math.min(100, observation.health + 15)
    const newFertilizer = observation.fertilizer_count - 1

    db.prepare(`
      UPDATE user_plant_observations
      SET health = ?, fertilizer_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newHealth, newFertilizer, id)

    return res.json({
      message: 'Удобрение успешно применено! Здоровье восстановлено.',
      health: newHealth,
      fertilizer_count: newFertilizer
    })
  } catch (err) {
    next(err)
  }
}

export function completeStage(req, res, next) {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { is_passed, score = 0 } = req.body

    const observation = db.prepare(`
      SELECT * FROM user_plant_observations
      WHERE id = ? AND user_id = ?
    `).get(id, userId)

    if (!observation) {
      return res.status(404).json({ error: 'Наблюдение не найдено' })
    }

    const stages = db.prepare(`
      SELECT * FROM plant_stages
      WHERE plant_id = ?
      ORDER BY stage_order ASC
    `).all(observation.plant_id)

    const currentStage = stages[observation.current_stage_index]
    if (!currentStage) {
      return res.status(400).json({ error: 'Недействительный этап развития' })
    }

    let healthDelta = 0
    let fertilizerAwarded = 0
    let newHealth = observation.health
    let newFertilizer = observation.fertilizer_count
    let newStageIndex = observation.current_stage_index

    if (is_passed) {
      fertilizerAwarded = currentStage.fertilizer_reward || 1
      newFertilizer += fertilizerAwarded
      if (newStageIndex < stages.length - 1) {
        newStageIndex += 1
      }
    } else {
      healthDelta = -(currentStage.health_penalty || 10)
      newHealth = Math.max(0, observation.health + healthDelta)
    }

    db.prepare(`
      INSERT INTO stage_attempts (observation_id, stage_id, is_passed, score, health_delta, fertilizer_awarded)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, currentStage.id, is_passed ? 1 : 0, score, healthDelta, fertilizerAwarded)

    db.prepare(`
      UPDATE user_plant_observations
      SET health = ?, fertilizer_count = ?, current_stage_index = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newHealth, newFertilizer, newStageIndex, id)

    return res.json({
      message: is_passed ? 'Задание успешно выполнено!' : 'Ответ неверный. Здоровье снижено.',
      is_passed,
      health: newHealth,
      fertilizer_count: newFertilizer,
      current_stage_index: newStageIndex,
      rewarded_fertilizer: fertilizerAwarded,
      health_penalty: healthDelta
    })
  } catch (err) {
    next(err)
  }
}
