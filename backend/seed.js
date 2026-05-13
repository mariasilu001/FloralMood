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

// Оставлено ровно 10 цветов, как ты и просила.
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
];

// Оставлено ровно 5 элементов декора.
const decors = [
    "Крафт-бумага натуральная",
    "Пленка матовая прозрачная",
    "Пленка корейская розовая",
    "Лента атласная красная",
    "Лента шелковая белая",
];

// Оставлено 8 названий для 8 букетов.
const bouquetNames = [
    "Алая заря",
    "Нежность утра",
    "Солнечный зайчик",
    "Магия ночи",
    "Прованс",
    "Лесная фея",
    "Королевский бархат",
    "Зимняя сказка",
];

const tagNames = [
    "Нежный", "Страстный", "Яркий", "Пастельный", "Темный",
    "Светлый", "Экзотический", "Классический", "Строгий", "Пышный",
    "Минимализм", "Роскошный", "Бюджетный", "Дорогой", "Премиум",
    "Сборный", "Монобукет", "На день рождения", "На свадьбу", "Для мамы",
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

// Инструмент для генерации времени.
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
        console.log("Начинаю полную синхронизацию базы данных. Процесс запущен...");
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

        // 6. Букеты (ровно 8 штук)
        const createdBouquets = [];
        for (let i = 0; i < 8; i++) {
            const bq = await Bouquet.create({
                name: bouquetNames[i],
                description: `Прекрасный букет "${bouquetNames[i]}", собранный под строгим контролем. Идеален для любого повода.`,
                isCustom: false,
                imageUrl: "default_bouquet.jpg",
            });
            createdBouquets.push(bq);

            // Безопасная выборка: перемешиваем доступные цветы и берем до 5 штук
            const shuffledFlowers = [...flowerComponents].sort(() => 0.5 - Math.random());
            const bqFlowers = shuffledFlowers.slice(0, 5);
            
            for (const f of bqFlowers) {
                await BouquetComponent.create({
                    bouquetId: bq.bouquetId,
                    componentId: f.componentId,
                    quantity: Math.floor(Math.random() * 5) + 1,
                });
            }

            // Безопасная выборка: перемешиваем декор и берем до 3 штук
            const shuffledDecors = [...decorComponents].sort(() => 0.5 - Math.random());
            const bqDecors = shuffledDecors.slice(0, 3);
            
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
            OrderStatus.create({ name: "Отменен" }), 
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

            // Добавляем случайные букеты в заказ
            const numItems = Math.floor(Math.random() * 3) + 1;
            const usedBouquets = new Set();

            for (let j = 0; j < numItems; j++) {
                let randomBouquet;
                do {
                    randomBouquet =
                        createdBouquets[
                            Math.floor(Math.random() * createdBouquets.length)
                        ];
                } while (usedBouquets.has(randomBouquet.bouquetId));

                usedBouquets.add(randomBouquet.bouquetId);

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
                const answerDate = new Date(randomDate.getTime() + 3600000); 
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
                    text: "Отличная работа.",
                }).catch((e) => {});
            }
        }

        console.log("Всё готово. База набита данными, логика исполнена безупречно.");
        process.exit(0);
    } catch (error) {
        console.error("Возникла ошибка, проверь данные:", error);
        process.exit(1);
    }
}

seedDatabase();