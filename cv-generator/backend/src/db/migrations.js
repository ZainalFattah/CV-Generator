import db from './database.js';

export function initializeDatabase() {
    db.exec(`
      -- Tabel sessions percakapan
      CREATE TABLE IF NOT EXISTS sessions (
        id          TEXT PRIMARY KEY,          -- UUID
        created_at  INTEGER NOT NULL,          -- Unix timestamp
        updated_at  INTEGER NOT NULL,
        messages    TEXT NOT NULL,             -- JSON array of {role, content}
        cv_json     TEXT,                      -- JSON CV hasil ekstraksi
        completeness_score INTEGER DEFAULT 0, -- 0-100
        is_complete INTEGER DEFAULT 0         -- boolean
      );

      -- Tabel CV tersimpan
      CREATE TABLE IF NOT EXISTS cvs (
        id          TEXT PRIMARY KEY,
        session_id  TEXT,
        variant     TEXT DEFAULT 'general',    -- internship|corporate|startup|scholarship|general
        cv_data     TEXT NOT NULL,             -- JSON lengkap CV
        created_at  INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      -- Index agar query cepat
      CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at);
      CREATE INDEX IF NOT EXISTS idx_cvs_session ON cvs(session_id);
    `);
}
