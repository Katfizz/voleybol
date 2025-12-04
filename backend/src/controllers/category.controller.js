const categoryService = require('../services/category.service');
const { AppError } = require('../utils/errors');

const createCategoryController = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body, req.user);
        res.status(201).json({
            ok: true,
            msg: 'Categoría creada exitosamente.',
            category,
        });
    } catch (error) {
        const statusCode = error instanceof AppError ? error.statusCode : 500;
        res.status(statusCode).json({ ok: false, msg: error.message || 'Error interno del servidor.' });
    }
};

const assignPlayerController = async (req, res) => {
    try {
        const { id } = req.params;
        const { playerId } = req.body;
        const updatedCategory = await categoryService.assignPlayerToCategory(id, playerId, req.user);
        res.json({
            ok: true,
            msg: `Jugador asignado a la categoría '${updatedCategory.name}' exitosamente.`,
            category: updatedCategory,
        });
    } catch (error) {
        const statusCode = error instanceof AppError ? error.statusCode : 500;
        res.status(statusCode).json({ ok: false, msg: error.message || 'Error interno del servidor.' });
    }
};

const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.json({ ok: true, categories });
    } catch (error) {
        const statusCode = error instanceof AppError ? error.statusCode : 500;
        res.status(statusCode).json({ ok: false, msg: error.message || 'Error interno del servidor.' });
    }
};

const getCategoryByIdController = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.json({ ok: true, category });
    } catch (error) {
        const statusCode = error instanceof AppError ? error.statusCode : 500;
        res.status(statusCode).json({ ok: false, msg: error.message || 'Error interno del servidor.' });
    }
};

const updateCategoryController = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body);
        res.json({ ok: true, msg: 'Categoría actualizada exitosamente.', category });
    } catch (error) {
        const statusCode = error instanceof AppError ? error.statusCode : 500;
        res.status(statusCode).json({ ok: false, msg: error.message || 'Error interno del servidor.' });
    }
};

const deleteCategoryController = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.json({ ok: true, msg: 'Categoría eliminada exitosamente.' });
    } catch (error) {
        const statusCode = error instanceof AppError ? error.statusCode : 500;
        res.status(statusCode).json({ ok: false, msg: error.message || 'Error interno del servidor.' });
    }
};

const assignCoachController = async (req, res) => {
    try {
        const { id } = req.params;
        const requestingUser = req.user;
        const updatedCategory = await categoryService.assignCoachToCategory(id, requestingUser);
        res.json({
            ok: true,
            msg: `Coach asignado exitosamente a la categoría '${updatedCategory.name}'.`,
            category: updatedCategory,
        });
    } catch (error) {
        const statusCode = error instanceof AppError ? error.statusCode : 500;
        res.status(statusCode).json({ ok: false, msg: error.message || 'Error interno del servidor.' });
    }
};

module.exports = {
    createCategoryController,
    assignPlayerController,
    getAllCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
    deleteCategoryController,
    assignCoachController,
};