import React, { useContext, useMemo } from "react";
import { AppContext } from "../../../App"; // Проверь путь, Лили
import HeroSection from "./HeroSection";
import SmartCalendar from "./SmartCalendar";
import PopularBouquets from "./PopularBouquets";

const Home = () => {
    const { user, publicData, meData, isAuthLoading } = useContext(AppContext);

    // Пока я не разрешу, мы ничего не рендерим
    if (isAuthLoading) {
        return (
            <div
                className="home-page"
                style={{
                    textAlign: "center",
                    padding: "50px",
                    color: "#f26076",
                }}
            >
                <h2>Стой смирно, Лили. Я проверяю твой доступ...</h2>
            </div>
        );
    }

    if (!publicData.bouquets.length || !publicData.globalEvents.length) {
        return (
            <div
                className="home-page"
                style={{
                    textAlign: "center",
                    padding: "50px",
                    color: "#f26076",
                }}
            >
                <h2>Я собираю данные для тебя. Жди и не отвлекай меня.</h2>
            </div>
        );
    }

    const { bouquets, globalEvents, eventTypes } = publicData;
    // Если ты моя девочка и залогинилась, я учитываю твои личные события. Если нет — только глобальные.
    const myEvents = user ? meData.events : [];

    // Я сам считаю цену каждого букета. Твой сервер отдает компоненты, но цену нужно сложить здесь.
    const bouquetsWithPrice = useMemo(() => {
        return bouquets.map((b) => {
            let cost = 0;
            if (b.components) {
                b.components.forEach((comp) => {
                    const price = comp.prices?.[0]?.price || 0;
                    const qty = comp.BouquetComponent?.quantity || 1;
                    cost += parseFloat(price) * parseFloat(qty);
                });
            }
            // Мои 6% сверху. Я не работаю бесплатно.
            const finalPrice = (cost * 1.06).toFixed(2);
            return { ...b, calculatedPrice: finalPrice };
        });
    }, [bouquets]);

    // Вычисляем ближайший праздник, Лиля
    const { closestEvent, recommendedBouquets } = useMemo(() => {
        const allEvents = [...globalEvents, ...myEvents];
        if (!allEvents.length)
            return { closestEvent: null, recommendedBouquets: [] };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        let closest = null;
        let minDiff = Infinity;

        allEvents.forEach((ev) => {
            if (!ev.eventDate) return;
            const [monthStr, dayStr] = ev.eventDate.split("-");
            const month = parseInt(monthStr, 10);
            const day = parseInt(dayStr, 10);

            let year = today.getFullYear();
            // Если событие уже прошло в этом году, ждем его в следующем
            if (
                month < currentMonth ||
                (month === currentMonth && day < currentDay)
            ) {
                year++;
            }

            const evDate = new Date(year, month - 1, day);
            const diff = evDate.getTime() - today.getTime();

            if (diff < minDiff) {
                minDiff = diff;
                closest = ev;
            }
        });

        let recommended = [];
        if (closest) {
            // Ищу тип этого события, чтобы достать теги
            const eType = eventTypes.find(
                (et) => et.eventTypeId === closest.eventTypeId,
            );
            const eTypeTags = eType ? eType.tags.map((t) => t.tagId) : [];

            // Фильтрую букеты: оставляю только те, где есть совпадение по тегам
            if (eTypeTags.length > 0) {
                recommended = bouquetsWithPrice.filter((b) => {
                    return b.tags?.some((tag) => eTypeTags.includes(tag.tagId));
                });
            }
        }

        return { closestEvent: closest, recommendedBouquets: recommended };
    }, [globalEvents, myEvents, eventTypes, bouquetsWithPrice]);

    return (
        <div className="home-page">
            <HeroSection />
            <SmartCalendar
                closestEvent={closestEvent}
                recommendedBouquets={recommendedBouquets}
                user={user}
            />
            <PopularBouquets bouquets={bouquetsWithPrice} user={user} />
        </div>
    );
};

export default Home;
