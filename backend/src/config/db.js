import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import dotenv from 'dotenv'

dotenv.config()

const dbPath = process.env.DB_PATH || './data/flora_atlas.db'
const resolvedPath = path.resolve(dbPath)
const dbDir = path.dirname(resolvedPath)

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new Database(resolvedPath)

db.pragma('journal_mode = WAL')
db.pragma('busy_timeout = 5000')

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'teacher')) NOT NULL DEFAULT 'student',
      group_name TEXT DEFAULT 'БИО-101',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT NOT NULL,
      stages_count INTEGER NOT NULL DEFAULT 4,
      region_name TEXT NOT NULL,
      map_x_percent REAL DEFAULT 50.0,
      map_y_percent REAL DEFAULT 50.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS plant_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL,
      stage_order INTEGER NOT NULL,
      title TEXT NOT NULL,
      icon TEXT NOT NULL,
      theory_text TEXT NOT NULL,
      game_type TEXT CHECK(game_type IN ('quiz', 'match', 'grouping', 'crossword', 'table')) NOT NULL DEFAULT 'quiz',
      game_payload_json TEXT NOT NULL,
      event_notice TEXT NOT NULL,
      health_penalty INTEGER DEFAULT 10,
      fertilizer_reward INTEGER DEFAULT 1,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_plant_observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plant_id INTEGER NOT NULL,
      time_mode TEXT CHECK(time_mode IN ('virtual', 'real')) DEFAULT 'virtual',
      health INTEGER NOT NULL DEFAULT 100,
      fertilizer_count INTEGER NOT NULL DEFAULT 0,
      current_stage_index INTEGER NOT NULL DEFAULT 0,
      status TEXT CHECK(status IN ('active', 'completed')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS stage_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      observation_id INTEGER NOT NULL,
      stage_id INTEGER NOT NULL,
      is_passed BOOLEAN NOT NULL,
      score INTEGER DEFAULT 0,
      health_delta INTEGER DEFAULT 0,
      fertilizer_awarded INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (observation_id) REFERENCES user_plant_observations(id) ON DELETE CASCADE,
      FOREIGN KEY (stage_id) REFERENCES plant_stages(id) ON DELETE CASCADE
    );
  `)
}

export default db
