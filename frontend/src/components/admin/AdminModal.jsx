import React from "react";
import ReactDOM from "react-dom";

const AdminModal = ({ title, onClose, children }) => {
    return ReactDOM.createPortal(
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>{title}</h2>
                    <button className="admin-modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="admin-modal-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AdminModal;