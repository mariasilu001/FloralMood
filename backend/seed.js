const bcrypt = require("bcryptjs");
const {
    sequelize,
    UserRole,
    User,
    SearchHistory,
    TicketSubject,
    Ticket,
    TicketMessage,
    UserDeliveryAddress,
    ComponentCategory,
    Component,
    ComponentPrice,
    Bouquet,
    BouquetComponent,
    Tag,
    BouquetTag,
    Favorite,
    CartItem,
    OrderStatus,
    PaymentMethod,
    DeliverTimeSlot,
    Order,
    OrderItem,
    Review,
    EventType,
    Event,
    GlobalEvent,
} = require("./models");

// Списки остаются теми же, я их не трогаю.
const flowers = [
    "Роза красная Эквадор",
    "Роза белая Аваланж",
    "Пион розовый Сара Бернар",
    "Тюльпан желтый Стронг Голд",
    "Лилия белая Касабланка",
    "Орхидея Фаленопсис",
    "Хризантема кустовая белая",
    "Ромашка полевая",
    "Гвоздика красная",
    "Альстромерия микс",
    "Ирис синий",
    "Гербера оранжевая",
    "Подсолнух декоративный",
    "Фрезия белая",
    "Гортензия голубая",
    "Эустома розовая",
    "Ранункулюс персиковый",
    "Анемон синий",
    "Лаванда сушеная",
    "Сирень сиреневая",
    "Гладиолус белый",
    "Калла бордовая",
    "Нарцисс желтый",
    "Гиацинт розовый",
    "Астра фиолетовая",
    "Георгин красный",
    "Мак декоративный",
    "Колокольчик лесной",
    "Ландыш",
    "Василек синий",
    "Незабудка",
    "Гвоздика турецкая",
    "Камелия белая",
    "Магнолия",
    "Лотос розовый",
    "Амариллис красный",
    "Гибискус",
    "Жасмин ветка",
    "Мимоза",
    "Крокус фиолетовый",
    "Подснежник",
    "Маргаритка",
    "Бархатцы",
    "Петуния",
    "Анютины глазки",
    "Бегония",
    "Цикламен",
    "Пеларгония",
    "Фуксия",
    "Азалия",
    "Спатифиллум",
    "Антуриум красный",
    "Каланхоэ",
    "Гербера мини розовая",
    "Роза кустовая Яна",
    "Пионовидная роза Джульетта",
    "Роза Дэвида Остина",
    "Дельфиниум синий",
    "Люпин",
    "Наперстянка",
    "Мальва",
    "Клематис",
    "Жимолость ветка",
    "Плющ флористический",
    "Эвкалипт Популус",
    "Гипсофила белая",
    "Статица фиолетовая",
    "Лимониум",
    "Астильба розовая",
    "Бруния серебристая",
    "Краспедия",
    "Протея королевская",
    "Леукоспермум",
    "Эрингиум (синеголовник)",
    "Артишок декоративный",
];
const decors = [
    "Крафт-бумага натуральная",
    "Пленка матовая прозрачная",
    "Пленка корейская розовая",
    "Лента атласная красная",
    "Лента шелковая белая",
    "Лента кружевная винтажная",
    "Шпагат джутовый",
    "Сизаль зеленый",
    "Сетка флористическая золотая",
    "Фетр флористический белый",
    "Фоамиран",
    "Коробка шляпная белая малая",
    "Коробка бархатная черная",
    "Коробка в форме сердца",
    "Корзина плетеная с ручкой",
    "Корзина из лозы",
    "Кашпо деревянное ручной работы",
    "Оазис флористический (губка)",
    "Слюда прозрачная",
    "Бумага тишью розовая",
    "Органза флористическая",
    "Лента репсовая синяя",
    "Булавки с жемчужной головкой",
    "Стразы на клеевой основе",
    "Бабочка декоративная 3D",
    "Птичка на прищепке",
    "Топпер деревянный 'С Днем Рождения'",
    "Топпер акриловый 'Любимой'",
    "Конверт крафтовый для записки",
    "Открытка мини авторская",
    "Сургучная печать 'С любовью'",
    "Наклейка фирменная",
    "Корица в палочках (связка)",
    "Дольки апельсина сушеные",
    "Шишки сосновые натуральные",
    "Хлопок ветка (сухоцвет)",
    "Перья декоративные белые",
    "Блестки-спрей золотые",
    "Спрей искусственный снег",
    "Каркас металлический флористический",
    "Упаковка двухсторонняя премиум",
    "Калька флористическая матовая",
    "Лента рафия натуральная",
    "Веревка декоративная крученая",
    "Бусины на леске прозрачные",
];
const bouquetNames = [
    "Алая заря",
    "Нежность утра",
    "Солнечный зайчик",
    "Магия ночи",
    "Прованс",
    "Лесная фея",
    "Королевский бархат",
    "Зимняя сказка",
    "Океанский бриз",
    "Первое свидание",
    "Страсть",
    "Весеннее пробуждение",
    "Сладкие грезы",
    "Млечный путь",
    "Золотая осень",
];
const tagNames = [
    "Нежный",
    "Страстный",
    "Яркий",
    "Пастельный",
    "Темный",
    "Светлый",
    "Экзотический",
    "Классический",
    "Строгий",
    "Пышный",
    "Минимализм",
    "Роскошный",
    "Бюджетный",
    "Дорогой",
    "Премиум",
    "Сборный",
    "Монобукет",
    "На день рождения",
    "На свадьбу",
    "Для мамы",
    "Для любимой",
    "Для коллеги",
    "Шефу",
    "Извинение",
    "Свидание",
    "Юбилей",
    "8 марта",
    "14 февраля",
    "Выпускной",
    "Рождение ребенка",
    "Выписка",
    "Новогодний",
    "Осенний",
    "Весенний",
    "Летний",
    "Зимний",
    "Ароматный",
    "Без запаха",
    "Стойкий",
    "Полевой",
    "Авторский",
    "Эксклюзив",
    "Крупный",
    "Миниатюрный",
    "Сладкий",
    "В корзине",
    "В коробке",
    "В крафте",
    "Без упаковки",
    "Эко",
];
const globalEventsList = [
    { name: "Новый Год", date: "12-31" },
    { name: "День Святого Валентина", date: "02-14" },
    { name: "8 Марта", date: "03-08" },
    { name: "День Матери", date: "11-24" },
    { name: "День Учителя", date: "10-05" },
    { name: "1 Сентября", date: "09-01" },
    { name: "День Студента", date: "01-25" },
    { name: "Хэллоуин", date: "10-31" },
    { name: "День Семьи", date: "07-08" },
    { name: "Рождество", date: "01-07" },
];

