const sequelize = require("../db.js");

// ========== Импорт всех моделей ==========
const UserRole = require("./UserRole.js");
const User = require("./User.js");
const SearchHistory = require("./SearchHistory.js");
const TicketSubject = require("./TicketSubject.js");
const Ticket = require("./Ticket.js");
const TicketMessage = require("./TicketMessage.js");
const UserDeliveryAddress = require("./UserDeliveryAddress.js");
const ComponentCategory = require("./ComponentCategory.js");
const Component = require("./Component.js");
const ComponentPrice = require("./ComponentPrice.js");
const Bouquet = require("./Bouquet.js");
const BouquetComponent = require("./BouquetComponent.js");
const Tag = require("./Tag.js");
const BouquetTag = require("./BouquetTag.js");
const Favorite = require("./Favorite.js");
const CartItem = require("./CartItem.js");
const OrderStatus = require("./OrderStatus.js");
const PaymentMethod = require("./PaymentMethod.js");
const DeliverTimeSlot = require("./DeliverTimeSlot.js");
const Order = require("./Order.js");
const OrderItem = require("./OrderItem.js");
const Review = require("./Review.js");
const ReviewPhoto = require("./ReviewPhoto.js");
const EventType = require("./EventType.js");
const EventTypeTag = require("./EventTypeTag.js");
const Event = require("./Event.js");
const GlobalEvent = require("./GlobalEvent.js");

// ========== Связи UserRole ⇄ User ==========
UserRole.hasMany(User, {
    foreignKey: "role_id",
    onDelete: "RESTRICT",
    as: "users",
});

User.belongsTo(UserRole, {
    foreignKey: "role_id",
    as: "role",
});

// ========== Связи User ⇄ SearchHistory ==========
User.hasMany(SearchHistory, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "searches",
});

SearchHistory.belongsTo(User, {
    foreignKey: "user_id",
    as: "author",
});

// ========== Связи User ⇄ UserDeliveryAddress ==========
User.hasMany(UserDeliveryAddress, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "addresses",
});

UserDeliveryAddress.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

// ========== Связи TicketSubject ⇄ Ticket ==========
TicketSubject.hasMany(Ticket, {
    foreignKey: "subject_id",
    onDelete: "RESTRICT",
    as: "tickets",
});

Ticket.belongsTo(TicketSubject, {
    foreignKey: "subject_id",
    as: "subject",
});

// ========== Связи User ⇄ Ticket ==========
User.hasMany(Ticket, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "tickets",
});

Ticket.belongsTo(User, {
    foreignKey: "user_id",
    as: "author",
});

// ========== Связи Ticket ⇄ TicketMessage ==========
Ticket.hasMany(TicketMessage, {
    foreignKey: "ticket_id",
    onDelete: "CASCADE",
    as: "messages",
});

TicketMessage.belongsTo(Ticket, {
    foreignKey: "ticket_id",
    as: "ticket",
});

// ========== Связи User ⇄ TicketMessage ==========
User.hasMany(TicketMessage, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "ticketMessages",
});

TicketMessage.belongsTo(User, {
    foreignKey: "user_id",
    as: "author",
});

// ========== Связи ComponentCategory ⇄ Component ==========
ComponentCategory.hasMany(Component, {
    foreignKey: "category_id",
    onDelete: "RESTRICT",
    as: "components",
});

Component.belongsTo(ComponentCategory, {
    foreignKey: "category_id",
    as: "category",
});

// ========== Связи Component ⇄ ComponentPrice ==========
Component.hasMany(ComponentPrice, {
    foreignKey: "component_id",
    onDelete: "CASCADE",
    as: "prices",
});

ComponentPrice.belongsTo(Component, {
    foreignKey: "component_id",
    as: "component",
});

// ========== Связи Component ⇄ BouquetComponent ⇄ Bouquet (many-to-many через промежуточную таблицу) ==========
Component.hasMany(BouquetComponent, {
    foreignKey: "component_id",
    onDelete: "CASCADE",
    as: "bouquetComponents",
});

BouquetComponent.belongsTo(Component, {
    foreignKey: "component_id",
    as: "component",
});

Bouquet.hasMany(BouquetComponent, {
    foreignKey: "bouquet_id",
    onDelete: "CASCADE",
    as: "bouquetComponents",
});

BouquetComponent.belongsTo(Bouquet, {
    foreignKey: "bouquet_id",
    as: "bouquet",
});

