import bcrypt from 'bcryptjs'
import db from '../config/db.js'

export function seedDatabase() {
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count
  if (usersCount === 0) {
    const passwordHash = bcrypt.hashSync('123456', 10)

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, group_name)
      VALUES (?, ?, ?, ?, ?)
    `)

    insertUser.run('Анна Иванова', 'student@example.ru', passwordHash, 'student', 'БИО-101')
    insertUser.run('Павел Смирнов', 'smirnov@example.ru', passwordHash, 'student', 'БИО-101')
    insertUser.run('Профессор Петров', 'teacher@example.ru', passwordHash, 'teacher', 'Кафедра ботаники')
  }

  const plantsCount = db.prepare('SELECT COUNT(*) as count FROM plants').get().count
  if (plantsCount === 0) {
    const insertPlant = db.prepare(`
      INSERT INTO plants (name, icon, description, stages_count, region_name, map_x_percent, map_y_percent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const insertStage = db.prepare(`
      INSERT INTO plant_stages (plant_id, stage_order, title, icon, theory_text, game_type, game_payload_json, event_notice, health_penalty, fertilizer_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const spruce = insertPlant.run(
      'Ель',
      '🌲',
      'Хвойное дерево, устойчивое к холодному климату. Подробно визуализировано в интерактивной платформе FloraAtlas.',
      6,
      'Северная и умеренная зона',
      30.0,
      72.0
    )
    const spruceId = spruce.lastInsertRowid

    const spruceStages = [
      {
        order: 1,
        title: 'Посадка семени',
        icon: '🌰',
        theory: 'Семя — начальная стадия развития растения. Для успешного прорастания нужны влажность, воздух и подходящая температура.',
        game_type: 'quiz',
        game_payload: JSON.stringify({
          question: 'Что необходимо для успешного прорастания семени ели?',
          options: [
            'Только солнечный свет',
            'Влага, воздух и подходящая температура',
            'Только минеральные удобрения'
          ],
          correct: 'Влага, воздух и подходящая температура'
        }),
        event: 'Событие: проверка условий посадки. Ошибка уменьшит здоровье на 10 баллов.'
      },
      {
        order: 2,
        title: 'Прорастание',
        icon: '🌱',
        theory: 'При прорастании формируется корешок и первый побег. Растение начинает использовать запас питательных веществ семени.',
        game_type: 'match',
        game_payload: JSON.stringify({
          question: 'Сопоставьте симптомы проблем с соответствующими действиями ухода.',
          pairs: [
            { left: 'Пожелтение хвойных иголок', right: 'Нормализация влажности' },
            { left: 'Застой воды у корней', right: 'Обеспечение дренажа' },
            { left: 'Увядание молодого побега', right: 'Проверка температуры грунта' }
          ]
        }),
        event: 'Событие: переувлажнение. Нужно определить признаки избытка влаги.'
      },
      {
        order: 3,
        title: 'Молодой росток',
        icon: '🌿',
        theory: 'Росток формирует первые фотосинтезирующие органы и становится более зависимым от освещения.',
        game_type: 'grouping',
        game_payload: JSON.stringify({
          question: 'Распределите элементы на группы вредителей и методов защиты.',
          groups: [
            { name: 'Вредители', items: ['Еловый пилильщик', 'Тля гермес', 'Короед'] },
            { name: 'Меры защиты', items: ['Биологические препараты', 'Санитарная обрезка', 'Привлечение птиц'] }
          ]
        }),
        event: 'Событие: насекомые-вредители. Нужно распределить меры защиты по группам.'
      },
      {
        order: 4,
        title: 'Развитие саженца',
        icon: '🪴',
        theory: 'Саженец укрепляет корневую систему и постепенно наращивает побеги.',
        game_type: 'crossword',
        game_payload: JSON.stringify({
          question: 'Отгадайте термины по описанию:',
          clues: [
            { number: 1, clue: 'Зелёный пигмент для фотосинтеза', answer: 'ХЛОРОФИЛЛ' },
            { number: 2, clue: 'Орган поглощения воды', answer: 'КОРЕНЬ' },
            { number: 3, clue: 'Видоизмененный лист ели', answer: 'ХВОИНКА' }
          ]
        }),
        event: 'Событие: град. Решите задание, чтобы избежать потери 10 баллов здоровья.'
      },
      {
        order: 5,
        title: 'Молодое дерево',
        icon: '🌲',
        theory: 'Молодое дерево активно растет, формирует крону и адаптируется к внешним условиям.',
        game_type: 'table',
        game_payload: JSON.stringify({
          question: 'Соотнесите заболевания, причины и методы лечения.',
          rows: [
            { symptom: 'Побурение хвои (шютте)', cause: 'Грибковая инфекция', treatment: 'Фунгицидная обработка' },
            { symptom: 'Усыхание верхушечного побега', cause: 'Недостаток питательных веществ', treatment: 'Внесение удобрений' }
          ]
        }),
        event: 'Событие: болезнь. Нужно соотнести симптомы и способы ухода.'
      },
      {
        order: 6,
        title: 'Взрослое дерево',
        icon: '🌲',
        theory: 'Взрослое дерево участвует в экосистеме, образует семена и влияет на окружающую среду.',
        game_type: 'quiz',
        game_payload: JSON.stringify({
          question: 'Как сохранить лесной массив во время зимних праздников?',
          options: [
            'Вырубать дикорастущие ели в лесу',
            'Использовать искусственные ели или растения в контейнерах',
            'Сжигать сухие ветви на участке'
          ],
          correct: 'Использовать искусственные ели или растения в контейнерах'
        }),
        event: 'Событие: культурные традиции. Нужно выбрать безопасные альтернативы вырубке ели.'
      }
    ]

    spruceStages.forEach(st => {
      insertStage.run(
        spruceId,
        st.order,
        st.title,
        st.icon,
        st.theory,
        st.game_type,
        st.game_payload,
        st.event,
        10,
        1
      )
    })

    const baobab = insertPlant.run(
      'Баобаб',
      '🌳',
      'Дерево засушливых регионов с массивным стволом, накапливающим влагу.',
      4,
      'Африканская саванна',
      22.0,
      28.0
    )
    const sequoia = insertPlant.run(
      'Секвойя',
      '🌲',
      'Одно из самых высоких деревьев, растущее в условиях влажного климата.',
      4,
      'Северная Америка',
      68.0,
      20.0
    )
    const coffee = insertPlant.run(
      'Кофе',
      '☕',
      'Культурное растение, важное для пищевой промышленности и сельского хозяйства.',
      4,
      'Тропические регионы',
      54.0,
      62.0
    )

    const genericStages = [
      { order: 1, title: 'Посадка семени', icon: '🌰', theory: 'Начальная стадия развития семени.' },
      { order: 2, title: 'Прорастание', icon: '🌱', theory: 'Формирование первых корешков и ростка.' },
      { order: 3, title: 'Активный рост', icon: '🌿', theory: 'Формирование листьев и ствола.' },
      { order: 4, title: 'Зрелое растение', icon: '🌳', theory: 'Полная адаптация к природной среде.' }
    ]

    ;[baobab.lastInsertRowid, sequoia.lastInsertRowid, coffee.lastInsertRowid].forEach(pId => {
      genericStages.forEach(st => {
        insertStage.run(
          pId,
          st.order,
          st.title,
          st.icon,
          st.theory,
          'quiz',
          JSON.stringify({
            question: `Выберите оптимальное условие для этапа "${st.title}":`,
            options: ['Умеренный полив и свет', 'Избыточный полив', 'Полное отсутствие света'],
            correct: 'Умеренный полив и свет'
          }),
          'Событие: плановый уход за растением.',
          10,
          1
        )
      })
    })

    const studentUser = db.prepare('SELECT id FROM users WHERE email = ?').get('student@example.ru')
    if (studentUser) {
      db.prepare(`
        INSERT INTO user_plant_observations (user_id, plant_id, time_mode, health, fertilizer_count, current_stage_index)
        VALUES (?, ?, 'virtual', 100, 0, 0)
      `).run(studentUser.id, spruceId)
    }
  }
}
