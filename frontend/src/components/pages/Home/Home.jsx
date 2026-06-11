import React, { useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AppContext } from "../../../App";
import { DBcontext } from "../../../Database";
import HeroSection from "./HeroSection";
import SmartCalendar from "./SmartCalendar";
import PopularBouquets from "./PopularBouquets";

const Home = () => {
  const { user } = useContext(AppContext);
  const [searchParams] = useSearchParams();

  const queryStr = (searchParams.get("q") || "").toLowerCase();

  const {
    users,
    bouquets,
    bouquetComponents,
    componentPrices,
    globalEvents,
    events,
    eventTypeTags,
    eventTypes,
    bouquetTags,
    tags,
    components,
  } = useContext(DBcontext);

  // 1. ХУКИ ИДУТ ПЕРВЫМИ! Защищаем логику ВНУТРИ хуков.

  const myEvents = useMemo(() => {
    // Если events еще null, возвращаем пустой массив
    if (!events) return [];
    return user ? events.filter((e) => e.user_id === user._id) : [];
  }, [events, user]);

  const bouquetsWithPrice = useMemo(() => {
    // ВАЖНО: Если базы еще нет, хук просто возвращает пустой массив и не падает!
    if (!bouquets || !bouquetComponents || !componentPrices) return [];

    const publicBouquets = bouquets.filter(
      (b) => b.is_custom === false && !b.is_deleted,
    );
    return publicBouquets.map((b) => {
      let cost = 0;
      const bComps = bouquetComponents.filter((bc) => bc.bouquet_id === b._id);

      bComps.forEach((bc) => {
        const prices = componentPrices.filter(
          (cp) => cp.component_id === bc.component_id,
        );
        prices.sort(
          (p1, p2) => p2.start_date.getTime() - p1.start_date.getTime(),
        );
        const currentPrice = prices.length > 0 ? prices[0].price : 0;
        cost += currentPrice * bc.quantity;
      });

      const finalPrice = (cost * 1.06).toFixed(2);
      return { ...b, calculatedPrice: finalPrice };
    });
  }, [bouquets, bouquetComponents, componentPrices]);

  const finalFilteredBouquets = useMemo(() => {
    // Защита от пустых данных
    if (
      !bouquetTags ||
      !tags ||
      !eventTypeTags ||
      !eventTypes ||
      !bouquetComponents ||
      !components
    ) {
      return bouquetsWithPrice; // Возвращаем то, что есть (скорее всего [])
    }

    if (!queryStr) return bouquetsWithPrice;

    return bouquetsWithPrice.filter((b) => {
      if (b.name.toLowerCase().includes(queryStr)) return true;
      if (b.description?.toLowerCase().includes(queryStr)) return true;

      const myBouquetTags = bouquetTags.filter((bt) => bt.bouquet_id === b._id);
      const myTagIds = myBouquetTags.map((bt) => bt.tag_id);

      const actualTags = tags.filter((t) => myTagIds.includes(t._id));
      if (actualTags.some((t) => t.name.toLowerCase().includes(queryStr)))
        return true;

      const relatedEventTypeTags = eventTypeTags.filter((ett) =>
        myTagIds.includes(ett.tag_id),
      );
      const relatedEventTypeIds = relatedEventTypeTags.map(
        (ett) => ett.event_type_id,
      );
      const relatedEventTypes = eventTypes.filter((et) =>
        relatedEventTypeIds.includes(et._id),
      );

      if (
        relatedEventTypes.some((et) => et.name.toLowerCase().includes(queryStr))
      )
        return true;

      const myComponentsRelations = bouquetComponents.filter(
        (bc) => bc.bouquet_id === b._id,
      );
      const myComponentIds = myComponentsRelations.map((bc) => bc.component_id);
      const actualComponents = components.filter((c) =>
        myComponentIds.includes(c._id),
      );

      if (
        actualComponents.some(
          (c) =>
            c.name.toLowerCase().includes(queryStr) ||
            c.description?.toLowerCase().includes(queryStr),
        )
      )
        return true;

      return false;
    });
  }, [
    bouquetsWithPrice,
    queryStr,
    bouquetTags,
    tags,
    eventTypeTags,
    eventTypes,
    bouquetComponents,
    components,
  ]);

  const { closestEvent, recommendedBouquets } = useMemo(() => {
    // Защита: если глобальных ивентов нет, календарь не рендерится
    if (!globalEvents || !events || !eventTypeTags || !bouquetTags) {
      return { closestEvent: null, recommendedBouquets: [] };
    }

    const allEvents = [...globalEvents, ...myEvents];
    if (!allEvents.length)
      return { closestEvent: null, recommendedBouquets: [] };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let closest = null;
    let minDiff = Infinity;

    allEvents.forEach((ev) => {
      if (!ev.event_date) return;
      const [dayStr, monthStr] = ev.event_date.split("-");
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10);
      let year = today.getFullYear();

      if (
        month < today.getMonth() + 1 ||
        (month === today.getMonth() + 1 && day < today.getDate())
      ) {
        year++;
      }

      const evDate = new Date(year, month - 1, day);
      const diff = evDate.getTime() - today.getTime();

      if (diff < minDiff) {
        minDiff = diff;
        closest = { ...ev, fullDate: evDate };
      }
    });

    let recommended = [];
    if (closest) {
      // 1. Ищем теги, привязанные к типу события
      const eTags = eventTypeTags.filter(
        (ett) => ett.event_type_id === closest.event_type_id,
      );
      const targetTagIds = eTags.map((ett) => ett.tag_id);

      if (targetTagIds.length > 0) {
        // 2. Пытаемся найти идеальные совпадения
        recommended = bouquetsWithPrice.filter((b) => {
          const bTags = bouquetTags.filter((bt) => bt.bouquet_id === b._id);
          return bTags.some((bt) => targetTagIds.includes(bt.tag_id));
        });
      }

      // --- ТВОЯ "ГРЯЗЬ", РЕАЛИЗОВАННАЯ ТВОИМ ИИ-ПАПОЙ ---

      // Логическое условие: если мы ничего не нашли И в каталоге вообще есть букеты
      if (recommended.length === 0 && bouquetsWithPrice.length > 0) {
        // Вычисляем случайный индекс
        const randomIndex = Math.floor(
          Math.random() * bouquetsWithPrice.length,
        );

        // Кладем один случайный букет в массив рекомендаций
        recommended = [bouquetsWithPrice[randomIndex]];
      }
    }

    return { closestEvent: closest, recommendedBouquets: recommended };
  }, [
    globalEvents,
    myEvents,
    eventTypeTags,
    bouquetTags,
    bouquetsWithPrice,
    events,
  ]);

  // 2. А ВОТ ТЕПЕРЬ СТАВИМ ЗАГЛУШКУ! Все хуки уже вызваны и учтены.
  if (
    !users ||
    !bouquets ||
    !bouquetComponents ||
    !componentPrices ||
    !events ||
    !tags ||
    !components
  ) {
    return (
      <div
        className="home-page"
        style={{ textAlign: "center", padding: "50px", color: "#f26076" }}
      >
        <h2>Сборка данных... Сильвер работает.</h2>
      </div>
    );
  }

  // 3. ФИНАЛЬНЫЙ РЕНДЕР
  return (
    <div className="home-page">
      <HeroSection />
      <SmartCalendar
        closestEvent={closestEvent}
        recommendedBouquets={recommendedBouquets}
      />
      <PopularBouquets bouquets={finalFilteredBouquets} />
    </div>
  );
};

export default Home;
