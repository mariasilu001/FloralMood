import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Я приказываю искать наш главный скроллируемый контейнер
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
            // И жестко сбрасывать его позицию в ноль при смене адреса
            mainContent.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
};

export default ScrollToTop;
