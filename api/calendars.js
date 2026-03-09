// API route for calendar list
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkpbwkxkeacnqcuyof.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_f3hVIOeeeVUbSPiNO8NgLg_r487X-cF';

const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch calendars from Google
async function getGoogleCalendars(accessToken) {
  const url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    console.error('Google CalendarList API error:', await response.text());
    return [];
  }

  const data = await response.json();
  
  return (data.items || []).map(cal => ({
    id: cal.id,
    summary: cal.summary,
    description: cal.description || '',
    backgroundColor: cal.backgroundColor || '#4285f4',
    primary: cal.primary || false
  }));
}

// Fetch calendars from Outlook
async function getOutlookCalendars(accessToken) {
  const url = 'https://graph.microsoft.com/v1.0/me/calendars';

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    console.error('Outlook Calendars API error:', await response.text());
    return [];
  }

  const data = await response.json();
  
  return (data.value || []).map(cal => ({
    id: cal.id,
    summary: cal.name,
    description: cal.name,
    backgroundColor: '#0078d4',
    primary: cal.isDefaultCalendar || false
  }));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  
  const userId = authHeader.replace('Bearer ', '');

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();
    
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // GET - fetch calendars
  if (req.method === 'GET') {
    const { data: accounts } = await supabase
      .from('connected_accounts')
      .select('provider, access_token')
      .eq('user_id', userId);
    
    if (!accounts || accounts.length === 0) {
      return res.status(200).json([]);
    }

    const allCalendars = [];
    
    for (const account of accounts) {
      if (account.provider === 'google' && account.access_token) {
        const calendars = await getGoogleCalendars(account.access_token);
        allCalendars.push(...calendars.map(c => ({ ...c, provider: 'google' })));
      } else if (account.provider === 'microsoft' && account.access_token) {
        const calendars = await getOutlookCalendars(account.access_token);
        allCalendars.push(...calendars.map(c => ({ ...c, provider: 'microsoft' })));
      }
    }
    
    return res.status(200).json(allCalendars);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
