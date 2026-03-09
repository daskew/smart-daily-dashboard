// Vercel API route for registration
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkpbwkxkeacnqcuyof.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_f3hVIOeeeVUbSPiNO8NgLg_r487X-cF';

const supabase = createClient(supabaseUrl, supabaseKey);

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name } = req.body || {};
    
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
