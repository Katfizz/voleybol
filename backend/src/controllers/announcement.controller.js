const announcementService = require('../services/announcement.service');

const create = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const announcement = await announcementService.createAnnouncement(userId, req.body);
        res.status(201).json({ ok: true, msg: 'Anuncio creado exitosamente.', announcement });
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

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        await announcementService.deleteAnnouncement(id, userId, role);
        res.status(200).json({ ok: true, msg: 'Anuncio eliminado.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getActive,
    getAll,
    remove
};