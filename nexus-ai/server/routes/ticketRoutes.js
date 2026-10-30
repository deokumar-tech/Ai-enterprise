const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All ticket routes require JWT authentication
router.use(authenticateToken);

router.get('/', ticketController.getTickets);
router.post('/', ticketController.createTicket);
router.get('/stats', ticketController.getTicketStats);
router.patch('/:id/status', ticketController.updateTicketStatus);

module.exports = router;

