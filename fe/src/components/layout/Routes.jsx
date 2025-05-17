// General
import NotFound from "../../pages/error/NotFound";
import Dashboard from "../../pages/dashboard/Overview";

// Media
import Media from "../../pages/media/Media.jsx";

// Settings
import Api from "../../pages/settings/Api";
import Email from "../../pages/settings/Email";
import General from "../../pages/settings/General";
import CronJob from "../../pages/settings/CronJob";
import Permalink from "../../pages/settings/Permalink";
import Languages from "../../pages/settings/Languages";
import SocialLogin from "../../pages/settings/SocialLogin";

// Products
import Attribute from "../../pages/products/Attribute";
import AddProduct from "../../pages/products/AddProduct";
import EditProduct from "../../pages/products/EditProduct";
import ManageProduct from "../../pages/products/ManageProduct";

// Orders
import AddOrder from "../../pages/orders/AddOrder";
import ManageOrder from "../../pages/orders/ManageOrder";
import OrderDetail from "../../pages/orders/OrderDetail";

// Brand
import AddBrand from "../../pages/brands/AddBrand";
import ManageBrand from "../../pages/brands/ManageBrand";
import EditBrand from "../../pages/brands/EditBrand";

// Customer
import AddCustomer from "../../pages/customers/AddCustomer";
import EditCustomer from "../../pages/customers/EditCustomer";
import ManageCustomer from "../../pages/customers/ManageCustomer";

// Users
import AddUser from "../../pages/users/AddUser";
import EditUser from "../../pages/users/EditUser";
import UserList from "../../pages/users/UserList";

// Venue
import AddVenue from "../../pages/venue/AddVenue";
import ManageVenue from "../../pages/venue/ManageVenue";

// Categories
import AddCategories from "../../pages/categories/AddCategories";
import EditCategories from "../../pages/categories/EditCategories";
import ManageCategories from "../../pages/categories/ManageCategories";

// Reviews
import ManageReviews from "../../pages/reviews/ManageReviews";
import ReviewsDetail from "../../pages/reviews/ReviewsDetail";

// Pages
import AddPage from "../../pages/pages/AddPage";
import EditPage from "../../pages/pages/EditPage";
import ManagePages from "../../pages/pages/ManagePages";

// Payment
import ManageTransactions from "../../pages/payment/ManageTransactions";
import PaymentMethod from "../../pages/payment/PaymentMethod";
import TransactionDetail from "../../pages/payment/TransactionDetail";

// Shops
import ManageShop from "../../pages/shops/ManageShop";
import AddShop from "../../pages/shops/AddShop.jsx";
import ShopTheme from "../../pages/shops/ShopTheme.jsx";

// Advertisements
import AddAdverisement from "../../pages/adverisement/AddAdverisement.jsx";
import ManageAdverisement from "../../pages/adverisement/ManageAdverisement.jsx";

// Reservations (Assumed components)
import AddReservation from "../../pages/reservations/AddReservation.jsx";
import ManageReservation from "../../pages/reservations/ManageReservation.jsx";

// Menu Items (Assumed components)
import AddMenuItem from "../../pages/menu-items/AddMenuItem.jsx";
import ManageMenuItems from "../../pages/menu-items/ManageMenuItems.jsx";

// Seats (Assumed components)
import AddSeat from "../../pages/seats/AddSeat.jsx";
import ManageSeats from "../../pages/seats/ManageSeats.jsx";

// Time Slots (Assumed components)
import AddTimeSlot from "../../pages/time-slots/AddTimeSlot.jsx";
import ManageTimeSlots from "../../pages/time-slots/ManageTimeSlots.jsx";

// Sales - Discounts (Assumed components)
import AddSalesDiscount from "../../pages/sales-discounts/AddSalesDiscount.jsx";
import ManageSalesDiscounts from "../../pages/sales-discounts/ManageSalesDiscounts.jsx";

