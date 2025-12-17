const eventService = require('../services/event.service');

const createEventController = async (req, res, next) => {
    try {
        const event = await eventService.createEvent(req.body);
        res.status(201).json({
            ok: true,
            msg: 'Evento creado exitosamente.',
            event,
        });
    } catch (error) {
        next(error);
    }
};

const getAllEventsController = async (req, res, next) => {
    try {
        const events = await eventService.getAllEvents();
        res.json({ ok: true, events });
    } catch (error) {
        next(error);
    }
};

const getEventByIdController = async (req, res, next) => {
    try {
        const event = await eventService.getEventById(req.params.id);
        res.json({ ok: true, event });
    } catch (error) {
        next(error);
    }
};

const updateEventController = async (req, res, next) => {
    try {
        const event = await eventService.updateEvent(req.params.id, req.body);
        res.json({ ok: true, msg: 'Evento actualizado exitosamente.', event });
    } catch (error) {
        next(error);
    }
};

const deleteEventController = async (req, res, next) => {
    try {
        await eventService.deleteEvent(req.params.id);
        res.json({ ok: true, msg: 'Evento eliminado exitosamente.' });
    } catch (error) {
        next(error);
    }
};

const createMatchController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const match = await eventService.createMatch(id, req.body);
        res.status(201).json({
            ok: true,
            msg: 'Partido creado y añadido al evento exitosamente.',
            match,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEventController,
    getAllEventsController,
    getEventByIdController,
    updateEventController,
    deleteEventController,
    createMatchController,
};