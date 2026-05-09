import React, { useContext, useMemo } from "react";
import { AppContext } from "../../../App";
import HeroSection from "./HeroSection";
import SmartCalendar from "./SmartCalendar";
import PopularBouquets from "./PopularBouquets";

const Home = () => {
    const { publicData, meData } = useContext(AppContext);

    // Мой алгоритм вычисления ближайшего события
    const nearestEvent = useMemo(() => {
        const globalEvents = publicData?.globalEvents || [];
        const userEvents = meData?.events || [];

        const allEvents = [
            ...globalEvents.map((e) => ({
                ...e,
                isGlobal: true,
                date: e.eventDate || e.event_date || e.date,
            })),
            ...userEvents.map((e) => ({
                ...e,
                isGlobal: false,
                date: e.eventDate || e.event_date || e.date,
            })),
        ].filter((e) => e.date); // Жестко отсекаем пустышки

        if (allEvents.length === 0) return null;

        const today = new Date();
        const currentYear = today.getFullYear();

        const processed = allEvents.map((event) => {
            const [m, d] = event.date.split("-").map(Number);
            let eventDate = new Date(currentYear, m - 1, d);

            // Если дата прошла, переносим на следующий год
            if (
                eventDate < today &&
                eventDate.toDateString() !== today.toDateString()
            ) {
                eventDate.setFullYear(currentYear + 1);
            }

            return { ...event, diff: eventDate - today };
        });

        return processed.sort((a, b) => a.diff - b.diff)[0] || null;
    }, [publicData, meData]);

    // Мой безупречный фильтр
    const recommendedBouquets = useMemo(() => {
        if (!publicData?.bouquets) return [];

        // ИСПРАВЛЕНО: Я убрал строгую проверку на 0. Теперь он понимает false.
        const standardBouquets = publicData.bouquets.filter(
            (bq) =>
                !bq.deletedAt &&
                !bq.deleted_at &&
                !bq.isCustom &&
                !bq.is_custom,
        );

        // Если нет события — просто отдаю топ 5 букетов
        if (!nearestEvent) return standardBouquets.slice(0, 5);

        const eventType = publicData.eventTypes?.find(
            (et) =>
                et.eventTypeId === nearestEvent.eventTypeId ||
                et.event_type_id === nearestEvent.event_type_id,
        );
        const eventTags = eventType?.tags || [];

        if (eventTags.length === 0) return standardBouquets.slice(0, 5);

        // Фильтруем по тегам
        const filtered = standardBouquets.filter((bouquet) =>
            bouquet.tags?.some((tag) => eventTags.includes(tag.name || tag)),
        );

        // Если по тегам ничего нет, я не оставлю тебя с пустыми руками. Отдам обычные.
        return filtered.length > 0
            ? filtered.slice(0, 5)
            : standardBouquets.slice(0, 5);
    }, [nearestEvent, publicData]);

    const eventTypeData = publicData?.eventTypes?.find(
        (et) =>
            et.eventTypeId === nearestEvent?.eventTypeId ||
            et.event_type_id === nearestEvent?.event_type_id,
    );

    return (
        <div className="home-page">
            <HeroSection />
            <SmartCalendar
                nearestEvent={nearestEvent}
                eventType={eventTypeData}
                recommendedBouquets={recommendedBouquets}
            />
            <PopularBouquets bouquets={publicData?.bouquets || []} />
        </div>
    );
};

export default Home;
