import express from 'express';
import {
  createEventSession,
  listEventSessions,
  createTicketType,
  listTicketTypes,
  holdGaTickets,
  confirmGaTickets,
} from '../controllers/eventTicketController';

const router = express.Router();

// Sessions
router.post('/:eventId/sessions', createEventSession);
router.get('/:eventId/sessions', listEventSessions);

// Ticket types
router.post('/:eventId/tickets', createTicketType);
router.get('/:eventId/tickets', listTicketTypes);

// GA endpoints
router.post('/ga/hold', holdGaTickets);
router.post('/ga/confirm', confirmGaTickets);

export default router;
