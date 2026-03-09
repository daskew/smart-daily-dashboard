// API route for connected accounts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkpbwkxkeacnqcuyof.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_f3hVIOeeeVUbSPiNO8NgLg_r487X-cF';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get user from token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  
  const userId = authHeader.replace('Bearer ', '');
  
  // Verify user exists
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();
    
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // GET /api/accounts - list connected accounts
  if (req.method === 'GET') {
    const { data: accounts, error } = await supabase
      .from('connected_accounts')
      .select('id, provider, email, created_at')
      .eq('user_id', userId);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json(accounts || []);
  }

  // POST /api/accounts - add connected account
  if (req.method === 'POST') {
    const { provider, provider_user_id, access_token, refresh_token, email } = req.body || {};
    
    if (!provider || !access_token || !email) {
      return res.status(400).json({ error: 'Provider, access_token, and email are required' });
    }
    
    // Check if already connected
    const { data: existing } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('provider_user_id', provider_user_id)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: 'Account already connected' });
    }
    
    const { data: account, error } = await supabase
      .from('connected_accounts')
      .insert({
        user_id: userId,
        provider,
        provider_user_id,
        access_token,
        refresh_token,
        email
      })
      .select()
      .single();
    
    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(201).json({
      id: account.id,
      provider: account.provider,
      email: account.email,
      created_at: account.created_at
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
