import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Create session
export const createEventSession = async (req: Request, res: Response) => {
  try {
    const { eventId, name, startsAt, endsAt, capacity } = req.body;
    if (!eventId || !startsAt || !endsAt) {
      return res.status(400).json({ success: false, message: 'eventId, startsAt, endsAt required' });
    }
    const session = await prisma.eventSession.create({
      data: { eventId, name: name || null, startsAt: new Date(startsAt), endsAt: new Date(endsAt), capacity: capacity ?? null },
    });
    return res.json({ success: true, data: { session } });
  } catch (error) {
    console.error('createEventSession error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create session' });
  }
};

// List sessions for event
export const listEventSessions = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const sessions = await prisma.eventSession.findMany({
      where: { eventId },
      orderBy: { startsAt: 'asc' },
    });
    return res.json({ success: true, data: { sessions } });
  } catch (error) {
    console.error('listEventSessions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
};

// Create ticket type
export const createTicketType = async (req: Request, res: Response) => {
  try {
    const { eventId, sessionId, name, ticketKind, price, capacity, salesStart, salesEnd, perUserLimit } = req.body;
    if (!eventId || !name || !ticketKind || typeof price !== 'number') {
      return res.status(400).json({ success: false, message: 'eventId, name, ticketKind, price required' });
    }
    const ticket = await prisma.ticketType.create({
      data: {
        eventId,
        sessionId: sessionId || null,
        name,
        ticketKind,
        price,
        capacity: capacity ?? null,
        salesStart: salesStart ? new Date(salesStart) : null,
        salesEnd: salesEnd ? new Date(salesEnd) : null,
        perUserLimit: perUserLimit ?? null,
      },
    });
    return res.json({ success: true, data: { ticket } });
  } catch (error) {
    console.error('createTicketType error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create ticket type' });
  }
};

// List ticket types for event (optionally by session)
export const listTicketTypes = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { sessionId } = req.query;
    const tickets = await prisma.ticketType.findMany({
      where: { eventId, sessionId: sessionId ? String(sessionId) : undefined, isActive: true },
      orderBy: { price: 'asc' },
    });
    return res.json({ success: true, data: { tickets } });
  } catch (error) {
    console.error('listTicketTypes error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch ticket types' });
  }
};

// GA hold (decrement available capacity temporarily)
export const holdGaTickets = async (req: Request, res: Response) => {
  try {
    const { ticketTypeId, quantity } = req.body as { ticketTypeId: string; quantity: number };
    if (!ticketTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'ticketTypeId and positive quantity required' });
    }

    const ticket = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket type not found' });

    if (ticket.capacity == null) {
      // Unlimited capacity (treat as no cap) -> allow hold
      return res.json({ success: true, data: { holdId: `GAH-${Date.now()}`, expiresAt: new Date(Date.now() + 5 * 60 * 1000) } });
    }

    if (ticket.sold + quantity > ticket.capacity) {
      return res.status(409).json({ success: false, message: 'Insufficient GA capacity' });
    }

    // Create a lightweight hold record via booking with PENDING? Simpler: respond with hold token (stateless mock)
    return res.json({ success: true, data: { holdId: `GAH-${Date.now()}`, expiresAt: new Date(Date.now() + 5 * 60 * 1000) } });
  } catch (error) {
    console.error('holdGaTickets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to hold tickets' });
  }
};

// GA confirm (increments sold)
export const confirmGaTickets = async (req: Request, res: Response) => {
  try {
    const { ticketTypeId, quantity } = req.body as { ticketTypeId: string; quantity: number };
    const ticket = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket type not found' });

    if (ticket.capacity != null && ticket.sold + quantity > ticket.capacity) {
      return res.status(409).json({ success: false, message: 'Insufficient GA capacity' });
    }

    const updated = await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: { sold: { increment: quantity } },
    });

    return res.json({ success: true, data: { ticket: updated } });
  } catch (error) {
    console.error('confirmGaTickets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to confirm tickets' });
  }
};
