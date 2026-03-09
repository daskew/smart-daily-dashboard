// API route for Google OAuth callback
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkpbwkxkeacnqcuyof.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_f3hVIOeeeVUbSPiNO8NgLg_r487X-cF';

const supabase = createClient(supabaseUrl, supabaseKey);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://smart-daily-dashboard.vercel.app/api/auth/callback/google';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect('/?error=oauth_not_configured');
  }

  const url = req.url || '';
  const params = new URL(url, 'http://localhost').searchParams;
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    return res.redirect('/?error=' + encodeURIComponent(error));
  }

  if (!code || !state) {
    return res.redirect('/?error=missing_params');
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      return res.redirect('/?error=' + encodeURIComponent(tokens.error));
    }

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const userInfo = await userInfoRes.json();

    const { data: existing } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', state)
      .eq('provider', 'google')
      .single();

    if (existing) {
      await supabase
        .from('connected_accounts')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          email: userInfo.email,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        })
        .eq('user_id', state)
        .eq('provider', 'google');
    } else {
      await supabase
        .from('connected_accounts')
        .insert({
          user_id: state,
          provider: 'google',
          provider_user_id: userInfo.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          email: userInfo.email,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        });
    }

    return res.redirect('/?connected=google');

  } catch (err) {
    console.error('OAuth callback error:', err);
    return res.redirect('/?error=callback_error');
  }
}
