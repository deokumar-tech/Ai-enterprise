const { query } = require('../config/db');

/**
 * Fetch all tickets belonging to the authenticated user
 * GET /api/tickets
 */
async function getTickets(req, res) {
  try {
    const userId = req.user.id;
    const { status, category } = req.query;

    let sql = 'SELECT * FROM tickets WHERE user_id = $1';
    const params = [userId];

    if (status) {
      params.push(status.toUpperCase());
      sql += ` AND status = $${params.length}`;
    }

    if (category) {
      params.push(category.toUpperCase());
      sql += ` AND category = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      tickets: result.rows,
    });
  } catch (err) {
    console.error('Error fetching tickets:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve tickets.',
    });
  }
}

/**
 * Create a ticket manually or via API
 * POST /api/tickets
 */
async function createTicket(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'title, description, and category are required',
      });
    }

    const validCategories = ['IT_SUPPORT', 'HR_REQUEST', 'FACILITIES', 'GENERAL'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Category must be one of: ${validCategories.join(', ')}`,
      });
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    const chosenPriority = validPriorities.includes(priority) ? priority : 'MEDIUM';

    const result = await query(
      `INSERT INTO tickets (user_id, title, description, category, status, priority)
       VALUES ($1, $2, $3, $4, 'OPEN', $5)
       RETURNING *`,
      [userId, title, description, category, chosenPriority]
    );

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating ticket:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create ticket.',
    });
  }
}

/**
 * Update ticket status (e.g. mark OPEN -> IN_PROGRESS -> RESOLVED)
 * PATCH /api/tickets/:id/status
 */
async function updateTicketStatus(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Row-level security: only update if user_id matches req.user.id
    const result = await query(
      `UPDATE tickets
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found or unauthorized to update this ticket.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Ticket status updated',
      ticket: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating ticket status:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update ticket status.',
    });
  }
}

/**
 * Get ticket statistics for dashboard
 * GET /api/tickets/stats
 */
async function getTicketStats(req, res) {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved,
        COUNT(CASE WHEN category = 'IT_SUPPORT' THEN 1 END) as it_support,
        COUNT(CASE WHEN category = 'HR_REQUEST' THEN 1 END) as hr_request,
        COUNT(CASE WHEN category = 'FACILITIES' THEN 1 END) as facilities,
        COUNT(CASE WHEN category = 'GENERAL' THEN 1 END) as general
       FROM tickets
       WHERE user_id = $1`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      stats: result.rows[0] || {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        it_support: 0,
        hr_request: 0,
        facilities: 0,
        general: 0,
      },
    });
  } catch (err) {
    console.error('Error getting stats:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket statistics.',
    });
  }
}

module.exports = {
  getTickets,
  createTicket,
  updateTicketStatus,
  getTicketStats,
};

