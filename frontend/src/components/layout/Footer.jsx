import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h4>FloralMood</h4>
                    <p>Твои чувства, воплощенные в цветах.</p>
                </div>
                <div className="footer-section">
                    <h4>Покупателям</h4>
                    <ul>
                        <li>
                            <Link to="/delivery">Условия доставки</Link>
                        </li>
                        <li>
                            <Link to="/payment">Способы оплаты</Link>
                        </li>
                        <li>
                            <Link to="/support">Служба поддержки</Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Управление</h4>
                    <Link to="/admin" className="admin-link">
                        Для администраторов
                    </Link>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} FloralMood.
            </div>
        </footer>
    );
};

export default Footer;
