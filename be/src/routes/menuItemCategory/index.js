"use strict";

const express = require("express");
const router = express.Router();
const menuItemCategoryController = require("../../controllers/menuItemCategory.controller");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");


// API công khai để lấy danh sách danh mục
router.get("/public", menuItemCategoryController.getPublicCategories);

router.use(checkAuth);


router.use(checkRole([USER_ROLE.SHOP_OWNER, USER_ROLE.ADMIN]));
router.post("/", menuItemCategoryController.createCategory);
router.get("/", menuItemCategoryController.getAllCategories);
router.patch("/:categoryId", menuItemCategoryController.updateCategory);
router.delete("/:categoryId", menuItemCategoryController.deleteCategory);

module.exports = router;