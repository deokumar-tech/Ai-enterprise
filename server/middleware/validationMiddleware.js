const { z } = require('zod');

// Schema for user registration
const registerSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  full_name: z.string().trim().min(2, { message: 'Full name must be at least 2 characters' }),
});

// Schema for user login
const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Schema for chat messages
const chatSchema = z.object({
  message: z.string().trim().min(1, { message: 'Message cannot be empty' }).max(1000, { message: 'Message exceeds 1000 characters limit' }),
});

// Generic validation middleware generator
const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    return res.status(500).json({ success: false, error: 'Internal validation error' });
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  chatSchema,
  validate,
};

