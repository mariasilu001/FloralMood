-- Включаем проверку внешних ключей
PRAGMA foreign_keys = ON;

-- Таблица 1: user_roles
-- AUTOINCREMENT работает только с INTEGER PRIMARY KEY
-- Поэтому role_id остается INTEGER, но остальное по твоей схеме
CREATE TABLE user_roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL
);

-- Таблица 2: users
-- DATETIME хранится в формате 'YYYY-MM-DD HH:MM:SS' [web:16][web:17]
-- datetime('now') - встроенная функция SQLite, возвращает текущую дату и время [web:16]
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id) ON DELETE RESTRICT
);

-- Таблица 3: search_history
CREATE TABLE search_history (
    query_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Таблица 4: ticket_subjects
CREATE TABLE ticket_subjects (
    subject_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL
);

-- Таблица 5: tickets
-- BOOLEAN в SQLite имеет NUMERIC affinity [web:11]
-- Можно использовать 0 для false и 1 для true
CREATE TABLE tickets (
    ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES ticket_subjects(subject_id) ON DELETE RESTRICT
);

-- Таблица 6: ticket_messages
CREATE TABLE ticket_messages (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Таблица 7: user_delivery_addresses
CREATE TABLE user_delivery_addresses (
    address_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    city VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    house VARCHAR(50) NOT NULL,
    apartment VARCHAR(50),
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Таблица 8: component_categories
CREATE TABLE component_categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    deleted_at DATETIME DEFAULT NULL
);

-- Таблица 9: components
CREATE TABLE components (
    component_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL,
    image_url VARCHAR(500),
    unit VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (category_id) REFERENCES component_categories(category_id) ON DELETE RESTRICT
);

-- Таблица 10: component_prices
-- DECIMAL(10,2) имеет NUMERIC affinity [web:12]
-- DATE хранится в формате 'YYYY-MM-DD' [web:16][web:20]
CREATE TABLE component_prices (
    price_id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (component_id) REFERENCES components(component_id) ON DELETE CASCADE
);

-- Таблица 11: bouquets
CREATE TABLE bouquets (
    bouquet_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT (datetime('now')),
    deleted_at DATETIME DEFAULT NULL,
    is_custom BOOLEAN DEFAULT 0 CHECK (is_custom IN (0, 1))
);

-- Таблица 12: bouquet_components
CREATE TABLE bouquet_components (
    bouquet_component_id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER NOT NULL,
    bouquet_id INTEGER NOT NULL,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (component_id) REFERENCES components(component_id) ON DELETE CASCADE,
    FOREIGN KEY (bouquet_id) REFERENCES bouquets(bouquet_id) ON DELETE CASCADE,
    CONSTRAINT unique_bouquet_component UNIQUE(component_id, bouquet_id)
);

-- Таблица 13: tags
CREATE TABLE tags (
    tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Таблица 14: bouquet_tags
CREATE TABLE bouquet_tags (
    bouquet_tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bouquet_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (bouquet_id) REFERENCES bouquets(bouquet_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE,
    CONSTRAINT unique_bouquet_tag UNIQUE(tag_id, bouquet_id)
);

-- Таблица 15: favorites
CREATE TABLE favorites (
    favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    bouquet_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (bouquet_id) REFERENCES bouquets(bouquet_id) ON DELETE CASCADE,
    CONSTRAINT unique_favorite_bouquet UNIQUE(user_id, bouquet_id)
);

-- Таблица 16: cart_items
CREATE TABLE cart_items (
    cart_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    bouquet_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (bouquet_id) REFERENCES bouquets(bouquet_id) ON DELETE CASCADE,
    CONSTRAINT unique_cart_item UNIQUE(user_id, bouquet_id)
);

-- Таблица 17: order_statuses
CREATE TABLE order_statuses (
    status_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Таблица 18: payment_methods
CREATE TABLE payment_methods (
    payment_method_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT 1 CHECK (is_active IN (0, 1))
);

-- Таблица 19: deliver_time_slots
-- TIME хранится в формате 'HH:MM:SS' [web:16]
CREATE TABLE deliver_time_slots (
    time_slot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- Таблица 20: orders
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status_id INTEGER NOT NULL,
    comment TEXT,
    is_hidden BOOLEAN DEFAULT 0 CHECK (is_hidden IN (0, 1)),
    address_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    payment_method_id INTEGER NOT NULL,
    delivery_date DATE NOT NULL,
    time_slot_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES order_statuses(status_id) ON DELETE RESTRICT,
    FOREIGN KEY (address_id) REFERENCES user_delivery_addresses(address_id) ON DELETE RESTRICT,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id) ON DELETE RESTRICT,
    FOREIGN KEY (time_slot_id) REFERENCES deliver_time_slots(time_slot_id) ON DELETE RESTRICT
);

-- Таблица 21: order_items
CREATE TABLE order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    bouquet_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_snapshot DECIMAL(10,2) NOT NULL CHECK (price_snapshot >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (bouquet_id) REFERENCES bouquets(bouquet_id) ON DELETE RESTRICT,
    CONSTRAINT unique_order_item UNIQUE(order_id, bouquet_id)
);

-- Таблица 22: reviews
CREATE TABLE reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    bouquet_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    created_at DATETIME DEFAULT (datetime('now')),
    changed_at DATETIME DEFAULT NULL,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (bouquet_id) REFERENCES bouquets(bouquet_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT unique_review UNIQUE(user_id, order_id, bouquet_id)
);

-- Таблица 23: review_photos
CREATE TABLE review_photos (
    photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE
);

-- Таблица 24: event_types
CREATE TABLE event_types (
    event_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL
);

-- Таблица 25: event_type_tags
CREATE TABLE event_type_tags (
    event_type_tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (event_type_id) REFERENCES event_types(event_type_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE,
    CONSTRAINT unique_event_type_tag UNIQUE(event_type_id, tag_id)
);

-- Таблица 26: events (пользовательские события)
-- Регулярное выражение проверяет формат MM-DD
CREATE TABLE events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_type_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    event_date VARCHAR(5) NOT NULL CHECK (length(event_date) = 5 AND event_date GLOB '[0-9][0-9]-[0-9][0-9]'),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_type_id) REFERENCES event_types(event_type_id) ON DELETE RESTRICT
);

-- Таблица 27: global_events (глобальные праздники)
CREATE TABLE global_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    event_date VARCHAR(5) NOT NULL CHECK (length(event_date) = 5 AND event_date GLOB '[0-9][0-9]-[0-9][0-9]'),
    FOREIGN KEY (event_type_id) REFERENCES event_types(event_type_id) ON DELETE RESTRICT
);
