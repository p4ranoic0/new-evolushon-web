CREATE TABLE IF NOT EXISTS users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(40) NOT NULL UNIQUE,
 email VARCHAR(160) NULL,
 name VARCHAR(80) NOT NULL,
 role ENUM('admin','editor','fotografo') NOT NULL,
 password_hash VARCHAR(100) NOT NULL,
 active TINYINT(1) NOT NULL DEFAULT 1,
 failed_attempts INT UNSIGNED NOT NULL DEFAULT 0,
 locked_until DATETIME(3) NULL,
 last_login_at DATETIME(3) NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS sessions (
 token_hash CHAR(64) PRIMARY KEY,
 user_id INT NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 last_seen_at DATETIME(3) NOT NULL,
 expires_at DATETIME(3) NOT NULL,
 ip VARCHAR(45) NULL, user_agent VARCHAR(255) NULL,
 INDEX ix_sessions_user(user_id), INDEX ix_sessions_expires(expires_at),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS site_versions (
 id INT AUTO_INCREMENT PRIMARY KEY,
 status ENUM('draft','published','archived') NOT NULL,
 version INT NOT NULL DEFAULT 1,
 data JSON NOT NULL, summary JSON NULL,
 created_by INT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 published_at DATETIME(3) NULL,
 current_status VARCHAR(16) GENERATED ALWAYS AS (CASE WHEN status IN ('draft','published') THEN status ELSE NULL END) STORED,
 UNIQUE KEY ux_current_version(current_status),
 INDEX ix_versions_status(status,published_at),
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS photos (
 id VARCHAR(40) PRIMARY KEY, sha256 CHAR(64) NOT NULL,
 mime VARCHAR(40) NOT NULL, original_name VARCHAR(255) NULL,
 original_bytes INT UNSIGNED NOT NULL,
 width SMALLINT UNSIGNED NOT NULL, height SMALLINT UNSIGNED NOT NULL,
 variants JSON NOT NULL, bytes INT UNSIGNED NOT NULL,
 uploaded_by INT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), deleted_at DATETIME(3) NULL,
 INDEX ix_photos_sha(sha256), INDEX ix_photos_deleted(deleted_at),
 FOREIGN KEY(uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS bookings (
 code CHAR(10) PRIMARY KEY,
 idempotency_key CHAR(36) NULL UNIQUE,
 service_id VARCHAR(40) NOT NULL, service_name VARCHAR(120) NOT NULL, service_name_es VARCHAR(120) NOT NULL,
 cat ENUM('surf','surfskate','trip') NOT NULL,
 opt VARCHAR(10) NOT NULL, persons TINYINT UNSIGNED NOT NULL,
 date DATE NOT NULL, time VARCHAR(10) NOT NULL,
 name VARCHAR(120) NOT NULL, email VARCHAR(160) NOT NULL, phone VARCHAR(40) NOT NULL,
 level VARCHAR(20) NOT NULL, class_lang ENUM('es','en','fr','de') NOT NULL,
 notes TEXT NULL, method ENUM('card','yape','plin') NOT NULL, currency VARCHAR(4) NOT NULL,
 total DECIMAL(10,2) NOT NULL, due DECIMAL(10,2) NOT NULL, paid DECIMAL(10,2) NOT NULL DEFAULT 0,
 status ENUM('pendiente','por verificar','pagada','completada','cancelada') NOT NULL,
 lang ENUM('es','en','fr','de') NOT NULL, source ENUM('web','admin','import') NOT NULL DEFAULT 'web', ip VARCHAR(45) NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 INDEX ix_bookings_slot(cat,date,time,status), INDEX ix_bookings_status(status,date),
 INDEX ix_bookings_created(created_at), INDEX ix_bookings_email(email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS booking_events (
 id INT AUTO_INCREMENT PRIMARY KEY, booking_code CHAR(10) NOT NULL, user_id INT NULL,
 from_status VARCHAR(20) NULL, to_status VARCHAR(20) NOT NULL,
 paid DECIMAL(10,2) NULL, note VARCHAR(255) NULL,
 at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 INDEX ix_events_booking(booking_code),
 FOREIGN KEY(booking_code) REFERENCES bookings(code) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
