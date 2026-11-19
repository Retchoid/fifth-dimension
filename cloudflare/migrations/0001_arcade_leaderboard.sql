CREATE TABLE IF NOT EXISTS arcade_leaderboard_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playerTag TEXT NOT NULL CHECK (length(playerTag) BETWEEN 1 AND 12),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100000),
  completedLevel TEXT NOT NULL CHECK (completedLevel IN ('level1', 'level2')),
  hasBonusCrown INTEGER NOT NULL DEFAULT 0 CHECK (hasBonusCrown IN (0, 1)),
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  CHECK (hasBonusCrown = 0 OR completedLevel = 'level2')
);

CREATE INDEX IF NOT EXISTS arcade_leaderboard_score_idx
  ON arcade_leaderboard_entries (score DESC, createdAt DESC);
