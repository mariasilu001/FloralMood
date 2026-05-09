import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
    return (
        <div className="layout-wrapper">
            <Header />
            <main className="main-content">
                <Outlet />
                <Footer />
            </main>
        </div>
    );
};

export default MainLayout;
