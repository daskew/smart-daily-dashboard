// API route for calendar events
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkpbwkxkeacnqcuyof.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_f3hVIOeeeVUbSPiNO8NgLg_r487X-cF';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock calendar events
function getMockEvents(dateStr) {
  const baseDate = new Date(dateStr);
  return [
    {
      id: '1',
      title: 'Team Standup',
      description: 'Daily standup meeting',
      start: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 9, 0).toISOString(),
      end: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 9, 30).toISOString(),
      provider: 'google',
      color: '#4285f4'
    },
    {
      id: '2',
      title: 'Lunch with Client',
      description: 'Meeting at restaurant',
      start: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 12, 0).toISOString(),
      end: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 13, 30).toISOString(),
      provider: 'outlook',
      color: '#0078d4'
    }
  ];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
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

  if (req.method === 'GET') {
    // Get date from query param
    const url = req.url || '';
    const dateMatch = url.match(/date=([^&]+)/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    
    // Return mock events for demo
    return res.status(200).json(getMockEvents(date));
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
