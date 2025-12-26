const announcementService = require('../services/announcement.service');

const create = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const announcement = await announcementService.createAnnouncement(userId, req.body);
        res.status(201).json({ ok: true, announcement });
    } catch (error) {
        next(error);
    }
};

const getActive = async (req, res, next) => {
    try {
        const announcements = await announcementService.getActiveAnnouncements();
        res.status(200).json({ ok: true, announcements });
    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const announcements = await announcementService.getAllAnnouncements();
        res.status(200).json({ ok: true, announcements });
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const announcement = await announcementService.getAnnouncementById(id);
        res.status(200).json({ ok: true, announcement });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: userId, role: userRole } = req.user;
        // El servicio se encarga de verificar si existe y si el usuario tiene permisos
        const announcement = await announcementService.updateAnnouncement(id, userId, userRole, req.body);
        res.status(200).json({ ok: true, announcement });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: userId, role: userRole } = req.user;
        await announcementService.deleteAnnouncement(id, userId, userRole);
        res.status(200).json({ ok: true, msg: 'Anuncio eliminado' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getActive,
    getAll,
    getById,
    update,
    remove
};