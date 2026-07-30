import jwt from 'jsonwebtoken'

export function authenticateToken(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'flora_atlas_secret_key')
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Недействительный или истекший токен' })
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Доступ запрещен. Требуется роль: ${role}` })
    }
    next()
  }
}
