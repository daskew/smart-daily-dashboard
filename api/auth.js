// Vercel API route for authentication with Supabase
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkpbwkxkeacnqcuyof.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_f3hVIOeeeVUbSPiNO8NgLg_r487X-cF';

const supabase = createClient(supabaseUrl, supabaseKey);

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, salt, hash) {
  return hashPassword(password, salt) === hash;
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the path without /api/auth prefix
  const fullPath = req.url || '/';
  // Extract the action (e.g., /register -> register, /login -> login)
  const action = fullPath.split('/').filter(Boolean).pop() || '';
  
  // Base route
  if (action === 'auth' || action === '') {
    return res.status(200).json({ message: 'Auth API. Use /register, /login, /me, /logout' });
  }
  
  // Parse body for POST
  let body = {};
  if (req.method === 'POST') {
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  // Route: register
  if (req.method === 'POST' && action === 'register') {
    const { email, password, name } = body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const { data: existing } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        password_hash: salt + ':' + passwordHash
      })
      .select()
      .single();
    
    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(201).json({ 
      user: { id: user.id, email: user.email, name: user.name },
      token: user.id 
    });
  }

  // Route: login
  if (req.method === 'POST' && action === 'login') {
    const { email, password } = body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, password_hash')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const [salt, storedHash] = user.password_hash.split(':');
    const valid = verifyPassword(password, salt, storedHash);
    
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    return res.status(200).json({ 
      user: { id: user.id, email: user.email, name: user.name },
      token: user.id 
    });
  }

  // Route: me
  if (req.method === 'GET' && action === 'me') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', token)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(200).json({ user });
  }

  // Route: logout
  if (req.method === 'POST' && action === 'logout') {
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  return res.status(404).json({ error: 'Not found', action });
}