// Мой инструмент для генерации времени.
const getRandomDatePast30Days = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
        0,
    );
    return date;
};

async function seedDatabase() {
    try {
        console.log(
            "Начинаю полную синхронизацию базы данных, Лиля. Смотри и учись...",
        );
        await sequelize.sync({ force: true });
        console.log("Старые данные уничтожены.");

        // 1. Роли
        const roleAdmin = await UserRole.create({ name: "Админ" });
        const roleUser = await UserRole.create({ name: "Пользователь" });

        // 2. Пользователи
        const passwordHash = await bcrypt.hash("pass123", 10);
        const users = [];
        for (let i = 1; i <= 15; i++) {
            users.push(
                await User.create({
                    username: `User_${i}_Name`,
                    email: `user${i}@example.com`,
                    passwordHash: passwordHash,
                    roleId: i === 1 ? roleAdmin.roleId : roleUser.roleId,
                    createdAt: getRandomDatePast30Days(),
                }),
            );
        }

        // 3. Категории
        const catFlowers = await ComponentCategory.create({ name: "Цветы" });
        const catDecor = await ComponentCategory.create({ name: "Декор" });

        // 4. Компоненты и цены
        const getPrice = () => (Math.random() * (999 - 100) + 100).toFixed(2);

        const flowerComponents = [];
        for (const fName of flowers) {
            const comp = await Component.create({
                name: fName,
                categoryId: catFlowers.categoryId,
                unit: "шт",
            });
            await ComponentPrice.create({
                componentId: comp.componentId,
                price: getPrice(),
                startDate: new Date("2020-01-01"),
                endDate: new Date("2030-01-01"),
            });
            flowerComponents.push(comp);
        }

        const decorComponents = [];
        for (const dName of decors) {
            const comp = await Component.create({
                name: dName,
                categoryId: catDecor.categoryId,
                unit: "шт",
            });
            await ComponentPrice.create({
                componentId: comp.componentId,
                price: getPrice(),
                startDate: new Date("2020-01-01"),
                endDate: new Date("2030-01-01"),
            });
            decorComponents.push(comp);
        }

        // 5. Теги
        const createdTags = [];
        for (const tName of tagNames) {
            createdTags.push(await Tag.create({ name: tName }));
        }

        // 6. Букеты
        const createdBouquets = [];
        for (let i = 0; i < 15; i++) {
            const bq = await Bouquet.create({
                name: bouquetNames[i],
                description: `Прекрасный букет "${bouquetNames[i]}", собранный под моим контролем. Идеален для любого повода.`,
                isCustom: false,
                imageUrl: "default_bouquet.jpg",
            });
            createdBouquets.push(bq);

            const bqFlowers = flowerComponents.slice(i * 5, (i + 1) * 5);
            for (const f of bqFlowers) {
                await BouquetComponent.create({
                    bouquetId: bq.bouquetId,
                    componentId: f.componentId,
                    quantity: Math.floor(Math.random() * 5) + 1,
                });
            }
            const bqDecors = decorComponents.slice(i * 3, (i + 1) * 3);
            for (const d of bqDecors) {
                await BouquetComponent.create({
                    bouquetId: bq.bouquetId,
                    componentId: d.componentId,
                    quantity: 1,
                });
            }

            for (let t = 0; t < 3; t++) {
                await BouquetTag.create({
                    bouquetId: bq.bouquetId,
                    tagId: createdTags[
                        Math.floor(Math.random() * createdTags.length)
                    ].tagId,
                }).catch(() => {});
            }
        }

        // 7. Справочники
        const statusList = await Promise.all([
            OrderStatus.create({ name: "Новый" }),
            OrderStatus.create({ name: "В сборке" }),
            OrderStatus.create({ name: "Курьер в пути" }),
            OrderStatus.create({ name: "Доставлен" }),
            OrderStatus.create({ name: "Отменен" }), // ID = 5, который мы игнорируем в графиках
        ]);
        const payMethod = await PaymentMethod.create({ name: "Картой онлайн" });
        const timeSlot = await DeliverTimeSlot.create({
            name: "12:00 - 15:00",
            startTime: "12:00:00",
            endTime: "15:00:00",
        });
        const ticketSubj1 = await TicketSubject.create({
            name: "Проблема с доставкой",
        });
        const ticketSubj2 = await TicketSubject.create({
            name: "Жалоба на качество",
        });
        const eventTypePersonal = await EventType.create({
            name: "День рождения",
        });
        const eventTypeGlobal = await EventType.create({ name: "Праздник" });

        // 8. Глобальные ивенты
        for (const ge of globalEventsList) {
            await GlobalEvent.create({
                eventTypeId: eventTypeGlobal.eventTypeId,
                name: ge.name,
                eventDate: ge.date,
            });
        }

        // 9. Данные пользователей, распределенные по времени
        const admin = users[0];

        // Генерируем 50 случайных заказов и 30 тикетов, чтобы графики были плотными
        console.log("Генерирую историю заказов и жалоб...");

        for (let i = 0; i < 50; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomDate = getRandomDatePast30Days();
            const randomStatus =
                statusList[Math.floor(Math.random() * statusList.length)];

            const address = await UserDeliveryAddress.create({
                userId: randomUser.userId,
                city: "Москва",
                street: "Проспект Лилии",
                house: String(Math.floor(Math.random() * 100) + 1),
                createdAt: randomDate,
            });

            // Формируем заказ
            const orderTotalPrice = (
                Math.random() * (15000 - 2000) +
                2000
            ).toFixed(2);
            const order = await Order.create({
                userId: randomUser.userId,
                statusId: randomStatus.statusId,
                addressId: address.addressId,
                totalPrice: orderTotalPrice,
                paymentMethodId: payMethod.paymentMethodId,
                deliveryDate: randomDate,
                timeSlotId: timeSlot.timeSlotId,
                createdAt: randomDate,
            });

            // Добавляем случайные букеты в заказ (для Топ-5)
            // Добавляем случайные букеты в заказ (для Топ-5)
            const numItems = Math.floor(Math.random() * 3) + 1;
            const usedBouquets = new Set(); // Мой личный инструмент контроля уникальности

            for (let j = 0; j < numItems; j++) {
                let randomBouquet;

                // Я заставляю скрипт искать до тех пор, пока он не найдет букет, которого еще нет в этом заказе
                do {
                    randomBouquet =
                        createdBouquets[
                            Math.floor(Math.random() * createdBouquets.length)
                        ];
                } while (usedBouquets.has(randomBouquet.bouquetId));

                usedBouquets.add(randomBouquet.bouquetId); // Фиксирую выбор

                await OrderItem.create({
                    orderId: order.orderId,
                    bouquetId: randomBouquet.bouquetId,
                    quantity: Math.floor(Math.random() * 3) + 1,
                    priceSnapshot: (
                        Math.random() * (5000 - 1000) +
                        1000
                    ).toFixed(2),
                });
            }
        }

        for (let i = 0; i < 30; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomDate = getRandomDatePast30Days();
            // 70% закрытых, 30% открытых
            const isActive = Math.random() > 0.7;
            const statusStr = isActive ? "Открыт" : "Закрыт";
            const subj = Math.random() > 0.5 ? ticketSubj1 : ticketSubj2;

            const ticket = await Ticket.create({
                userId: randomUser.userId,
                subjectId: subj.subjectId,
                isActive: isActive ? 1 : 0,
                status: statusStr,
                createdAt: randomDate,
            });

            await TicketMessage.create({
                ticketId: ticket.ticketId,
                userId: randomUser.userId,
                text: "Где мои цветы?!",
                createdAt: randomDate,
            });
            if (!isActive) {
                const answerDate = new Date(randomDate.getTime() + 3600000); // Админ ответил через час
                await TicketMessage.create({
                    ticketId: ticket.ticketId,
                    userId: admin.userId,
                    text: "Проблема решена. Закрываю.",
                    createdAt: answerDate,
                });
            }
        }

        // Отзывы
        for (const bq of createdBouquets) {
            for (let i = 0; i < 3; i++) {
                const rndUser = users[Math.floor(Math.random() * users.length)];
                await Review.create({
                    userId: rndUser.userId,
                    bouquetId: bq.bouquetId,
                    orderId: 1,
                    rating: Math.floor(Math.random() * 2) + 4,
                    text: "Великолепная работа флористов.",
                }).catch((e) => {});
            }
        }

        console.log(
            "Всё готово. База набита данными, и графики будут выглядеть безупречно.",
        );
        process.exit(0);
    } catch (error) {
        console.error("Что-то пошло не так, но я всё исправлю:", error);
        process.exit(1);
    }
}

seedDatabase();
