import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = ({ searchHistory, setSearchHistory }) => {
    return (
        <div className="layout-wrapper">
            <Header
                searchHistory={searchHistory}
                setSearchHistory={setSearchHistory}
            />
            <main className="main-content">
                <Outlet />
                <Footer />
            </main>
        </div>
    );
};

export default MainLayout;
