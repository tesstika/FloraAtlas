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

    if (stages_count !== undefined && Number(stages_count) > 0) {
      const targetCount = Number(stages_count)
      const existingStages = db.prepare('SELECT * FROM plant_stages WHERE plant_id = ? ORDER BY stage_order ASC').all(id)
      const currentCount = existingStages.length

      if (targetCount > currentCount) {
        const insertStage = db.prepare(`
          INSERT INTO plant_stages (plant_id, stage_order, title, icon, theory_text, game_type, game_payload_json, event_notice, health_penalty, fertilizer_reward)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10, 1)
        `)

        const icons = ['🌰', '🌱', '🌿', '🪴', '🌲', '🌳']

        for (let order = currentCount + 1; order <= targetCount; order++) {
          const icon = icons[(order - 1) % icons.length]
          insertStage.run(
            id,
            order,
            `Этап ${order}`,
            icon,
            `Теоретические материалы этапа ${order}...`,
            'quiz',
            JSON.stringify({
              question: `Вопрос по теоретическому материалу этапа ${order}:`,
              options: ['Правильный ответ', 'Неверный вариант', 'Затрудняюсь ответить'],
              correct: 'Правильный ответ'
            }),
            `Событие: плановая проверка состояния на этапе ${order}.`
          )
        }
      } else if (targetCount < currentCount) {
        db.prepare('DELETE FROM plant_stages WHERE plant_id = ? AND stage_order > ?').run(id, targetCount)
      }
    }

    return res.json({ message: 'Карточка растения и его этапы успешно обновлены' })
  } catch (err) {
    next(err)
  }
}

export function createPlant(req, res, next) {
  try {
    const { name, description, stages_count = 4, region_name = 'Центральный регион', icon = '🪴' } = req.body

    if (!name || !description) {
      return res.status(400).json({ error: 'Укажите название и описание растения' })
    }

    const numStages = Math.max(1, Number(stages_count))

    // Random map placement coordinates
    const map_x = Math.floor(Math.random() * 60) + 20
    const map_y = Math.floor(Math.random() * 50) + 25

    const plantResult = db.prepare(`
      INSERT INTO plants (name, icon, description, stages_count, region_name, map_x_percent, map_y_percent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, icon, description, numStages, region_name, map_x, map_y)

    const plantId = plantResult.lastInsertRowid

    const insertStage = db.prepare(`
      INSERT INTO plant_stages (plant_id, stage_order, title, icon, theory_text, game_type, game_payload_json, event_notice, health_penalty, fertilizer_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10, 1)
    `)

    const icons = ['🌰', '🌱', '🌿', '🪴', '🌲', '🌳']

    for (let order = 1; order <= numStages; order++) {
      const stageIcon = icons[(order - 1) % icons.length]
      insertStage.run(
        plantId,
        order,
        `Этап ${order}`,
        stageIcon,
        `Теоретический материал этапа ${order} для ${name}.`,
        'quiz',
        JSON.stringify({
          question: `Проверьте свои знания по развитию ${name} (Этап ${order}):`,
          options: ['Оптимальные условия роста', 'Избыточный полив', 'Недостаток освещения'],
          correct: 'Оптимальные условия роста'
        }),
        `Событие: плановый уход за ${name}.`
      )
    }

    const newPlant = db.prepare('SELECT * FROM plants WHERE id = ?').get(plantId)

    return res.status(201).json({
      message: 'Новое растение успешно добавлено в каталог!',
      plant: newPlant
    })
  } catch (err) {
    next(err)
  }
}
