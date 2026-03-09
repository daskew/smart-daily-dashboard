// TDD Tests - Phase 2: Authentication
const API_BASE = process.env.API_BASE || 'https://smart-daily-dashboard.vercel.app/api/auth';

let testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'testpassword123',
  name: 'Test User'
};
let testUser2 = {
  email: `test2${Date.now()}@example.com`,
  password: 'testpassword123',
  name: 'Test User 2'
};
let authToken = null;

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

async function runTests() {
  let passed = 0;
  let failed = 0;
  
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

  console.log('\n🧪 Smart Daily Dashboard - Auth Tests (TDD)\n');
  console.log('='.repeat(50));

  // Test registration
  await test('POST /register creates new user', async () => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await res.json();
    expect(await res.status).toBe(201);
    expect(data.user).toBeTruthy();
    expect(data.token).toBeTruthy();
    authToken = data.token;
  });

  // Test login with same user
  await test('POST /login works with valid credentials', async () => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const data = await res.json();
    expect(await res.status).toBe(200);
    expect(data.user).toBeTruthy();
    authToken = data.token;
  });

  // Test /me without token
  await test('GET /me fails without token', async () => {
    const res = await fetch(`${API_BASE}/me`);
    expect(await res.status).toBe(401);
  });

  // Test /me with token
  await test('GET /me works with valid token', async () => {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    expect(await res.status).toBe(200);
    expect(data.user).toBeTruthy();
  });

  console.log('\n📊 Results:', passed, 'passed,', failed, 'failed\n');
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
