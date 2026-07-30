import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'

export function register(req, res, next) {
  try {
    const { name, email, password, role = 'student', group_name = 'БИО-101' } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Заполните обязательные поля: name, email, password' })
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' })
    }

    const passwordHash = bcrypt.hashSync(password, 10)
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, group_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, passwordHash, role, group_name)

    const userId = result.lastInsertRowid
    const token = jwt.sign(
      { id: userId, name, email, role, group_name },
      process.env.JWT_SECRET || 'flora_atlas_secret_key',
      { expiresIn: '7d' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(201).json({
      message: 'Успешная регистрация',
      user: { id: userId, name, email, role, group_name },
      token
    })
  } catch (err) {
    next(err)
  }
}

export function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Укажите email и пароль' })
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, group_name: user.group_name },
      process.env.JWT_SECRET || 'flora_atlas_secret_key',
      { expiresIn: '7d' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      message: 'Успешный вход',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, group_name: user.group_name },
      token
    })
  } catch (err) {
    next(err)
  }
}

export function me(req, res, next) {
  try {
    const user = db.prepare('SELECT id, name, email, role, group_name, created_at FROM users WHERE id = ?').get(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }
    return res.json({ user })
  } catch (err) {
    next(err)
  }
}

export function logout(req, res) {
  res.clearCookie('token')
  return res.json({ message: 'Успешный выход из системы' })
}
