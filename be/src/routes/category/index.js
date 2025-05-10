'use strict';

const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);


module.exports = router;