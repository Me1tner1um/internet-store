-- Schema for postgres-auth (authdb)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
    created_at    TIMESTAMP NOT NULL DEFAULT now()
);

-- Seed initial test users:
-- Password for both users is: password123
INSERT INTO users (id, username, email, password_hash, role)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'admin', 'admin@shop.local', '$2a$10$JXLUXbA0bMbOGYTxOaf9meHsml.t5j9ZwuiXGhYfRodtRPA7aKnVC', 'ROLE_ADMIN'),
    ('a0000000-0000-0000-0000-000000000002', 'testuser', 'testuser@shop.local', '$2a$10$JXLUXbA0bMbOGYTxOaf9meHsml.t5j9ZwuiXGhYfRodtRPA7aKnVC', 'ROLE_USER')
ON CONFLICT (username) DO NOTHING;
