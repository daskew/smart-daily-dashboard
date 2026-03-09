// API route for calendar events
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkpbwkxkeacnqcuyof.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_f3hVIOeeeVUbSPiNO8NgLg_r487X-cF';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock events (fallback)
function getMockEvents(dateStr) {
  const baseDate = new Date(dateStr);
  return [
    {
      id: 'mock-1',
      title: 'Team Standup',
      description: 'Sample meeting',
      start: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 9, 0).toISOString(),
      end: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 9, 30).toISOString(),
      provider: 'google',
      color: '#4285f4'
    }
  ];
}

// Fetch from Google Calendar
async function getGoogleCalendarEvents(accessToken, dateStr) {
  const startDate = new Date(dateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(dateStr);
  endDate.setHours(23, 59, 59, 999);

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    console.error('Google Calendar API error:', await response.text());
    return null;
  }

  const data = await response.json();
  
  return (data.items || []).map(event => ({
    id: event.id,
    title: event.summary || 'Untitled',
    description: event.description || '',
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    provider: 'google',
    color: '#4285f4'
  }));
}

// Fetch from Outlook Calendar
async function getOutlookCalendarEvents(accessToken, dateStr) {
  const startDate = new Date(dateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(dateStr);
  endDate.setHours(23, 59, 59, 999);

  const url = `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startDate.toISOString()}&endDateTime=${endDate.toISOString()}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    console.error('Outlook Calendar API error:', await response.text());
    return null;
  }

  const data = await response.json();
  
  return (data.value || []).map(event => ({
    id: event.id,
    title: event.subject || 'Untitled',
    description: event.bodyPreview || '',
    start: event.start.dateTime,
    end: event.end.dateTime,
    provider: 'outlook',
    color: '#0078d4'
  }));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

  if (req.method === 'GET') {
    const url = req.url || '';
    const dateMatch = url.match(/date=([^&]+)/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    
    // Get connected accounts
    const { data: accounts } = await supabase
      .from('connected_accounts')
      .select('provider, access_token, refresh_token')
      .eq('user_id', userId);
    
    if (!accounts || accounts.length === 0) {
      return res.status(200).json(getMockEvents(date));
    }

    // Fetch from each provider
    const allEvents = [];
    
    for (const account of accounts) {
      if (account.provider === 'google' && account.access_token) {
        const events = await getGoogleCalendarEvents(account.access_token, date);
        if (events) allEvents.push(...events);
      } else if (account.provider === 'microsoft' && account.access_token) {
        const events = await getOutlookCalendarEvents(account.access_token, date);
        if (events) allEvents.push(...events);
      }
    }

    // If no real events, fall back to mock
    if (allEvents.length === 0) {
      return res.status(200).json(getMockEvents(date));
    }

    // Sort by start time
    allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    return res.status(200).json(allEvents);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
