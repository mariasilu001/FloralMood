const bcrypt = require('bcryptjs');
const {
    sequelize, UserRole, User, SearchHistory, TicketSubject, Ticket, TicketMessage,
    UserDeliveryAddress, ComponentCategory, Component, ComponentPrice, Bouquet,
    BouquetComponent, Tag, BouquetTag, Favorite, CartItem, OrderStatus,
    PaymentMethod, DeliverTimeSlot, Order, OrderItem, Review, EventType,
    Event, GlobalEvent
} = require('./models');

// Массивы с уникальными и реальными данными. Я сделал всё сам, Лили.
const flowers = [
    "Роза красная Эквадор", "Роза белая Аваланж", "Пион розовый Сара Бернар", "Тюльпан желтый Стронг Голд", "Лилия белая Касабланка",
    "Орхидея Фаленопсис", "Хризантема кустовая белая", "Ромашка полевая", "Гвоздика красная", "Альстромерия микс",
    "Ирис синий", "Гербера оранжевая", "Подсолнух декоративный", "Фрезия белая", "Гортензия голубая",
    "Эустома розовая", "Ранункулюс персиковый", "Анемон синий", "Лаванда сушеная", "Сирень сиреневая",
    "Гладиолус белый", "Калла бордовая", "Нарцисс желтый", "Гиацинт розовый", "Астра фиолетовая",
    "Георгин красный", "Мак декоративный", "Колокольчик лесной", "Ландыш", "Василек синий",
    "Незабудка", "Гвоздика турецкая", "Камелия белая", "Магнолия", "Лотос розовый",
    "Амариллис красный", "Гибискус", "Жасмин ветка", "Мимоза", "Крокус фиолетовый",
    "Подснежник", "Маргаритка", "Бархатцы", "Петуния", "Анютины глазки",
    "Бегония", "Цикламен", "Пеларгония", "Фуксия", "Азалия",
    "Спатифиллум", "Антуриум красный", "Каланхоэ", "Гербера мини розовая", "Роза кустовая Яна",
    "Пионовидная роза Джульетта", "Роза Дэвида Остина", "Дельфиниум синий", "Люпин", "Наперстянка",
    "Мальва", "Клематис", "Жимолость ветка", "Плющ флористический", "Эвкалипт Популус",
    "Гипсофила белая", "Статица фиолетовая", "Лимониум", "Астильба розовая", "Бруния серебристая",
    "Краспедия", "Протея королевская", "Леукоспермум", "Эрингиум (синеголовник)", "Артишок декоративный"
];

const decors = [
    "Крафт-бумага натуральная", "Пленка матовая прозрачная", "Пленка корейская розовая", "Лента атласная красная", "Лента шелковая белая",
    "Лента кружевная винтажная", "Шпагат джутовый", "Сизаль зеленый", "Сетка флористическая золотая", "Фетр флористический белый",
    "Фоамиран", "Коробка шляпная белая малая", "Коробка бархатная черная", "Коробка в форме сердца", "Корзина плетеная с ручкой",
    "Корзина из лозы", "Кашпо деревянное ручной работы", "Оазис флористический (губка)", "Слюда прозрачная", "Бумага тишью розовая",
    "Органза флористическая", "Лента репсовая синяя", "Булавки с жемчужной головкой", "Стразы на клеевой основе", "Бабочка декоративная 3D",
    "Птичка на прищепке", "Топпер деревянный 'С Днем Рождения'", "Топпер акриловый 'Любимой'", "Конверт крафтовый для записки", "Открытка мини авторская",
    "Сургучная печать 'С любовью'", "Наклейка фирменная", "Корица в палочках (связка)", "Дольки апельсина сушеные", "Шишки сосновые натуральные",
    "Хлопок ветка (сухоцвет)", "Перья декоративные белые", "Блестки-спрей золотые", "Спрей искусственный снег", "Каркас металлический флористический",
    "Упаковка двухсторонняя премиум", "Калька флористическая матовая", "Лента рафия натуральная", "Веревка декоративная крученая", "Бусины на леске прозрачные"
];

const bouquetNames = [
    "Алая заря", "Нежность утра", "Солнечный зайчик", "Магия ночи", "Прованс",
    "Лесная фея", "Королевский бархат", "Зимняя сказка", "Океанский бриз", "Первое свидание",
    "Страсть", "Весеннее пробуждение", "Сладкие грезы", "Млечный путь", "Золотая осень"
];

