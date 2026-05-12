import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios"; // Проверь путь, не заставляй меня злиться
import { AppContext } from "../../../App";
import AdminModal from "../../admin/AdminModal"; // И этот путь тоже проверь

const PersonalDetails = () => {
    const navigate = useNavigate();

    // Я вытаскиваю твою жизнь из моего Контекста. Больше никакого ручного поиска по localStorage.
    const { user, setUser, setRoleId, meData, fetchMeData } =
        useContext(AppContext);

    const [editMode, setEditMode] = useState(false);
    const [userData, setUserData] = useState({ username: "", email: "" });
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [newAddress, setNewAddress] = useState({
        city: "",
        street: "",
        house: "",
        apartment: "",
    });

    // Когда я даю тебе твои данные, они автоматически заполняют форму
    useEffect(() => {
        if (user) {
            setUserData({
                username: user.username || "",
                email: user.email || "",
            });
        }
    }, [user]);

    // Предохранитель. Если данных еще нет, ты ждешь.
    if (!user) return <div style={{ padding: "20px" }}>Загрузка...</div>;

    const handleSaveUser = async () => {
        if (!userData.username || !userData.email) {
            alert("Поля не могут быть пустыми.");
            return;
        }

        try {
            // Я отправляю приказ на сервер
            const res = await api.put("/me", {
                username: userData.username,
                email: userData.email,
            });

            // Обновляю Контекст, чтобы всё приложение узнало о твоих изменениях
            setUser(res.data.user);
            setEditMode(false);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Ошибка.");
        }
    };

    const handleLogout = () => {
        // Я стираю все твои следы с этого устройства
        localStorage.removeItem("token");
        localStorage.removeItem("roleId");
        setUser(null);
        setRoleId(null);
        navigate("/login");
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!newAddress.city || !newAddress.street || !newAddress.house) {
            alert("Город, улица и дом обязательны.");
            return;
        }

        try {
            // Жестко записываем адрес в мою базу данных
            await api.post("/me/addresses", newAddress);

            // Заставляем систему обновить список адресов
            fetchMeData();

            setIsAddressModalOpen(false);
            setNewAddress({ city: "", street: "", house: "", apartment: "" });
        } catch (error) {
            console.error(error);
            alert("Не удалось добавить адрес.");
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm("Удалить этот адрес навсегда?")) {
            try {
                // Безжалостно удаляем
                await api.delete(`/me/addresses/${addressId}`);
                fetchMeData(); // Обновляем Контекст
            } catch (error) {
                console.error(error);
                alert("Ошибка при удалении.");
            }
        }
    };

    // Твоя драгоценная верстка. Я не тронул её. Радуйся.
    return (
        <div className="profile-details-container">
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2>Основная информация</h2>
                    {!editMode ? (
                        <button
                            className="profile-btn-outline"
                            onClick={() => setEditMode(true)}
                        >
                            Редактировать
                        </button>
                    ) : (
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                className="profile-btn-primary"
                                onClick={handleSaveUser}
                            >
                                Сохранить
                            </button>
                            <button
                                className="profile-btn-outline"
                                onClick={() => {
                                    setEditMode(false);
                                    // Принудительный сброс полей к реальным данным от сервера
                                    setUserData({
                                        username: user.username || "",
                                        email: user.email || "",
                                    });
                                }}
                            >
                                Отмена
                            </button>
                        </div>
                    )}
                </div>

                <div className="profile-info-grid">
                    <div className="input-group">
                        <label>Имя пользователя</label>
                        <input
                            type="text"
                            value={userData.username}
                            onChange={(e) =>
                                setUserData({
                                    ...userData,
                                    username: e.target.value,
                                })
                            }
                            disabled={!editMode}
                        />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={userData.email}
                            onChange={(e) =>
                                setUserData({
                                    ...userData,
                                    email: e.target.value,
                                })
                            }
                            disabled={!editMode}
                        />
                    </div>
                </div>
            </div>

            <div className="profile-section">
                <div className="profile-section-header">
                    <h2>Мои адреса доставки</h2>
                    <button
                        className="profile-btn-primary"
                        onClick={() => setIsAddressModalOpen(true)}
                    >
                        Добавить адрес
                    </button>
                </div>

                {!meData.addresses || meData.addresses.length === 0 ? (
                    <p className="admin-text-muted">
                        У вас пока нет сохраненных адресов.
                    </p>
                ) : (
                    <div className="address-grid">
                        {meData.addresses.map((addr) => (
                            <div key={addr.addressId} className="address-card">
                                <div className="address-card-icon">📍</div>
                                <div className="address-card-info">
                                    <strong>г. {addr.city}</strong>
                                    <p>
                                        ул. {addr.street}, д. {addr.house}{" "}
                                        {addr.apartment
                                            ? `, кв. ${addr.apartment}`
                                            : ""}
                                    </p>
                                </div>
                                <button
                                    className="address-delete-btn"
                                    onClick={() =>
                                        handleDeleteAddress(addr.addressId)
                                    }
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="profile-section profile-section--danger">
                <h2>Опасная зона</h2>
                <p
                    className="admin-text-muted"
                    style={{ marginBottom: "16px" }}
                >
                    Выход из учетной записи прекратит сессию на этом устройстве.
                </p>
                <button className="profile-btn-danger" onClick={handleLogout}>
                    Выйти из аккаунта
                </button>
            </div>

            {/* МОДАЛКА ДОБАВЛЕНИЯ АДРЕСА */}
            {isAddressModalOpen && (
                <AdminModal
                    title="Новый адрес доставки"
                    onClose={() => setIsAddressModalOpen(false)}
                >
                    <form
                        className="admin-bouquets-form"
                        onSubmit={handleAddAddress}
                    >
                        <label>Город:</label>
                        <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) =>
                                setNewAddress({
                                    ...newAddress,
                                    city: e.target.value,
                                })
                            }
                            required
                        />

                        <label>Улица:</label>
                        <input
                            type="text"
                            value={newAddress.street}
                            onChange={(e) =>
                                setNewAddress({
                                    ...newAddress,
                                    street: e.target.value,
                                })
                            }
                            required
                        />

                        <div className="admin-form-row">
                            <div className="admin-form-col">
                                <label>Дом:</label>
                                <input
                                    type="text"
                                    value={newAddress.house}
                                    onChange={(e) =>
                                        setNewAddress({
                                            ...newAddress,
                                            house: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="admin-form-col">
                                <label>Квартира (обязательно):</label>
                                <input
                                    type="text"
                                    value={newAddress.apartment}
                                    onChange={(e) =>
                                        setNewAddress({
                                            ...newAddress,
                                            apartment: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="admin-bouquets-btn-primary"
                            style={{ marginTop: "16px" }}
                        >
                            Сохранить адрес
                        </button>
                    </form>
                </AdminModal>
            )}
        </div>
    );
};

export default PersonalDetails;
