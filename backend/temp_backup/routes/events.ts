import express from 'express';
import { body } from 'express-validator';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Validation rules
const eventValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('title_ne')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nepali title must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('description_ne')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Nepali description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['concert', 'festival', 'sports', 'theater', 'other'])
    .withMessage('Invalid category'),
  body('image_url')
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('venue')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Venue must be between 2 and 100 characters'),
  body('venue_ne')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nepali venue must be between 2 and 100 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('location_ne')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Nepali location must be between 2 and 200 characters'),
  body('event_date')
    .isISO8601()
    .withMessage('Please provide a valid event start date'),
  body('end_date')
    .isISO8601()
    .withMessage('Please provide a valid event end date')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.event_date)) {
        throw new Error('End date must be after or equal to start date');
      }
      return true;
    }),
  body('price_min')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  body('price_max')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  body('total_seats')
    .isInt({ min: 1 })
    .withMessage('Total seats must be a positive integer'),
  body('available_seats')
    .isInt({ min: 0 })
    .withMessage('Available seats must be a non-negative integer'),
];

// Routes
router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', authenticate, authorize('admin'), eventValidation, createEvent);
router.put('/:id', authenticate, authorize('admin'), eventValidation, updateEvent);
router.delete('/:id', authenticate, authorize('admin'), deleteEvent);

export default router;