// Shop Themes (Assumed components)
import AddShopTheme from "../../pages/shop-theme/AddShopTheme.jsx";
import ManageShopThemes from "../../pages/shop-theme/ManageShopThemes.jsx";

const adminRoutes = [
  {
    path: "/admin/dashboard",
    element: <Dashboard />,
  },
  // Shops
  {
    path: "/shops/add",
    element: <AddShop />,
  },
  {
    path: "/shops/manage",
    element: <ManageShop />,
  },
  {
    path: "/shops/verification",
    element: <ManageShop />,
  },
  {
    path: "/shops/shop-theme",
    element: <ShopTheme />,
  },
  // Shop Themes
  {
    path: "/shop-theme/add",
    element: <AddShopTheme />,
  },
  {
    path: "/shop-theme/manage",
    element: <ManageShopThemes />,
  },
  // Advertisements
  {
    path: "/advertisement/add",
    element: <AddAdverisement />,
  },
  {
    path: "/advertisement/manage",
    element: <ManageAdverisement />,
  },
  // Users (Account)
  {
    path: "/account/add",
    element: <AddUser />,
  },
  {
    path: "/account/manage",
    element: <UserList />,
  },
  {
    path: "/account/manage/:userid",
    element: <EditUser />,
  },
  // Orders
  {
    path: "/orders/manage/:orderID",
    element: <OrderDetail />,
  },
  // Categories
  {
    path: "/catalog/categories/manage",
    element: <ManageCategories />,
  },
  {
    path: "/catalog/categories/:categoryid",
    element: <EditCategories />,
  },
  // Customers
  {
    path: "/customers/add",
    element: <AddCustomer />,
  },
  {
    path: "/customers/manage",
    element: <ManageCustomer />,
  },
  {
    path: "/customers/manage/:customerId",
    element: <EditCustomer />,
  },
  // Brands
  {
    path: "/brands/add",
    element: <AddBrand />,
  },
  {
    path: "/brands/manage",
    element: <ManageBrand />,
  },
  {
    path: "/brands/manage/:brandId",
    element: <EditBrand />,
  },
  // Venue
  {
    path: "/venue/add",
    element: <AddVenue />,
  },
  {
    path: "/venue/manage",
    element: <ManageVenue />,
  },
  // Reviews
  {
    path: "/reviews",
    element: <ManageReviews />,
  },
  {
    path: "/reviews/:reviewid",
    element: <ReviewsDetail />,
  },
  // Pages
  {
    path: "/pages",
    element: <ManagePages />,
  },
  {
    path: "/pages/add",
    element: <AddPage />,
  },
  {
    path: "/pages/:pageId",
    element: <EditPage />,
  },
  // Payment
  {
    path: "/payment/transactions",
    element: <ManageTransactions />,
  },
  {
    path: "/payment/transactions/:transactionId",
    element: <TransactionDetail />,
  },
  {
    path: "/payment/payment-method",
    element: <PaymentMethod />,
  },
  // Media
  {
    path: "/media",
    element: <Media />,
  },
  // Settings
  {
    path: "/setting/general",
    element: <General />,
  },
  {
    path: "/setting/email",
    element: <Email />,
  },
  {
    path: "/setting/cronJob",
    element: <CronJob />,
  },
  {
    path: "/setting/permalink",
    element: <Permalink />,
  },
  {
    path: "/setting/languages",
    element: <Languages />,
  },
  {
    path: "/setting/social-login",
    element: <SocialLogin />,
  },
  {
    path: "/setting/api",
    element: <Api />,
  },
  // Not Found
  {
    path: "*",
    element: <NotFound />,
  },
];

