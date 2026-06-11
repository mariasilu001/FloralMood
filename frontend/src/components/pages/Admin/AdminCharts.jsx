import React, { useState, useContext, useMemo } from "react";
import { DBcontext } from "../../../Database"; // НАША локальная база данных
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

const AdminCharts = () => {
  const {
    orders,
    orderItems,
    orderStatuses,
    bouquets,
    tickets,
    ticketMessages,
  } = useContext(DBcontext);

  const [revenuePeriod, setRevenuePeriod] = useState("day");
  const COLORS = ["#f26076", "#1a1a2e", "#ebd6fb", "#fcd8cd", "#5e5e7a"];

  // ==========================================
  // "БЭКЕНД-ЛОГИКА" НА ФРОНТЕНДЕ (Агрегация данных)
  // ==========================================

  // 1. Выручка
  const revenueData = useMemo(() => {
    if (!orders) return [];
    const groups = orders.reduce((acc, order) => {
      const date = new Date(order.created_at);
      const key =
        revenuePeriod === "day"
          ? date.toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
            })
          : date.toLocaleDateString("ru-RU", { month: "short" });

      acc[key] = (acc[key] || 0) + order.total_price;
      return acc;
    }, {});

    return Object.entries(groups).map(([date, val]) => ({
      date,
      Выручка: val,
    }));
  }, [orders, revenuePeriod]);

  // 2. Статусы заказов
  const statusData = useMemo(() => {
    if (!orders || !orderStatuses) return [];

    const counts = orders.reduce((acc, o) => {
      acc[o.status_id] = (acc[o.status_id] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([statusId, value]) => {
      const status = orderStatuses.find((s) => s._id === BigInt(statusId));
      return { name: status ? status.name : "Неизвестно", value };
    });
  }, [orders, orderStatuses]);

  // 3. Топ букетов
  const topBouquetsData = useMemo(() => {
    if (!orderItems || !bouquets) return [];

    const counts = orderItems.reduce((acc, item) => {
      acc[item.bouquet_id] = (acc[item.bouquet_id] || 0) + item.quantity;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([bouquetId, qty]) => {
        const bq = bouquets.find((b) => b._id === BigInt(bouquetId));
        return { name: bq ? bq.name : "Кастом", Количество: qty };
      })
      .sort((a, b) => b.Количество - a.Количество)
      .slice(0, 5);
  }, [orderItems, bouquets]);

  // 4. Поддержка
  const supportData = useMemo(() => {
    if (!tickets) return [];
    const groups = tickets.reduce((acc, t) => {
      const date = new Date(t.created_at).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      });
      if (!acc[date]) acc[date] = { date, Открытые: 0, Закрытые: 0 };

      if (t.is_active) acc[date].Открытые++;
      else acc[date].Закрытые++;

      return acc;
    }, {});
    return Object.values(groups).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  }, [tickets]);

  // Заглушка
  if (!orders || !orderStatuses || !orderItems || !bouquets || !tickets) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Загружаю аналитику...
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h2>Аналитика FloralMood.</h2>
      </div>

      <div className="admin-dashboard-grid">
        {/* ГРАФИК 1: ВЫРУЧКА */}
        <div className="admin-chart-card admin-chart-card-large">
          <div className="admin-chart-header">
            <h3>Динамика выручки (₽)</h3>
            <div className="admin-chart-toggles">
              <button
                className={revenuePeriod === "day" ? "active" : ""}
                onClick={() => setRevenuePeriod("day")}
              >
                По дням
              </button>
              <button
                className={revenuePeriod === "month" ? "active" : ""}
                onClick={() => setRevenuePeriod("month")}
              >
                По месяцам
              </button>
            </div>
          </div>
          <div
            className="admin-chart-wrapper"
            style={{ minHeight: "350px", width: "100%" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e0e0eb"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#5e5e7a" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#5e5e7a" }} />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Выручка"
                  stroke="var(--color-blue)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ГРАФИК 2: СТАТУСЫ */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h3>Статусы заказов</h3>
          </div>
          <div
            className="admin-chart-wrapper"
            style={{ minHeight: "300px", width: "100%" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ГРАФИК 3: ТОП БУКЕТОВ */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h3>Топ продаваемых букетов</h3>
          </div>
          <div
            className="admin-chart-wrapper"
            style={{ minHeight: "300px", width: "100%" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topBouquetsData}
                layout="vertical"
                margin={{ left: 40 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e0e0eb"
                />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11 }}
                  width={80}
                />
                <RechartsTooltip />
                <Bar
                  dataKey="Количество"
                  fill="var(--color-text-dark)"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ГРАФИК 4: НАГРУЗКА НА ПОДДЕРЖКУ */}
        <div className="admin-chart-card admin-chart-card-large">
          <div className="admin-chart-header">
            <h3>Нагрузка на службу поддержки</h3>
          </div>
          <div
            className="admin-chart-wrapper"
            style={{ minHeight: "350px", width: "100%" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={supportData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e0e0eb"
                />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="Открытые"
                  stackId="1"
                  stroke="var(--color-error)"
                  fill="var(--color-error)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="Закрытые"
                  stackId="1"
                  stroke="#a0a0b5"
                  fill="#a0a0b5"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;
