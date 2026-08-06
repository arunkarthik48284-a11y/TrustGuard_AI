const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { query } = require('../config/db');

const registerSchema = z.object({
  organization_name: z.string().min(2, "Organization name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['admin', 'analyst', 'developer']).default('admin')
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

async function register(req, res) {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation error', details: parseResult.error.errors });
    }

    const { organization_name, email, password, role } = parseResult.data;

    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Create Organization
    const orgResult = await query('INSERT INTO organizations (name) VALUES ($1) RETURNING *', [organization_name]);
    const org = orgResult.rows[0];

    // Hash Password (salt rounds 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User
    const userResult = await query(
      'INSERT INTO users (organization_id, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role, organization_id, created_at',
      [org.id, email, passwordHash, role]
    );
    const user = userResult.rows[0];

    // Issue JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'trustguard_super_secret_jwt_key_2026_production_grade';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: org.name
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account and organization created successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: org.name
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation error', details: parseResult.error.errors });
    }

    const { email, password } = parseResult.data;

    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    // Validate Password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Issue JWT
    const jwtSecret = process.env.JWT_SECRET || 'trustguard_super_secret_jwt_key_2026_production_grade';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: 'CyberShield Enterprise Inc.'
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: 'CyberShield Enterprise Inc.'
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

async function getProfile(req, res) {
  try {
    return res.json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}

module.exports = {
  register,
  login,
  getProfile
};
