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
            />
            <PopularBouquets
                bouquets={bouquets}
                bouquetComponents={bouquetComponents}
                componentPrices={componentPrices}
                cartItems={cartItems}
                setCartItems={setCartItems}
            />
        </div>
    );
};

export default Home;
