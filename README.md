# 🛍️ Microservices Online Store

Микросервисный интернет-магазин на стеке **Java 17 / Spring Boot 3 / Spring Cloud / Apache Kafka / PostgreSQL / Docker Compose**.

Проект построен по архитектурному паттерну **Database per Service** с синхронным межсервисным взаимодействием через **OpenFeign** и асинхронной шиной событий через **Apache Kafka**.

---

## 🏛️ Архитектура системы

```
HTTP Клиент (Postman / Browser / Frontend)
                    |
                    v
    +-----------------------------------------------+
    |              API Gateway :8080                |
    |  - Реактивный роутинг (Spring Cloud Gateway)   |
    |  - Валидация JWT (GlobalFilter)               |
    |  - Обогащение заголовками:                    |
    |    * X-User-Id                                |
    |    * X-User-Role                              |
    |    * X-User-Email                             |
    +-----------------------------------------------+
          |                 |                |
          v                 v                v
   +--------------+  +--------------+  +--------------+
   | auth-service |  |product-servic|  |order-service |
   |    :8081     |  |    :8082     |  |    :8083     |
   +--------------+  +--------------+  +--------------+
          |                 |                |        \
          v                 v                v         \ [Feign SYNC]
    postgres-auth    postgres-product  postgres-order   v
        :5432             :5433            :5434    product-service
                                             |
                                             v [Kafka ASYNC: order-events]
                                       +-----------------------+
                                       | notification-service  |
                                       |        :8084          |
                                       +-----------------------+
```

---

## 📦 Сервисы и Порты

| Сервис | Порт | Ответственность | База данных | Межсервисные связи |
|--------|------|-----------------|-------------|--------------------|
| `api-gateway` | 8080 | Единая точка входа, роутинг, валидация JWT | Нет | Downstream вызовы к сервисам |
| `auth-service` | 8081 | Регистрация, аутентификация, выдача/обновление JWT | `postgres-auth:5432` (`authdb`) | — |
| `product-service` | 8082 | Каталог товаров, остатки (stock), резерв | `postgres-product:5433` (`productdb`) | Вызывается из `order-service` |
| `order-service` | 8083 | Оформление заказов, проверка остатков, откат при сбоях | `postgres-order:5434` (`orderdb`) | Feign к `product-service`, Kafka Producer |
| `notification-service` | 8084 | Приём событий о заказах, логирование отправки email | Нет | Kafka Consumer топика `order-events` |

---

## 🚀 Быстрый запуск

### 1. Сборка всех сервисов (Maven)

```bash
mvn clean package -DskipTests
```

### 2. Запуск в Docker Compose

```bash
docker compose up -d --build
```

Все 5 сервисов, Kafka, Zookeeper и 3 независимых базы PostgreSQL будут развернуты с автоматической проверкой healthcheck и инициализацией таблиц и тестовых данных.

### 3. Проверка статуса контейнеров

```bash
docker compose ps
```

---

## 🔌 API Endpoints & Сценарии проверки

Все запросы направляются через **API Gateway (`http://localhost:8080`)**.

### 1. Регистрация пользователя

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "ivan", "email": "ivan@example.com", "password": "password123"}'
```

### 2. Логин и получение JWT

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "ivan", "password": "password123"}'
```

В ответе возвращается `accessToken` и `refreshToken`.

### 3. Просмотр каталога товаров (публичный GET-запрос)

```bash
curl -X GET "http://localhost:8080/api/products"
```

### 4. Оформление заказа (требуется JWT)

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"productId": "b0000000-0000-0000-0000-000000000001", "quantity": 2}'
```

**Ответ 201 Created**:
```json
{
  "id": "...",
  "userId": "...",
  "status": "PENDING",
  "total": 4998.00,
  "items": [
    {
      "productId": "b0000000-0000-0000-0000-000000000001",
      "productName": "MacBook Pro 16 M3",
      "quantity": 2,
      "price": 2499.00
    }
  ],
  "createdAt": "..."
}
```

### 5. Попытка заказать больше доступного остатка (409 Conflict)

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"productId": "b0000000-0000-0000-0000-000000000001", "quantity": 999}'
```

**Ответ 409 Conflict**:
```json
{
  "error": "OUT_OF_STOCK",
  "message": "Запрошено 999, доступно 8",
  "status": 409
}
```

### 6. Проверка логов `notification-service` (Kafka Event)

```bash
docker compose logs notification-service
```
Лог содержит:
```
=== EMAIL CONFIRMATION ===
To: ivan@example.com
Subject: Order #... Confirmed
Product: MacBook Pro 16 M3 x 2
Total: 4998.00
===========================
```

---

## 🧪 Запуск всех тестов

```bash
mvn test
```

Включает:
- Модульные тесты `auth-service` (BCrypt, генерация токенов, валидация)
- Модульные тесты `product-service` (дельта-изменение stock, OutOfStockException)
- Модульные тесты `order-service` (синхронный Feign, откат транзакций, отправка событий Kafka)
- Интеграционный тест `notification-service` с `@EmbeddedKafka`
- Реактивные фильтры `api-gateway`
