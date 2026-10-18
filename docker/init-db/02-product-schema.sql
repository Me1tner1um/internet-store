-- Schema for postgres-product (productdb)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category    VARCHAR(100),
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Seed initial products for testing
INSERT INTO products (id, name, description, price, stock, category)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'MacBook Pro 16 M3', 'Apple M3 Pro, 36GB RAM, 512GB SSD', 2499.00, 10, 'Laptops'),
    ('b0000000-0000-0000-0000-000000000002', 'Dell XPS 15', 'Intel Core i9, 32GB RAM, 1TB SSD', 1899.00, 15, 'Laptops'),
    ('b0000000-0000-0000-0000-000000000003', 'Logitech MX Master 3S', 'Ergonomic wireless mouse with quiet clicks', 99.00, 50, 'Accessories'),
    ('b0000000-0000-0000-0000-000000000004', 'Keychron Q1 Pro', 'Custom mechanical keyboard wireless', 199.00, 25, 'Accessories'),
    ('b0000000-0000-0000-0000-000000000005', 'LG UltraFine 27 4K', 'IPS 4K monitor with USB-C 90W charging', 499.00, 8, 'Monitors')
ON CONFLICT (id) DO NOTHING;
