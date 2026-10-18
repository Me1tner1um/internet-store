import type { Order, Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'MacBook Pro 16 M3',
    description: 'Apple M3 Pro, 36GB RAM, 512GB SSD, Liquid Retina XDR display',
    price: 2499.00,
    stock: 10,
    category: 'Laptops',
    createdAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Dell XPS 15',
    description: 'Intel Core i9, 32GB RAM, 1TB SSD, 3.5K OLED Touch display',
    price: 1899.00,
    stock: 15,
    category: 'Laptops',
    createdAt: '2026-10-18T10:15:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Logitech MX Master 3S',
    description: 'Ergonomic wireless mouse with quiet clicks and 8K DPI sensor',
    price: 99.00,
    stock: 50,
    category: 'Accessories',
    createdAt: '2026-10-18T10:30:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    name: 'Keychron Q1 Pro',
    description: 'Custom mechanical keyboard wireless QMK/VIA gasket mount',
    price: 199.00,
    stock: 25,
    category: 'Accessories',
    createdAt: '2026-10-18T10:45:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    name: 'LG UltraFine 27 4K',
    description: 'IPS 4K monitor with USB-C 90W power delivery charging and DCI-P3 98%',
    price: 499.00,
    stock: 8,
    category: 'Monitors',
    createdAt: '2026-10-18T11:00:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    name: 'Sony WH-1000XM5',
    description: 'Industry Leading Wireless Noise Cancelling Headphones with Auto NC Optimizer',
    price: 349.00,
    stock: 2, // Low stock demo!
    category: 'Audio',
    createdAt: '2026-10-18T11:15:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000007',
    name: 'CalDigit TS4 Thunderbolt 4',
    description: '18-port Thunderbolt 4 dock with 98W host charging and 2.5GbE',
    price: 399.00,
    stock: 0, // Out of stock demo!
    category: 'Accessories',
    createdAt: '2026-10-18T11:30:00Z',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    userId: 'a0000000-0000-0000-0000-000000000002',
    status: 'DELIVERED',
    total: 2499.00,
    items: [
      {
        id: 'd0000000-0000-0000-0000-000000000001',
        productId: 'b0000000-0000-0000-0000-000000000001',
        productName: 'MacBook Pro 16 M3',
        quantity: 1,
        price: 2499.00,
      },
    ],
    createdAt: '2026-10-17T15:30:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    userId: 'a0000000-0000-0000-0000-000000000002',
    status: 'SHIPPED',
    total: 298.00,
    items: [
      {
        id: 'd0000000-0000-0000-0000-000000000002',
        productId: 'b0000000-0000-0000-0000-000000000003',
        productName: 'Logitech MX Master 3S',
        quantity: 1,
        price: 99.00,
      },
      {
        id: 'd0000000-0000-0000-0000-000000000003',
        productId: 'b0000000-0000-0000-0000-000000000004',
        productName: 'Keychron Q1 Pro',
        quantity: 1,
        price: 199.00,
      },
    ],
    createdAt: '2026-10-18T09:20:00Z',
  },
];

