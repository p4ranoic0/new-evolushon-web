CREATE TABLE IF NOT EXISTS google_reviews_cache (
  cache_key CHAR(64) PRIMARY KEY,
  payload JSON NULL,
  refreshed_at DATETIME(3) NULL,
  attempted_at DATETIME(3) NOT NULL,
  INDEX ix_google_cache_refresh (refreshed_at)
) ENGINE=InnoDB;
