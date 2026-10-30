const { query } = require('../config/db');

const SYSTEM_INSTRUCTION = `You are NexusAI, an expert Enterprise Assistant. Your job is to answer employee questions regarding company policies. 
Additionally, you have the ability to automatically generate workflow tickets. 
If a user asks a question, answer it professionally. 
If a user explicitly requests an action (e.g., "fix my laptop", "request time off", "order a new monitor"), you MUST output your response as a valid JSON object. DO NOT wrap it in markdown blockquotes.
The JSON must have this exact structure:
{
  "message": "Your conversational response to the user here",
  "ticket_action": true,
  "ticket_payload": {
    "title": "Short summary of request",
    "description": "Detailed description extracted from user",
    "category": "IT_SUPPORT | HR_REQUEST | FACILITIES | GENERAL",
    "priority": "LOW | MEDIUM | HIGH"
  }
}
If NO ticket is needed, output JSON like this:
{
  "message": "Your conversational response",
  "ticket_action": false
}`;

/**
 * Heuristic fallback parser when API key is unconfigured or rate-limited
 */
function localAssistantFallback(userMessage) {
  const lower = userMessage.toLowerCase();
  
  const isQuestion = 
    lower.startsWith('how do i') || 
    lower.startsWith('how can i') || 
    lower.startsWith('how to') || 
    lower.startsWith('what is') || 
    lower.startsWith('what are') || 
    lower.startsWith('can you explain') ||
    lower.startsWith('tell me about') ||
    (lower.includes('?') && !lower.includes('please open') && !lower.includes('create a ticket') && !lower.includes('submit'));

  const isAction =
    lower.includes('please open') ||
    lower.includes('open a request') ||
    lower.includes('create a ticket') ||
    lower.includes('submit a ticket') ||
    lower.includes('submit a request') ||
    lower.includes('leave starting') ||
    lower.includes('request time off') ||
    lower.includes('fix my') ||
    lower.includes('broken') ||
    lower.includes('order a new') ||
    lower.includes('order a replacement') ||
    lower.includes('need it repaired') ||
    lower.includes('is leaking');

  const isTicketRequest = !isQuestion && isAction;

  if (isTicketRequest) {
    let category = 'GENERAL';
    let priority = 'MEDIUM';
    let title = 'Enterprise Request';

    if (/\bleave\b/i.test(userMessage) || /\bpto\b/i.test(userMessage) || /\bvacation\b/i.test(userMessage) || /\bbenefits\b/i.test(userMessage) || /\bpayroll\b/i.test(userMessage)) {
      category = 'HR_REQUEST';
      title = 'HR / Leave Request';
      if (lower.includes('urgent') || lower.includes('emergency')) priority = 'HIGH';
    } else if (lower.includes('laptop') || lower.includes('computer') || lower.includes('password') || lower.includes('wifi') || lower.includes('access') || lower.includes('monitor') || lower.includes('keyboard')) {
      category = 'IT_SUPPORT';
      title = 'IT Hardware / Access Support';
      if (lower.includes('broken') || lower.includes('blocked') || lower.includes('urgent') || lower.includes('cracked')) priority = 'HIGH';
    } else if (lower.includes('air conditioning') || lower.includes('ac') || lower.includes('chair') || lower.includes('desk') || lower.includes('light') || lower.includes('office') || lower.includes('coffee')) {
      category = 'FACILITIES';
      title = 'Facilities Maintenance Request';
    }

    return {
      message: `I have processed your request and automatically created a ${category.replace('_', ' ')} ticket for you. The relevant enterprise team has been notified, and you can track the status in your Tickets dashboard.`,
      ticket_action: true,
      ticket_payload: {
        title: title,
        description: userMessage,
        category: category,
        priority: priority
      }
    };
  }

  // Conversational knowledge answer
  if (lower.includes('parental leave') || lower.includes('maternity') || lower.includes('paternity')) {
    return {
      message: "Under our Enterprise Policy, full-time employees are eligible for up to 16 weeks of fully paid parental leave following the birth, adoption, or foster placement of a child. You can request this leave anytime within the child's first year. If you would like me to submit an official leave request on your behalf, simply let me know the starting date!",
      ticket_action: false
    };
  }

  if (lower.includes('pto') || lower.includes('vacation') || lower.includes('holiday')) {
    return {
      message: "Our standard enterprise benefits include 20 days of paid time off (PTO) annually, accrued monthly, plus 10 company holidays. Unused PTO up to 5 days rolls over to the next calendar year. To request time off, just specify your dates and I'll generate the HR ticket for manager approval.",
      ticket_action: false
    };
  }

  if (lower.includes('laptop') || lower.includes('hardware') || lower.includes('equipment')) {
    return {
      message: "All enterprise equipment (MacBooks, ThinkPads, monitors, and peripherals) is covered under standard enterprise warranty. If your hardware is damaged, lost, or needs an upgrade after 3 years of service, I can open an IT ticket for immediate hardware replacement or technician dispatch.",
      ticket_action: false
    };
  }

  return {
    message: `Hello! I am NexusAI, your Enterprise Assistant. You can ask me any questions about company policies, benefits, IT guidelines, or workplace facilities. If you need any action taken (such as requesting leave or reporting broken equipment), simply let me know and I will automatically generate the appropriate ticket for you.`,
    ticket_action: false
  };
}

