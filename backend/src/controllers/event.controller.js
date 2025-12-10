const eventService = require('../services/event.service');
const { handleHttpError } = require('../utils/errors');

const createEventController = async (req, res) => {
    try {
        const event = await eventService.createEvent(req.body);
        res.status(201).json({
            ok: true,
            msg: 'Evento creado exitosamente.',
            event,
        });
    } catch (error) {
        handleHttpError(res, error);
    }
};

const getAllEventsController = async (req, res) => {
    try {
        const events = await eventService.getAllEvents();
        res.json({ ok: true, events });
    } catch (error) {
        handleHttpError(res, error);
    }
};

const getEventByIdController = async (req, res) => {
    try {
        const event = await eventService.getEventById(req.params.id);
        res.json({ ok: true, event });
    } catch (error) {
        handleHttpError(res, error);
    }
};

const updateEventController = async (req, res) => {
    try {
        const event = await eventService.updateEvent(req.params.id, req.body);
        res.json({ ok: true, msg: 'Evento actualizado exitosamente.', event });
    } catch (error) {
        handleHttpError(res, error);
    }
};

const deleteEventController = async (req, res) => {
    try {
        await eventService.deleteEvent(req.params.id);
        res.json({ ok: true, msg: 'Evento eliminado exitosamente.' });
    } catch (error) {
        handleHttpError(res, error);
    }
};

const createMatchController = async (req, res) => {
    try {
        const { id } = req.params;
        const match = await eventService.createMatch(id, req.body);
        res.status(201).json({
            ok: true,
            msg: 'Partido creado y añadido al evento exitosamente.',
            match,
        });
    } catch (error) {
        handleHttpError(res, error);
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