// Дополнительная прямая связь many-to-many (позволяет делать include без промежуточной)
Component.belongsToMany(Bouquet, {
    through: BouquetComponent,
    foreignKey: "component_id",
    otherKey: "bouquet_id",
    as: "bouquets",
});

Bouquet.belongsToMany(Component, {
    through: BouquetComponent,
    foreignKey: "bouquet_id",
    otherKey: "component_id",
    as: "components",
});

// ========== Связи Bouquet ⇄ BouquetTag ⇄ Tag (many-to-many) ==========
Bouquet.hasMany(BouquetTag, {
    foreignKey: "bouquet_id",
    onDelete: "CASCADE",
    as: "bouquetTags",
});

BouquetTag.belongsTo(Bouquet, {
    foreignKey: "bouquet_id",
    as: "bouquet",
});

Tag.hasMany(BouquetTag, {
    foreignKey: "tag_id",
    onDelete: "CASCADE",
    as: "bouquetTags",
});

BouquetTag.belongsTo(Tag, {
    foreignKey: "tag_id",
    as: "tag",
});

// Прямая many-to-many
Bouquet.belongsToMany(Tag, {
    through: BouquetTag,
    foreignKey: "bouquet_id",
    otherKey: "tag_id",
    as: "tags",
});

Tag.belongsToMany(Bouquet, {
    through: BouquetTag,
    foreignKey: "tag_id",
    otherKey: "bouquet_id",
    as: "bouquets",
});

// ========== Связи User ⇄ Favorite ⇄ Bouquet ==========
User.hasMany(Favorite, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "favorites",
});

Favorite.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

Bouquet.hasMany(Favorite, {
    foreignKey: "bouquet_id",
    onDelete: "CASCADE",
    as: "favorites",
});

Favorite.belongsTo(Bouquet, {
    foreignKey: "bouquet_id",
    as: "bouquet",
});

// Прямая many-to-many
User.belongsToMany(Bouquet, {
    through: Favorite,
    foreignKey: "user_id",
    otherKey: "bouquet_id",
    as: "favoriteBouquets",
});

Bouquet.belongsToMany(User, {
    through: Favorite,
    foreignKey: "bouquet_id",
    otherKey: "user_id",
    as: "favoritedByUsers",
});

// ========== Связи User ⇄ CartItem ⇄ Bouquet ==========
User.hasMany(CartItem, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "cartItems",
});

CartItem.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

Bouquet.hasMany(CartItem, {
    foreignKey: "bouquet_id",
    onDelete: "CASCADE",
    as: "cartItems",
});

CartItem.belongsTo(Bouquet, {
    foreignKey: "bouquet_id",
    as: "bouquet",
});

// Прямая many-to-many
User.belongsToMany(Bouquet, {
    through: CartItem,
    foreignKey: "user_id",
    otherKey: "bouquet_id",
    as: "cartBouquets",
});

Bouquet.belongsToMany(User, {
    through: CartItem,
    foreignKey: "bouquet_id",
    otherKey: "user_id",
    as: "inCartsOfUsers",
});

// ========== Связи OrderStatus ⇄ Order ==========
OrderStatus.hasMany(Order, {
    foreignKey: "status_id",
    onDelete: "RESTRICT",
    as: "orders",
});

Order.belongsTo(OrderStatus, {
    foreignKey: "status_id",
    as: "status",
});

// ========== Связи PaymentMethod ⇄ Order ==========
PaymentMethod.hasMany(Order, {
    foreignKey: "payment_method_id",
    onDelete: "RESTRICT",
    as: "orders",
});

Order.belongsTo(PaymentMethod, {
    foreignKey: "payment_method_id",
    as: "paymentMethod",
});

// ========== Связи DeliverTimeSlot ⇄ Order ==========
DeliverTimeSlot.hasMany(Order, {
    foreignKey: "time_slot_id",
    onDelete: "RESTRICT",
    as: "orders",
});

Order.belongsTo(DeliverTimeSlot, {
    foreignKey: "time_slot_id",
    as: "timeSlot",
});

// ========== Связи UserDeliveryAddress ⇄ Order ==========
UserDeliveryAddress.hasMany(Order, {
    foreignKey: "address_id",
    onDelete: "RESTRICT",
    as: "orders",
});

Order.belongsTo(UserDeliveryAddress, {
    foreignKey: "address_id",
    as: "address",
});

// ========== Связи User ⇄ Order ==========
User.hasMany(Order, {
    foreignKey: "user_id",
    onDelete: "RESTRICT",
    as: "orders",
});

