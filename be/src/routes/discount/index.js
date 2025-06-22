const express = require("express");
const discountController = require("../../controllers/discount.controller");
const router = express.Router();
const { checkAuth, checkRole, checkShopOwnerHasShop } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");

router.use(checkAuth);

// Routes cho Admin và Shop Owner
router.post("/", 
    checkRole([USER_ROLE.ADMIN, USER_ROLE.SHOP_OWNER]),
    checkShopOwnerHasShop, // Đảm bảo shop owner có shop
    discountController.createDiscount
);

router.get("/", 
    checkRole([USER_ROLE.ADMIN, USER_ROLE.SHOP_OWNER]), 
    discountController.getDiscounts
);

router.get("/:id", 
    checkRole([USER_ROLE.ADMIN, USER_ROLE.SHOP_OWNER]), 
    discountController.getDiscountById
);

router.put("/:id", 
    checkRole([USER_ROLE.ADMIN, USER_ROLE.SHOP_OWNER]),
    checkShopOwnerHasShop, // Đảm bảo shop owner có shop
    discountController.updateDiscount
);

router.delete("/:id", 
    checkRole([USER_ROLE.ADMIN, USER_ROLE.SHOP_OWNER]),
    checkShopOwnerHasShop, // Đảm bảo shop owner có shop
    discountController.deleteDiscount
);

// Routes cho Customer
router.get("/available/list", 
    checkRole([USER_ROLE.CUSTOMER]), 
    discountController.getAvailableDiscounts
);

router.post("/validate", 
    checkRole([USER_ROLE.CUSTOMER]), 
    discountController.validateDiscount
);

router.post("/apply", 
    checkRole([USER_ROLE.CUSTOMER]), 
    discountController.applyDiscount
);

// Routes cho lịch sử sử dụng - tất cả role
router.get("/usage/history", 
    checkRole([USER_ROLE.ADMIN, USER_ROLE.SHOP_OWNER, USER_ROLE.CUSTOMER]), 
    discountController.getDiscountUsageHistory
);

module.exports = router;
