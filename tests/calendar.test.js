// TDD Tests - Calendar API
const AUTH_API = 'https://smart-daily-dashboard.vercel.app/api/auth';
const CALENDAR_API = 'https://smart-daily-dashboard.vercel.app/api/calendar';

let userToken = null;

async function runTests() {
  let passed = 0;
  let failed = 0;
  
  // First login
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
        if (!actual) throw new Error(`Expected truthy value`);
      },
      toHaveLength: (len) => {
        if (!Array.isArray(actual) || actual.length !== len) 
          throw new Error(`Expected array of length ${len}`);
      }
    };
  }

  console.log('\n🧪 Calendar API Tests\n');
  console.log('='.repeat(50));

  // Test: GET /calendar returns events for date
  await test('GET /calendar?date returns events', async () => {
    const res = await fetch(`${CALENDAR_API}?date=2026-03-09`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    expect(await res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  // Test: GET /calendar works without date (defaults to today)
  await test('GET /calendar works without date parameter', async () => {
    const res = await fetch(`${CALENDAR_API}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    expect(await res.status).toBe(200);
  });

  // Test: GET /calendar requires auth
  await test('GET /calendar requires authentication', async () => {
    const res = await fetch(`${CALENDAR_API}`);
    expect(await res.status).toBe(401);
  });

  console.log('\n📊 Results:', passed, 'passed,', failed, 'failed\n');
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
