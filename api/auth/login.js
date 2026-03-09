// Vercel API route for login
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkpbwkxkeacnqcuyof.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_f3hVIOeeeVUbSPiNO8NgLg_r487X-cF';

const supabase = createClient(supabaseUrl, supabaseKey);

function verifyPassword(password, salt, hash) {
  const hashPassword = (pwd, slt) => 
    crypto.pbkdf2Sync(pwd, slt, 100000, 64, 'sha512').toString('hex');
  return hashPassword(password, salt) === hash;
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

  const { email, password } = req.body || {};
    
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
