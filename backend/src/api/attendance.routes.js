const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const { validateJWT, hasRole } = require('../middlewares');
const { validateEventId, validateRecordAttendance, validateGetAttendance, validateAttendanceId } = require('../middlewares/attendance.validators');
const { Role } = require('@prisma/client');

const router = express.Router();

router.use(validateJWT);

// GET /api/attendance/event/:eventId?date=YYYY-MM-DD
router.get(
    '/event/:eventId',
    validateEventId,
    validateGetAttendance,
    attendanceController.getAttendance
);

// POST /api/attendance/event/:eventId
router.post(
    '/event/:eventId',
    hasRole(Role.ADMIN, Role.COACH), // Solo Admin y Coach pueden tomar lista
    validateEventId,
    validateRecordAttendance,
    attendanceController.recordAttendance
);

// DELETE /api/attendance/:id
router.delete(
    '/:id',
    hasRole(Role.ADMIN, Role.COACH),
    validateAttendanceId,
    attendanceController.deleteAttendance
);

module.exports = router;