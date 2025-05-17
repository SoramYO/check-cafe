import React from "react";
import * as Icons from "react-icons/tb";

// Navigation Items
const adminNavigation = [
  // Dashboard
  {
    name: "Dashboard",
    url: "/admin/dashboard",
    icon: <Icons.TbLayout className="menu_icon" />,
  },
  // Shop
  {
    name: "Shop",
    icon: <Icons.TbBuildingWarehouse className="menu_icon" />,
    url: "/shops",
    subMenu: [
      // Products
      {
        name: "Shop List",
        url: "/manage",
        icon: <Icons.TbGardenCart className="menu_icon" />,
      },
      {
        name: "Add Shop",
        url: "/add",
        icon: <Icons.TbCirclePlus className="menu_icon" />,
      },
      // Verfication
      {
        name: "Verification",
        url: "/verification",  
        icon: <Icons.TbCategory className="menu_icon" />,
      },
      // Attributes
      {
        name: "Shop Theme",
        url: "/shop-theme",
        icon: <Icons.TbCalendar className="menu_icon" />,
      },
    ],
  },
  // Advertisement
  {
    name: "Advertisement",
    url: "/advertisement",
    icon: <Icons.TbChecklist className="menu_icon" />,
    subMenu:[
      {
        name: "Manage Advertisement",
        url: "/manage",
        icon: <Icons.TbList className="menu_icon" />,
      },
      {
        name: "Add Advertisement",
        url: "/add",
        icon: <Icons.TbCirclePlus className="menu_icon" />,
      },
    ]
  },
  // Account
  {
    name: "Account",
    url: "/account",
    icon: <Icons.TbUsers className="menu_icon" />,
    subMenu:[
      {
        name: "Manage Account",
        url: "/manage",
        icon: <Icons.TbList className="menu_icon" />,
      },
      {
        name: "Add Account",
        url: "/add",
        icon: <Icons.TbCirclePlus className="menu_icon" />,
      },
    ]
  },
  // // Reviews
  // {
  //   name: "Reviews",
  //   url: "/reviews",
  //   icon: <Icons.TbStar className="menu_icon" />,
  // },
  // Brand
  {
    name: "Shop Theme",
    url: "/shop-theme",
    icon: <Icons.TbTags className="menu_icon" />,
    subMenu:[
      {
        name: "Manage Shop Theme",
        url: "/manage",
        icon: <Icons.TbList className="menu_icon" />,
      },
      {
        name: "Add Shop Theme",
        url: "/add",
        icon: <Icons.TbCirclePlus className="menu_icon" />,
      },
    ]
  },
  // // Sales
  // {
  //   name: "Sales",
  //   url: "/venue",
  //   icon: <Icons.TbCurrencyDollar className="menu_icon" />,
  // },
  // // Pages
  // {
  //   name: "Pages",
  //   url: "/pages",
  //   icon: <Icons.TbPlug className="menu_icon" />,
  // },
  // // Media
  // {
  //   name: "Media",
  //   url: "/media",
  //   icon: <Icons.TbPhoto className="menu_icon" />,
  // },
  // // Payment
  // {
  //   name: "Payment",
  //   url: "/payment",
  //   icon: <Icons.TbCreditCard className="menu_icon" />,
  //   subMenu: [
  //     // Transactions
  //     {
  //       name: "Transactions",
  //       url: "/transactions",
  //       icon: <Icons.TbCurrencyDollar className="menu_icon" />,
  //     },
  //     // Payment Methods
  //     {
  //       name: "Payment Methods",
  //       url: "/payment-method",
  //       icon: <Icons.TbDeviceMobileDollar className="menu_icon" />,
  //     },
  //   ],
  // },
  // // Settings
  // {
  //   name: "Settings",
  //   url: "/setting",
  //   icon: <Icons.TbSettings className="menu_icon" />,
  //   subMenu: [
  //     // General
  //     {
  //       name: "General",
  //       url: "/general",
  //       icon: <Icons.TbSettings className="menu_icon" />,
  //     },
  //     // Email
  //     {
  //       name: "Email",
  //       url: "/email",
  //       icon: <Icons.TbMail className="menu_icon" />,
  //     },
  //     // Languages
  //     {
  //       name: "Languages",
  //       url: "/languages",
  //       icon: <Icons.TbLanguage className="menu_icon" />,
  //     },
  //     // Permalink
  //     {
  //       name: "Permalink",
  //       url: "/permalink",
  //       icon: <Icons.TbLink className="menu_icon" />,
  //     },
  //     // Social Login
  //     {
  //       name: "Social Login",
  //       url: "/social-login",
  //       icon: <Icons.TbLogin className="menu_icon" />,
  //     },
  //     // Cronjob
  //     {
  //       name: "Cronjob",
  //       url: "/cronjob",
  //       icon: <Icons.TbClock className="menu_icon" />,
  //     },
  //     // API Settings
  //     {
  //       name: "API Settings",
  //       url: "/api",
  //       icon: <Icons.TbSettings className="menu_icon" />,
  //     },
  //   ],
  // },
  // // Platform Administration
  // {
  //   name: "Administration",
  //   url: "/admin",
  //   icon: <Icons.TbShieldLock className="menu_icon" />,
  //   subMenu: [
  //     // Roles and Permissions
  //     {
  //       name: "Roles and Permissions",
  //       url: "/admin/roles",
  //       icon: <Icons.TbUserShield className="menu_icon" />,
  //     },
  //     // Users
  //     {
  //       name: "Users",
  //       url: "/admin/users",
  //       icon: <Icons.TbUsers className="menu_icon" />,
  //     },
  //   ],
  // },
];
const shopNavigation = [
  // Dashboard
  {
    name: "Dashboard",
    url: "/shop-owner/dashboard",
    icon: <Icons.TbLayout className="menu_icon" />,
  },

// Reservation
{
  name: "Reservations",
  url: "/reservations",
  icon: <Icons.TbTags className="menu_icon" />,
  subMenu:[
    {
      name: "Manage Reservations",
      url: "/manage",
      icon: <Icons.TbList className="menu_icon" />,
    },
    {
      name: "Add Reservation",
      url: "/add",
      icon: <Icons.TbCirclePlus className="menu_icon" />,
    },
  ]
},
 
  // Orders
  {
    name: "Menu Items",
    url: "/menu-items",
    icon: <Icons.TbChecklist className="menu_icon" />,
    subMenu:[
      {
        name: "Manage Menu Items",
        url: "/manage",
        icon: <Icons.TbList className="menu_icon" />,
      },
      {
        name: "Add Menu Items",
        url: "/add",
        icon: <Icons.TbCirclePlus className="menu_icon" />,
      },
    ]
  },
  // Customers
  {
    name: "Seats",
    url: "/seats",
    icon: <Icons.TbUsers className="menu_icon" />,
    subMenu:[
      {
        name: "Manage Seats",
        url: "/manage",
        icon: <Icons.TbList className="menu_icon" />,
      },
      {
        name: "Add Seats",
        url: "/add",
        icon: <Icons.TbCirclePlus className="menu_icon" />,
      },
    ]
  },
  // Time Slots
  {
    name: "Time Slots",
    url: "/time-slots",
    icon: <Icons.TbStar className="menu_icon" />,
    subMenu:[
      {
        name: "Manage Time Slots",
        url: "/manage",
        icon: <Icons.TbList className="menu_icon" />,
      },
      {
        name: "Add Time Slots",
        url: "/add",
        icon: <Icons.TbCirclePlus className="menu_icon" />,
      },
    ]
  },
  // Brand
  // {
  //   name: "Orders",
  //   url: "/orders",
  //   icon: <Icons.TbTags className="menu_icon" />,
  //   subMenu:[
  //     {
  //       name: "Manage Orders",
  //       url: "/manage",
  //       icon: <Icons.TbList className="menu_icon" />,
  //     },
  //     {
  //       name: "Add Order",
  //       url: "/add",
  //       icon: <Icons.TbCirclePlus className="menu_icon" />,
  //     },
  //   ]
  // },
  // Sales
  {
    name: "Sales - Discounts",
    url: "/sales-discounts",
    icon: <Icons.TbCurrencyDollar className="menu_icon" />,
    subMenu:[
      {
        name: "Manage Sales - Discounts",
        url: "/manage",
        icon: <Icons.TbList className="menu_icon" />,
      },
      {
        name: "Add Sales - Discounts",
        url: "/add",
        icon: <Icons.TbCirclePlus className="menu_icon" />,
      },
    ]
  },
  // Pages
  // {
  //   name: "Pages",
  //   url: "/pages",
  //   icon: <Icons.TbPlug className="menu_icon" />,
  // },
  // Media
  {
    name: "Media",
    url: "/media",
    icon: <Icons.TbPhoto className="menu_icon" />,
  },
  // Payment
  {
    name: "Payment",
    url: "/payment",
    icon: <Icons.TbCreditCard className="menu_icon" />,
    subMenu: [
      // Transactions
      {
        name: "Transactions",
        url: "/transactions",
        icon: <Icons.TbCurrencyDollar className="menu_icon" />,
      },
      // Payment Methods
      {
        name: "Payment Methods",
        url: "/payment-method",
        icon: <Icons.TbDeviceMobileDollar className="menu_icon" />,
      },
    ],
  },
  {
    name: "Shop Information",
    icon: <Icons.TbBuildingWarehouse className="menu_icon" />,
    url: "/Shop",
    subMenu: [
      // Products
      {
        name: "Update Shop Information",
        url: "/shop/manage",
        icon: <Icons.TbGardenCart className="menu_icon" />,
      },
      // {
      //   name: "add Product",
      //   url: "/product/add",
      //   icon: <Icons.TbCirclePlus className="menu_icon" />,
      // },
      {
        name: "Verification",
        url: "/verification",
        icon: <Icons.TbCategory className="menu_icon" />,
      },
      // // Categories
      // {
      //   name: "Categories",
      //   url: "/categories/manage",  
      //   icon: <Icons.TbCategory className="menu_icon" />,
      // },
      // // Attributes
      // {
      //   name: "Attributes",
      //   url: "/product/attribute",
      //   icon: <Icons.TbCalendar className="menu_icon" />,
      // },
    ],
  },
  // Settings
  // {
  //   name: "Settings",
  //   url: "/setting",
  //   icon: <Icons.TbSettings className="menu_icon" />,
  //   subMenu: [
  //     // General
  //     {
  //       name: "General",
  //       url: "/general",
  //       icon: <Icons.TbSettings className="menu_icon" />,
  //     },
  //     // Email
  //     {
  //       name: "Email",
  //       url: "/email",
  //       icon: <Icons.TbMail className="menu_icon" />,
  //     },
  //     // Languages
  //     {
  //       name: "Languages",
  //       url: "/languages",
  //       icon: <Icons.TbLanguage className="menu_icon" />,
  //     },
  //     // Permalink
  //     {
  //       name: "Permalink",
  //       url: "/permalink",
  //       icon: <Icons.TbLink className="menu_icon" />,
  //     },
  //     // Social Login
  //     {
  //       name: "Social Login",
  //       url: "/social-login",
  //       icon: <Icons.TbLogin className="menu_icon" />,
  //     },
  //     // Cronjob
  //     {
  //       name: "Cronjob",
  //       url: "/cronjob",
  //       icon: <Icons.TbClock className="menu_icon" />,
  //     },
  //     // API Settings
  //     {
  //       name: "API Settings",
  //       url: "/api",
  //       icon: <Icons.TbSettings className="menu_icon" />,
  //     },
  //   ],
  // },
  // Platform Administration
  // {
  //   name: "Administration",
  //   url: "/admin",
  //   icon: <Icons.TbShieldLock className="menu_icon" />,
  //   subMenu: [
  //     // Roles and Permissions
  //     {
  //       name: "Roles and Permissions",
  //       url: "/admin/roles",
  //       icon: <Icons.TbUserShield className="menu_icon" />,
  //     },
  //     // Users
  //     {
  //       name: "Users",
  //       url: "/admin/users",
  //       icon: <Icons.TbUsers className="menu_icon" />,
  //     },
  //   ],
  // },
];

export { adminNavigation, shopNavigation };