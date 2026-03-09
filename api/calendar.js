// API route for calendar events
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkpbwkxkeacnqcuyof.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_f3hVIOeeeVUbSPiNO8NgLg_r487X-cF';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock calendar events (will be replaced with real Google/Outlook API)
function getMockEvents(date: string) {
  const baseDate = new Date(date);
  return [
    {
      id: '1',
      title: 'Team Standup',
      description: 'Daily standup meeting',
      start: new Date(baseDate.setHours(9, 0, 0, 0)).toISOString(),
      end: new Date(baseDate.setHours(9, 30, 0, 0)).toISOString(),
      provider: 'google',
      color: '#4285f4'
    },
    {
      id: '2',
      title: 'Lunch with Client',
      description: 'Meeting at restaurant',
      start: new Date(baseDate.setHours(12, 0, 0, 0)).toISOString(),
      end: new Date(baseDate.setHours(13, 30, 0, 0)).toISOString(),
      provider: 'outlook',
      color: '#0078d4'
    },
    {
      id: '3',
      title: 'Project Review',
      description: 'Review project progress',
      start: new Date(baseDate.setHours(15, 0, 0, 0)).toISOString(),
      end: new Date(baseDate.setHours(16, 0, 0, 0)).toISOString(),
      provider: 'google',
      color: '#4285f4'
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

  // GET /api/calendar
  if (req.method === 'GET') {
    // Get date from query param or use today
    const url = new URL(req.url || '', 'http://localhost');
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    // Check if user has connected accounts
    const { data: accounts } = await supabase
      .from('connected_accounts')
      .select('provider')
      .eq('user_id', userId);
    
    // If no accounts, return mock data for demo
    // In production, this would fetch from Google/Outlook APIs
    if (!accounts || accounts.length === 0) {
      return res.status(200).json(getMockEvents(date));
    }
    
    // For now, return mock data (real implementation would call Google/Outlook APIs)
    return res.status(200).json(getMockEvents(date));
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