const shopRoutes = [
  {
    path: "/shop-owner/dashboard",
    element: <Dashboard />,
  },
  // Shop Information
  {
    path: "/shop/manage",
    element: <ManageShop />,
  },
  {
    path: "/shop/verification",
    element: <ManageShop />,
  },
  // Reservations
  {
    path: "/reservations/add",
    element: <AddReservation />,
  },
  {
    path: "/reservations/manage",
    element: <ManageReservation />,
  },
  // Menu Items
  {
    path: "/menu-items/add",
    element: <AddMenuItem />,
  },
  {
    path: "/menu-items/manage",
    element: <ManageMenuItems />,
  },
  // Seats
  {
    path: "/seats/add",
    element: <AddSeat />,
  },
  {
    path: "/seats/manage",
    element: <ManageSeats />,
  },
  // Time Slots
  {
    path: "/time-slots/add",
    element: <AddTimeSlot />,
  },
  {
    path: "/time-slots/manage",
    element: <ManageTimeSlots />,
  },
  // Sales - Discounts
  {
    path: "/sales-discounts/add",
    element: <AddSalesDiscount />,
  },
  {
    path: "/sales-discounts/manage",
    element: <ManageSalesDiscounts />,
  },
  // Products
  {
    path: "/catalog/product/manage/:productId",
    element: <EditProduct />,
  },
  {
    path: "/catalog/product/attribute",
    element: <Attribute />,
  },
  // Orders
  {
    path: "/orders/add",
    element: <AddOrder />,
  },
  {
    path: "/orders/manage",
    element: <ManageOrder />,
  },
  {
    path: "/orders/manage/:orderID",
    element: <OrderDetail />,
  },
  // Categories
  {
    path: "/catalog/categories/manage",
    element: <ManageCategories />,
  },
  {
    path: "/catalog/categories/:categoryid",
    element: <EditCategories />,
  },
  // Customers
  {
    path: "/customers/add",
    element: <AddCustomer />,
  },
  {
    path: "/customers/manage",
    element: <ManageCustomer />,
  },
  {
    path: "/customers/manage/:customerId",
    element: <EditCustomer />,
  },
  // Brands
  {
    path: "/brands/add",
    element: <AddBrand />,
  },
  {
    path: "/brands/manage",
    element: <ManageBrand />,
  },
  {
    path: "/brands/manage/:brandId",
    element: <EditBrand />,
  },
  // Users
  {
    path: "/users/list",
    element: <UserList />,
  },
  {
    path: "/users/add",
    element: <AddUser />,
  },
  {
    path: "/users/list/:userid",
    element: <EditUser />,
  },
  // Venue
  {
    path: "/venue/add",
    element: <AddVenue />,
  },
  {
    path: "/venue/manage",
    element: <ManageVenue />,
  },
  // Reviews
  {
    path: "/reviews",
    element: <ManageReviews />,
  },
  {
    path: "/reviews/:reviewid",
    element: <ReviewsDetail />,
  },
  // Pages
  {
    path: "/pages",
    element: <ManagePages />,
  },
  {
    path: "/pages/add",
    element: <AddPage />,
  },
  {
    path: "/pages/:pageId",
    element: <EditPage />,
  },
  // Payment
  {
    path: "/payment/transactions",
    element: <ManageTransactions />,
  },
  {
    path: "/payment/transactions/:transactionId",
    element: <TransactionDetail />,
  },
  {
    path: "/payment/payment-method",
    element: <PaymentMethod />,
  },
  // Media
  {
    path: "/media",
    element: <Media />,
  },
  // Settings
  {
    path: "/setting/general",
    element: <General />,
  },
  {
    path: "/setting/email",
    element: <Email />,
  },
  {
    path: "/setting/cronJob",
    element: <CronJob />,
  },
  {
    path: "/setting/permalink",
    element: <Permalink />,
  },
  {
    path: "/setting/languages",
    element: <Languages />,
  },
  {
    path: "/setting/social-login",
    element: <SocialLogin />,
  },
  {
    path: "/setting/api",
    element: <Api />,
  },
  // Not Found
  {
    path: "*",
    element: <NotFound />,
  },
];

export { adminRoutes, shopRoutes };