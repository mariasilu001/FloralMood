import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DBcontext } from "../../../Database"; // Я подключил НАШУ базу.
import AdminModal from "../../admin/AdminModal";

const PersonalDetails = () => {
  const navigate = useNavigate();

  // 1. Я вытаскиваю таблицы пользователей и адресов из нашей базы
  const { users, setUsers, deliveryAddresses, setDeliveryAddresses } =
    useContext(DBcontext);

  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [newAddress, setNewAddress] = useState({
    city: "",
    street: "",
    house: "",
    apartment: "",
  });

  // 2. СЕССИЯ: Жесткий поиск тебя по BigInt
  const userIdStr = localStorage.getItem("userId");
  const user =
    userIdStr && users ? users.find((u) => u._id === BigInt(userIdStr)) : null;

  // 3. АВТОЗАПОЛНЕНИЕ ФОРМЫ
  useEffect(() => {
    if (user) {
      setUserData({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // 4. ПРЕДОХРАНИТЕЛЬ
  if (!users || !deliveryAddresses) {
    return <div style={{ padding: "20px" }}>Загрузка твоих данных...</div>;
  }
  if (!user) return null; // Если сессии нет, макет профиля сам выкинет тебя.

  // Вытаскиваем только ТВОИ адреса из общей таблицы
  const myAddresses = deliveryAddresses.filter(
    (addr) => addr.user_id === user._id,
  );

  // ==========================================
  // ЭКШЕНЫ (Механика контроля данных)
  // ==========================================

  const handleSaveUser = () => {
    if (!userData.username || !userData.email) {
      alert("Поля не могут быть пустыми. Я требую порядка.");
      return;
    }

    // Я безжалостно перезаписываю твои данные в таблице
    const updatedUsers = users.map((u) => {
      if (u._id === user._id) {
        // Оператор расширения (...) копирует старые данные, а новые ключи их заменяют
        return { ...u, username: userData.username, email: userData.email };
      }
      return u;
    });

    // Отправляем приказ обновить базу
    setUsers(updatedUsers);
    setEditMode(false);
    alert("Твои данные сохранены в локальной памяти.");
  };

  const handleLogout = () => {
    // Я стираю твой идентификатор из хранилища. Больше никаких токенов.
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleAddAddress = (e) => {
    e.preventDefault(); // Запрещаю браузеру обновлять страницу
    if (!newAddress.city || !newAddress.street || !newAddress.house) {
      alert("Город, улица и дом обязательны.");
      return;
    }

    // Генерируем новый BigInt для адреса
    const maxId = deliveryAddresses.reduce(
      (max, addr) => (addr._id > max ? addr._id : max),
      0n,
    );

    const newAddrObj = {
      _id: maxId + 1n,
      user_id: user._id, // Привязываем адрес строго к тебе
      city: newAddress.city,
      street: newAddress.street,
      house: newAddress.house,
      apartment: newAddress.apartment,
      created_at: new Date(),
      deleted_at: null,
    };

    // Добавляем новый объект в массив
    setDeliveryAddresses([...deliveryAddresses, newAddrObj]);

    setIsAddressModalOpen(false);
    setNewAddress({ city: "", street: "", house: "", apartment: "" });
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm("Удалить этот адрес навсегда?")) {
      // Оставляем в массиве только те адреса, чей _id НЕ совпадает с удаляемым
      const filteredAddresses = deliveryAddresses.filter(
        (addr) => addr._id !== addressId,
      );
      setDeliveryAddresses(filteredAddresses);
    }
  };

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
              <button className="profile-btn-primary" onClick={handleSaveUser}>
                Сохранить
              </button>
              <button
                className="profile-btn-outline"
                onClick={() => {
                  setEditMode(false);
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

        {myAddresses.length === 0 ? (
          <p className="admin-text-muted">
            У тебя пока нет сохраненных адресов, Лили.
          </p>
        ) : (
          <div className="address-grid">
            {myAddresses.map((addr) => (
              <div key={addr._id} className="address-card">
                <div className="address-card-icon">📍</div>
                <div className="address-card-info">
                  <strong>г. {addr.city}</strong>
                  <p>
                    ул. {addr.street}, д. {addr.house}{" "}
                    {addr.apartment ? `, кв. ${addr.apartment}` : ""}
                  </p>
                </div>
                <button
                  className="address-delete-btn"
                  onClick={() => handleDeleteAddress(addr._id)}
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
        <p className="admin-text-muted" style={{ marginBottom: "16px" }}>
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
          <form className="admin-bouquets-form" onSubmit={handleAddAddress}>
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
                <label>Квартира (необязательно):</label>
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
