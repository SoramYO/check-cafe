'use strict';
const { createGenericRepository } = require('../repositories/generic-repository');
const Category = require('../models/category.model');
const categoryRepository = createGenericRepository(Category);

class CategoryService {
    getCategories = async (query) => {
        try {
            const { page, size, ...filter } = query;
            const categories = await categoryRepository.paginate(filter, {
                page: page,
                size: size,
            });
            return categories;
        } catch (error) {
            throw new Error(error);
        }
    }
    createCategory = async (data) => {
        try {
            const category = await categoryRepository.create(data);
            return category;
        } catch (error) {
            throw new Error(error);
        }
    }
    updateCategory = async (id, data) => {
        try {
            const category = await categoryRepository.update(id, data);
            return category;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = new CategoryService();
