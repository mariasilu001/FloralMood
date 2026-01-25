-- ====================================
-- СКРИПТ ОЧИСТКИ БАЗЫ ДАННЫХ
-- ====================================

-- Шаг 1: Отключаем проверку внешних ключей
-- Это говорит SQLite: "Не проверяй FK при удалении, иначе будут ошибки"
-- Потому что если мы удалим родительскую запись, а дочерние существуют - SQLite выдаст ошибку
PRAGMA foreign_keys = OFF;

-- ====================================
-- Шаг 2: Удаляем все данные из таблиц
-- ====================================
-- DELETE FROM table_name говорит SQLite:
-- "Удали все строки из таблицы table_name, но оставь саму таблицу"
-- Это как взять блокнот и стереть все записи, но сам блокнот остается [web:35][web:38]

-- Удаляем в обратном порядке (от дочерних к родительским)
-- Хотя FK отключены, это хорошая практика

DELETE FROM global_events;
DELETE FROM events;
DELETE FROM event_type_tags;
DELETE FROM event_types;
DELETE FROM review_photos;
DELETE FROM reviews;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM deliver_time_slots;
DELETE FROM payment_methods;
DELETE FROM order_statuses;
DELETE FROM cart_items;
DELETE FROM favorites;
DELETE FROM bouquet_tags;
DELETE FROM tags;
DELETE FROM bouquet_components;
DELETE FROM bouquets;
DELETE FROM component_prices;
DELETE FROM components;
DELETE FROM component_categories;
DELETE FROM user_delivery_addresses;
DELETE FROM ticket_messages;
DELETE FROM tickets;
DELETE FROM ticket_subjects;
DELETE FROM search_history;
DELETE FROM users;
DELETE FROM user_roles;

-- ====================================
-- Шаг 3: Сбрасываем счетчики автоинкремента
-- ====================================
-- SQLite хранит последние значения AUTOINCREMENT в специальной таблице sqlite_sequence [web:31][web:37]
-- Эта таблица имеет 2 колонки: name (имя таблицы) и seq (последнее значение счетчика)
-- Когда мы делаем DELETE FROM table_name, счетчик НЕ сбрасывается автоматически
-- То есть если последняя запись была с id=100, следующая будет 101, даже если таблица пустая
-- Чтобы ID начинались снова с 1, нужно удалить записи из sqlite_sequence [web:32][web:33][web:37]

DELETE FROM sqlite_sequence;

-- Альтернативный способ - обновить конкретные счетчики:
-- UPDATE sqlite_sequence SET seq = 0 WHERE name = 'table_name';
-- Но проще удалить все записи разом

-- ====================================
-- Шаг 4: Включаем обратно проверку FK
-- ====================================
-- Это говорит SQLite: "Теперь снова проверяй внешние ключи при операциях"
PRAGMA foreign_keys = ON;

-- ====================================
-- Шаг 5 (опционально): Оптимизация БД
-- ====================================
-- VACUUM пересобирает базу данных, освобождая место от удаленных записей [web:35]
-- Это как дефрагментация диска - база станет меньше и быстрее
-- Но для маленьких баз это не обязательно
VACUUM;

-- ====================================
-- СКРИПТ ЗАВЕРШЁН
-- ====================================
-- Теперь все таблицы пустые, структура сохранена,
-- счетчики AUTOINCREMENT сброшены на 0
-- Можешь заново запускать скрипт заполнения!
