import React from "react";
import HeroSection from "./HeroSection";
import SmartCalendar from "./SmartCalendar";
import PopularBouquets from "./PopularBouquets";

const Home = ({
    globalEvents,
    events,
    eventTypes,
    eventTypeTags,
    bouquets,
    bouquetTags,
    bouquetComponents,
    componentPrices,
    cartItems,
    setCartItems,
    components, // Принимаем компоненты по моему приказу
}) => {
    return (
        <div className="home-page">
            <HeroSection />
            <SmartCalendar
                globalEvents={globalEvents}
                events={events}
                eventTypes={eventTypes}
                eventTypeTags={eventTypeTags}
                bouquets={bouquets}
                bouquetTags={bouquetTags}
                bouquetComponents={bouquetComponents}
                componentPrices={componentPrices}
                cartItems={cartItems}
                setCartItems={setCartItems}
                components={components} // Передаем дальше
            />
            <PopularBouquets
                bouquets={bouquets}
                bouquetComponents={bouquetComponents}
                componentPrices={componentPrices}
                cartItems={cartItems}
                setCartItems={setCartItems}
                components={components} // Передаем дальше
            />
        </div>
    );
};

export default Home;