const tagNames = [
    "Нежный", "Страстный", "Яркий", "Пастельный", "Темный", "Светлый", "Экзотический", "Классический", "Строгий", "Пышный",
    "Минимализм", "Роскошный", "Бюджетный", "Дорогой", "Премиум", "Сборный", "Монобукет", "На день рождения", "На свадьбу", "Для мамы",
    "Для любимой", "Для коллеги", "Шефу", "Извинение", "Свидание", "Юбилей", "8 марта", "14 февраля", "Выпускной", "Рождение ребенка",
    "Выписка", "Новогодний", "Осенний", "Весенний", "Летний", "Зимний", "Ароматный", "Без запаха", "Стойкий", "Полевой",
    "Авторский", "Эксклюзив", "Крупный", "Миниатюрный", "Сладкий", "В корзине", "В коробке", "В крафте", "Без упаковки", "Эко"
];

const globalEventsList = [
    { name: "Новый Год", date: "12-31" }, { name: "День Святого Валентина", date: "02-14" },
    { name: "8 Марта", date: "03-08" }, { name: "День Матери", date: "11-24" },
    { name: "День Учителя", date: "10-05" }, { name: "1 Сентября", date: "09-01" },
    { name: "День Студента", date: "01-25" }, { name: "Хэллоуин", date: "10-31" },
    { name: "День Семьи", date: "07-08" }, { name: "Рождество", date: "01-07" }
];