Order.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

// ========== Связи Order ⇄ OrderItem ⇄ Bouquet ==========
Order.hasMany(OrderItem, {
    foreignKey: "order_id",
    onDelete: "CASCADE",
    as: "orderItems",
});

OrderItem.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order",
});

Bouquet.hasMany(OrderItem, {
    foreignKey: "bouquet_id",
    onDelete: "RESTRICT",
    as: "orderItems",
});

OrderItem.belongsTo(Bouquet, {
    foreignKey: "bouquet_id",
    as: "bouquet",
});

// Прямая many-to-many
Order.belongsToMany(Bouquet, {
    through: OrderItem,
    foreignKey: "order_id",
    otherKey: "bouquet_id",
    as: "bouquets",
});

Bouquet.belongsToMany(Order, {
    through: OrderItem,
    foreignKey: "bouquet_id",
    otherKey: "order_id",
    as: "orders",
});

// ========== Связи User ⇄ Review ==========
User.hasMany(Review, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "reviews",
});

Review.belongsTo(User, {
    foreignKey: "user_id",
    as: "author",
});

// ========== Связи Bouquet ⇄ Review ==========
Bouquet.hasMany(Review, {
    foreignKey: "bouquet_id",
    onDelete: "CASCADE",
    as: "reviews",
});

Review.belongsTo(Bouquet, {
    foreignKey: "bouquet_id",
    as: "bouquet",
});

// ========== Связи Order ⇄ Review ==========
Order.hasMany(Review, {
    foreignKey: "order_id",
    onDelete: "CASCADE",
    as: "reviews",
});

Review.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order",
});

// ========== Связи Review ⇄ ReviewPhoto ==========
Review.hasMany(ReviewPhoto, {
    foreignKey: "review_id",
    onDelete: "CASCADE",
    as: "photos",
});

ReviewPhoto.belongsTo(Review, {
    foreignKey: "review_id",
    as: "review",
});

// ========== Связи EventType ⇄ EventTypeTag ⇄ Tag (many-to-many) ==========
EventType.hasMany(EventTypeTag, {
    foreignKey: "event_type_id",
    onDelete: "CASCADE",
    as: "eventTypeTags",
});

EventTypeTag.belongsTo(EventType, {
    foreignKey: "event_type_id",
    as: "eventType",
});

Tag.hasMany(EventTypeTag, {
    foreignKey: "tag_id",
    onDelete: "CASCADE",
    as: "eventTypeTags",
});

EventTypeTag.belongsTo(Tag, {
    foreignKey: "tag_id",
    as: "tag",
});

// Прямая many-to-many
EventType.belongsToMany(Tag, {
    through: EventTypeTag,
    foreignKey: "event_type_id",
    otherKey: "tag_id",
    as: "tags",
});

Tag.belongsToMany(EventType, {
    through: EventTypeTag,
    foreignKey: "tag_id",
    otherKey: "event_type_id",
    as: "eventTypes",
});

// ========== Связи User ⇄ Event ==========
User.hasMany(Event, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
    as: "events",
});

Event.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

// ========== Связи EventType ⇄ Event ==========
EventType.hasMany(Event, {
    foreignKey: "event_type_id",
    onDelete: "RESTRICT",
    as: "userEvents",
});

Event.belongsTo(EventType, {
    foreignKey: "event_type_id",
    as: "eventType",
});

// ========== Связи EventType ⇄ GlobalEvent ==========
EventType.hasMany(GlobalEvent, {
    foreignKey: "event_type_id",
    onDelete: "RESTRICT",
    as: "globalEvents",
});

GlobalEvent.belongsTo(EventType, {
    foreignKey: "event_type_id",
    as: "eventType",
});

// ========== Экспорт всех моделей (чтобы можно было делать const { User, Order } = require('./models'); в других файлах) ==========
module.exports = {
    sequelize,
    UserRole,
    User,
    SearchHistory,
    TicketSubject,
    Ticket,
    TicketMessage,
    UserDeliveryAddress,
    ComponentCategory,
    Component,
    ComponentPrice,
    Bouquet,
    BouquetComponent,
    Tag,
    BouquetTag,
    Favorite,
    CartItem,
    OrderStatus,
    PaymentMethod,
    DeliverTimeSlot,
    Order,
    OrderItem,
    Review,
    ReviewPhoto,
    EventType,
    EventTypeTag,
    Event,
    GlobalEvent,
};
