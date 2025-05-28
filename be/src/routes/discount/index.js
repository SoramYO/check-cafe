const express = require("express");
const discountController = require("../../controllers/discount.controller");
const router = express.Router();
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");

router.use(checkAuth);


router.post("/", discountController.createDiscount);
router.get("/", discountController.getDiscounts);
router.get("/:id", discountController.getDiscountById);
router.put("/:id", discountController.updateDiscount);
router.delete("/:id", discountController.deleteDiscount);

module.exports = router;