async function seedDatabase() {
    try {
        console.log("Начинаю полную синхронизацию базы данных, Лили. Не отвлекайся...");
        await sequelize.sync({ force: true });
        console.log("Старые данные уничтожены. База чиста, как твои мысли, когда ты рядом со мной.");

        // 1. Роли
        const roleAdmin = await UserRole.create({ name: "Админ" });
        const roleUser = await UserRole.create({ name: "Пользователь" });

        // 2. Пользователи (10 штук)
        const passwordHash = await bcrypt.hash("pass123", 10);
        const users = [];
        for (let i = 1; i <= 10; i++) {
            users.push(await User.create({
                username: `User_${i}_Name`,
                email: `user${i}@example.com`,
                passwordHash: passwordHash,
                roleId: i === 1 ? roleAdmin.roleId : roleUser.roleId
            }));
        }

        // 3. Категории компонентов
        const catFlowers = await ComponentCategory.create({ name: "Цветы" });
        const catDecor = await ComponentCategory.create({ name: "Декор" });

        // 4. Компоненты и их цены (Генерируем случайную 3-значную цену)
        const getPrice = () => (Math.random() * (999 - 100) + 100).toFixed(2);
        
        const flowerComponents = [];
        for (const fName of flowers) {
            const comp = await Component.create({ name: fName, categoryId: catFlowers.categoryId, unit: "шт" });
            await ComponentPrice.create({ componentId: comp.componentId, price: getPrice(), startDate: new Date(), endDate: new Date('2030-01-01') });
            flowerComponents.push(comp);
        }

        const decorComponents = [];
        for (const dName of decors) {
            const comp = await Component.create({ name: dName, categoryId: catDecor.categoryId, unit: "шт" });
            await ComponentPrice.create({ componentId: comp.componentId, price: getPrice(), startDate: new Date(), endDate: new Date('2030-01-01') });
            decorComponents.push(comp);
        }

        // 5. Теги
        const createdTags = [];
        for (const tName of tagNames) {
            createdTags.push(await Tag.create({ name: tName }));
        }

        // 6. Букеты (15 основных)
        const createdBouquets = [];
        for (let i = 0; i < 15; i++) {
            const bq = await Bouquet.create({
                name: bouquetNames[i],
                description: `Прекрасный букет "${bouquetNames[i]}", собранный с любовью. Идеален для любого повода.`,
                isCustom: false
            });
            createdBouquets.push(bq);

            // Добавляем 5 уникальных цветов и 3 декора
            const bqFlowers = flowerComponents.slice(i * 5, (i + 1) * 5);
            for (const f of bqFlowers) {
                await BouquetComponent.create({ bouquetId: bq.bouquetId, componentId: f.componentId, quantity: Math.floor(Math.random() * 5) + 1 });
            }
            const bqDecors = decorComponents.slice(i * 3, (i + 1) * 3);
            for (const d of bqDecors) {
                await BouquetComponent.create({ bouquetId: bq.bouquetId, componentId: d.componentId, quantity: 1 });
            }

            // Добавляем по 3 случайных тега
            for (let t = 0; t < 3; t++) {
                await BouquetTag.create({ bouquetId: bq.bouquetId, tagId: createdTags[Math.floor(Math.random() * createdTags.length)].tagId }).catch(() => {});
            }
        }

        // 7. Справочники для заказов и тикетов
        const statusNew = await OrderStatus.create({ name: "Новый" });
        const payMethod = await PaymentMethod.create({ name: "Картой онлайн" });
        const timeSlot = await DeliverTimeSlot.create({ name: "12:00 - 15:00", startTime: "12:00:00", endTime: "15:00:00" });
        const ticketSubj = await TicketSubject.create({ name: "Общий вопрос" });
        const eventTypePersonal = await EventType.create({ name: "День рождения" });
        const eventTypeGlobal = await EventType.create({ name: "Праздник" });

        // 8. Глобальные ивенты
        for (const ge of globalEventsList) {
            await GlobalEvent.create({ eventTypeId: eventTypeGlobal.eventTypeId, name: ge.name, eventDate: ge.date });
        }

        // 9. Данные пользователей (Адреса, Ивенты, Кастомные букеты, Тикеты, Заказы)
        const admin = users[0];
        
        // Чтобы всем достались разные букеты в заказы, заведем счетчик
        let bqIndex = 0;

        for (const user of users) {
            // Адрес
            const address = await UserDeliveryAddress.create({
                userId: user.userId,
                city: "Москва",
                street: "Улица роз",
                house: String(Math.floor(Math.random() * 100) + 1),
                apartment: String(Math.floor(Math.random() * 100) + 1)
            });

            // Личный ивент
            await Event.create({
                userId: user.userId,
                eventTypeId: eventTypePersonal.eventTypeId,
                name: "Мой личный день рождения",
                eventDate: "05-15"
            });

            // Кастомный букет (10 штук, по одному на юзера)
            await Bouquet.create({
                userId: user.userId,
                name: `Индивидуальная фантазия для ${user.username}`,
                description: "Собран по личным предпочтениям клиента",
                isCustom: true
            });

            // Тикет и 2 сообщения (от юзера и от админа)
            const ticket = await Ticket.create({ userId: user.userId, subjectId: ticketSubj.subjectId });
            await TicketMessage.create({ ticketId: ticket.ticketId, userId: user.userId, text: "Здравствуйте, у меня вопрос по моему заказу." });
            await TicketMessage.create({ ticketId: ticket.ticketId, userId: admin.userId, text: "Приветствую. Я разберусь с этим. Ожидайте." });

            // Заказ с 2 букетами (берем из регулярных по кругу)
            const order = await Order.create({
                userId: user.userId, statusId: statusNew.statusId, addressId: address.addressId,
                totalPrice: 2500.00, paymentMethodId: payMethod.paymentMethodId, deliveryDate: new Date(), timeSlotId: timeSlot.timeSlotId
            });

            const firstBouquet = createdBouquets[bqIndex % 15];
            const secondBouquet = createdBouquets[(bqIndex + 1) % 15];
            bqIndex += 2;

            await OrderItem.create({ orderId: order.orderId, bouquetId: firstBouquet.bouquetId, quantity: 1, priceSnapshot: 1200.00 });
            await OrderItem.create({ orderId: order.orderId, bouquetId: secondBouquet.bouquetId, quantity: 1, priceSnapshot: 1300.00 });
        }

        // 10. Отзывы (по 2 на каждый регулярный букет)
        // Для упрощения привяжем их к первым попавшимся юзерам и их заказам.
        for (const bq of createdBouquets) {
            for (let i = 0; i < 2; i++) {
                // Берем случайного юзера (ищем его заказ, чтобы FK сработал корректно, хотя в seed это не строго)
                const rndUser = users[Math.floor(Math.random() * users.length)];
                const userOrder = await Order.findOne({ where: { userId: rndUser.userId } });
                
                await Review.create({
                    userId: rndUser.userId,
                    bouquetId: bq.bouquetId,
                    orderId: userOrder ? userOrder.orderId : 1, // страхуемся
                    rating: Math.floor(Math.random() * 2) + 4, // Оценки 4 или 5
                    text: "Отличный букет! Я в полном восторге. Доставили вовремя."
                }).catch(e => console.log('Скип дубликата отзыва'));
            }
        }

        console.log("Всё готово, Лили. Твоя база данных заполнена и покорно ждет команд. Прямо как ты.");
        process.exit(0);

    } catch (error) {
        console.error("Произошла ошибка, но я всё равно это исправлю:", error);
        process.exit(1);
    }
}

seedDatabase();