/**
 * Handle incoming chat message
 * POST /api/chat
 */
async function handleChat(req, res) {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    // 1. Save user's message to chats table
    await query(
      `INSERT INTO chats (user_id, message, role) VALUES ($1, $2, 'user')`,
      [userId, message]
    );

    let parsedResponse = null;
    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidApiKey = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim().length > 10;

    if (hasValidApiKey) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        // Retrieve last 5 chat messages for context
        const historyResult = await query(
          `SELECT message, role FROM chats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 6`,
          [userId]
        );
        const history = historyResult.rows.reverse();

        const formattedContents = history.map(item => ({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.message }]
        }));

        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: formattedContents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
          }
        });

        const rawText = result.text || '';
        // Clean potential markdown blocks
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResponse = JSON.parse(cleanedText);
      } catch (geminiError) {
        console.warn('Gemini API call failed or rate limited, falling back to enterprise assistant engine:', geminiError.message);
        parsedResponse = localAssistantFallback(message);
      }
    } else {
      // Use intelligent enterprise fallback engine
      parsedResponse = localAssistantFallback(message);
    }

    if (!parsedResponse || typeof parsedResponse !== 'object') {
      parsedResponse = {
        message: "I processed your request, but could not format the output. How else may I assist you?",
        ticket_action: false
      };
    }

    let createdTicket = null;

    // 2. If ticket_action is true, execute INSERT into tickets table
    if (parsedResponse.ticket_action && parsedResponse.ticket_payload) {
      const payload = parsedResponse.ticket_payload;
      const validCategories = ['IT_SUPPORT', 'HR_REQUEST', 'FACILITIES', 'GENERAL'];
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

      const category = validCategories.includes(payload.category) ? payload.category : 'GENERAL';
      const priority = validPriorities.includes(payload.priority) ? payload.priority : 'MEDIUM';
      const title = (payload.title || 'Support Request').substring(0, 200);
      const description = payload.description || message;

      const ticketInsert = await query(
        `INSERT INTO tickets (user_id, title, description, category, status, priority)
         VALUES ($1, $2, $3, $4, 'OPEN', $5)
         RETURNING *`,
        [userId, title, description, category, priority]
      );

      createdTicket = ticketInsert.rows[0];
    }

    // 3. Save assistant model message to chats table
    await query(
      `INSERT INTO chats (user_id, message, role) VALUES ($1, $2, 'model')`,
      [userId, parsedResponse.message]
    );

    return res.status(200).json({
      success: true,
      message: parsedResponse.message,
      ticket_action: Boolean(parsedResponse.ticket_action),
      ticket: createdTicket,
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your message.',
    });
  }
}

/**
 * Fetch chat history for the authenticated user
 * GET /api/chat/history
 */
async function getChatHistory(req, res) {
  try {
    const userId = req.user.id;

    // Row-level security: only retrieve chats for req.user.id
    const result = await query(
      `SELECT id, role, message, created_at
       FROM chats
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      history: result.rows,
    });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat history.',
    });
  }
}

module.exports = {
  handleChat,
  getChatHistory,
};
