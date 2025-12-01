const { request, response } = require('express');
const categoryService = require('../services/category.service');

const createCategoryController = async (req = request, res = response, next) => {
    try {
        const requestingUser = req.user; // Inyectado por validateJWT
        const newCategory = await categoryService.createCategory(req.body, requestingUser);

        res.status(201).json({
            ok: true,
            msg: 'Categoría creada exitosamente.',
            category: newCategory,
        });
    } catch (error) {
        next(error);
    }
};

const assignPlayerController = async (req = request, res = response, next) => {
    try {
        const { id: categoryId } = req.params;
        const { playerId } = req.body;
        const requestingUser = req.user;

        if (!playerId) {
            return res.status(400).json({ ok: false, msg: 'El campo "playerId" es obligatorio.' });
        }

        const updatedCategory = await categoryService.assignPlayerToCategory(categoryId, playerId, requestingUser);

        res.status(200).json({
            ok: true,
            msg: `Jugador asignado a la categoría '${updatedCategory.name}' exitosamente.`,
            category: updatedCategory,
        });
    } catch (error) {
        next(error);
    }
};

const getAllCategoriesController = async (req = request, res = response, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json({
            ok: true,
            categories,
        });
    } catch (error) {
        next(error);
    }
};

const getCategoryByIdController = async (req = request, res = response, next) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);
        res.status(200).json({
            ok: true,
            category,
        });
    } catch (error) {
        next(error);
    }
};

const updateCategoryController = async (req = request, res = response, next) => {
    try {
        const { id } = req.params;
        const updatedCategory = await categoryService.updateCategory(id, req.body);
        res.status(200).json({
            ok: true,
            msg: 'Categoría actualizada exitosamente.',
            category: updatedCategory,
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategoryController = async (req = request, res = response, next) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategory(id);
        res.status(200).json({ ok: true, msg: 'Categoría eliminada exitosamente.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategoryController,
    assignPlayerController,
    getAllCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
    deleteCategoryController,
};