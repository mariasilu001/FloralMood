import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>Скажи это цветами. Идеальный букет для любого повода</h1>
                <p>Не жди особого случая. Создай его прямо сейчас.</p>
                <Link to="/customizer" className="btn-primary">
                    Собрать свой букет
                </Link>
            </div>
            <div className="hero-image-wrapper">
                <img src="/banner_bouquet.png" alt="Идеальный букет" />
            </div>
        </section>
    );
};

export default HeroSection;
