import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../../App";
import api from "../../../api/axios";
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
    const { adminData, setAdminData } = useContext(AppContext);
    const [revenuePeriod, setRevenuePeriod] = useState("day");

    const COLORS = ["#f26076", "#1a1a2e", "#ebd6fb", "#fcd8cd", "#5e5e7a"];

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const res = await api.get(
                    `/admin/stats/revenue?period=${revenuePeriod}`,
                );
                setAdminData((prev) => ({
                    ...prev,
                    revenueStats: res.data.data,
                }));
            } catch (error) {
                console.error(error);
            }
        };
        fetchRevenue();
    }, [revenuePeriod, setAdminData]);

    const revenueData = adminData.revenueStats || [];
    const statusData = adminData.statusesStats || [];
    const topBouquetsData = adminData.topBouquets || [];
    const supportData = adminData.supportStats || [];

    const averageRating = "4.9";

    return (
        <div className="admin-dashboard-container">
            <div className="admin-dashboard-header">
                <h2>Аналитика FloralMood.</h2>
                <div className="admin-stat-widget">
                    <span className="admin-stat-label">
                        Средний рейтинг магазина:
                    </span>
                    <span className="admin-stat-value">★ {averageRating}</span>
                </div>
            </div>

            <div className="admin-dashboard-grid">
                {/* ГРАФИК 1: ВЫРУЧКА */}
                <div className="admin-chart-card admin-chart-card-large">
                    <div className="admin-chart-header">
                        <h3>Динамика выручки (₽)</h3>
                        <div className="admin-chart-toggles">
                            <button
                                className={
                                    revenuePeriod === "day" ? "active" : ""
                                }
                                onClick={() => setRevenuePeriod("day")}
                            >
                                По дням
                            </button>
                            <button
                                className={
                                    revenuePeriod === "month" ? "active" : ""
                                }
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
                            <LineChart
                                data={revenueData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e0e0eb"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: "#5e5e7a" }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: "#5e5e7a" }}
                                />
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
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ГРАФИК 2: ВОРОНКА */}
                <div className="admin-chart-card">
                    <div className="admin-chart-header">
                        <h3>Статусы заказов</h3>
                    </div>
                    {/* Я ЖЕСТКО ЗАДАЛ ВЫСОТУ */}
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
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="admin-chart-legend">
                        {statusData.map((entry, index) => (
                            <div
                                key={`legend-${index}`}
                                className="admin-legend-item"
                            >
                                <span
                                    className="admin-legend-color"
                                    style={{
                                        backgroundColor:
                                            COLORS[index % COLORS.length],
                                    }}
                                ></span>
                                <span className="admin-legend-text">
                                    {entry.name} ({entry.value})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ГРАФИК 3: ТОП БУКЕТОВ */}
                <div className="admin-chart-card">
                    <div className="admin-chart-header">
                        <h3>Топ продаваемых букетов</h3>
                    </div>
                    {/* Я ЖЕСТКО ЗАДАЛ ВЫСОТУ */}
                    <div
                        className="admin-chart-wrapper"
                        style={{ minHeight: "300px", width: "100%" }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={topBouquetsData}
                                layout="vertical"
                                margin={{
                                    top: 0,
                                    right: 20,
                                    left: 40,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                    stroke="#e0e0eb"
                                />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 12, fill: "#5e5e7a" }}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 11, fill: "#1a1a2e" }}
                                    width={80}
                                />
                                <RechartsTooltip
                                    cursor={{
                                        fill: "rgba(242, 96, 118, 0.05)",
                                    }}
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                />
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
                        <h3>Нагрузка на службу поддержки (Тикеты)</h3>
                    </div>
                    {/* Я ЖЕСТКО ЗАДАЛ ВЫСОТУ */}
                    <div
                        className="admin-chart-wrapper"
                        style={{ minHeight: "350px", width: "100%" }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={supportData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e0e0eb"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: "#5e5e7a" }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: "#5e5e7a" }}
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                />
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
