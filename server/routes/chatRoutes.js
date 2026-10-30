const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { validate, chatSchema } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// All chat routes require JWT authentication
router.use(authenticateToken);

router.post('/', validate(chatSchema), chatController.handleChat);
router.get('/history', chatController.getChatHistory);

module.exports = router;

