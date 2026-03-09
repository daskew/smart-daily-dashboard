// TDD Tests - Connected Accounts
const AUTH_API = 'https://smart-daily-dashboard.vercel.app/api/auth';
const ACCOUNTS_API = 'https://smart-daily-dashboard.vercel.app/api/accounts';

let userToken = null;
let accountId = null;

async function runTests() {
  let passed = 0;
  let failed = 0;
  
  // First login to get token
  const loginRes = await fetch(`${AUTH_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'success@test.com', password: 'test123456' })
  });
  const loginData = await loginRes.json();
  userToken = loginData.token;
  
  async function test(name, fn) {
    try {
      await fn();
      passed++;
      console.log(`✅ ${name}`);
    } catch (err) {
      failed++;
      console.log(`❌ ${name}: ${err.message}`);
    }
  }

  function expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
      },
      toBeTruthy: () => {
        if (!actual) throw new Error(`Expected truthy value, got ${actual}`);
      }
    };
  }

  console.log('\n🧪 Connected Accounts Tests\n');
  console.log('='.repeat(50));

  // Test: GET /accounts returns empty array for new user
  await test('GET /accounts returns empty array', async () => {
    const res = await fetch(`${ACCOUNTS_API}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const data = await res.json();
    expect(await res.status).toBe(200);
    expect(Array.isArray(data)).toBeTruthy();
  });

  // Test: POST /accounts creates connected account
  await test('POST /accounts creates account entry', async () => {
    const res = await fetch(`${ACCOUNTS_API}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}` 
      },
      body: JSON.stringify({
        provider: 'google',
        provider_user_id: 'google123',
        access_token: 'ya29.test',
        refresh_token: 'refresh_test',
        email: 'test@gmail.com'
      })
    });
    const data = await res.json();
    expect(await res.status).toBe(201);
    expect(data.provider).toBe('google');
    accountId = data.id;
  });

  console.log('\n📊 Results:', passed, 'passed,', failed, 'failed\n');
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
