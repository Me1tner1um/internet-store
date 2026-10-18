CREATE TABLE IF NOT EXISTS orders (
    id         UUID PRIMARY KEY,
    user_id    UUID NOT NULL,
    status     VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total      NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id         UUID PRIMARY KEY,
    order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity   INT NOT NULL CHECK (quantity > 0),
    price      NUMERIC(12, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
