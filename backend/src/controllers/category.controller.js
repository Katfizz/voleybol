const categoryService = require('../services/category.service');

const createCategoryController = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body, req.user);
        res.status(201).json({
            ok: true,
            msg: 'Categoría creada exitosamente.',
            category,
        });
    } catch (error) {
        next(error);
    }
};

const assignPlayerController = async (req, res, next) => {
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
        next(error);
    }
};

const getAllCategoriesController = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.json({ ok: true, categories });
    } catch (error) {
        next(error);
    }
};

const getCategoryByIdController = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.json({ ok: true, category });
    } catch (error) {
        next(error);
    }
};

const updateCategoryController = async (req, res, next) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body);
        res.json({ ok: true, msg: 'Categoría actualizada exitosamente.', category });
    } catch (error) {
        next(error);
    }
};

const deleteCategoryController = async (req, res, next) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.json({ ok: true, msg: 'Categoría eliminada exitosamente.' });
    } catch (error) {
        next(error);
    }
};

const assignCoachController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { coachId } = req.body; // El ID del coach viene del body
        const updatedCategory = await categoryService.assignCoachToCategory(id, coachId, req.user);
        res.json({
            ok: true,
            msg: `Coach con ID ${coachId} asignado exitosamente a la categoría '${updatedCategory.name}'.`,
            category: updatedCategory,
        });
    } catch (error) {
        next(error);
    }
};

const removePlayerFromCategoryController = async (req, res, next) => {
    try {
        const { id, playerId } = req.params;
        const updatedCategory = await categoryService.removePlayerFromCategory(id, playerId, req.user);
        res.json({
            ok: true,
            msg: `Jugador con ID ${playerId} desasignado de la categoría con ID ${id} exitosamente.`,
            category: updatedCategory,
        });
    } catch (error) {
        next(error);
    }
};

const removeCoachFromCategoryController = async (req, res, next) => {
    try {
        const { id, coachId } = req.params;
        const updatedCategory = await categoryService.removeCoachFromCategory(id, coachId, req.user);
        res.json({
            ok: true,
            msg: `Coach con ID ${coachId} desasignado de la categoría con ID ${id} exitosamente.`,
            category: updatedCategory,
        });
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
    assignCoachController,
    removePlayerFromCategoryController,
    removeCoachFromCategoryController,
};