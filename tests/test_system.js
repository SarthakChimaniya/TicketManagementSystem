const http = require('http');
const { app } = require('../server');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026_dev';

async function runTests() {
  console.log('--- Starting iMovies Backend Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`PASS: ${message}`);
      passed++;
    } else {
      console.error(`FAIL: ${message}`);
      failed++;
    }
  }

  // Start test server on random free port
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, resolve));
  const port = testServer.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // Test 1: Health check endpoint
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'GET /api/health returns 200 & healthy status');

    // Test 2: Root route lists endpoints
    const rootRes = await fetch(`${baseUrl}/`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200 && rootData.endpoints.user === '/api/user' && rootData.endpoints.admin === '/api/admin', 'GET / returns 200 with user and admin endpoints');

    // Test 3: Unauthorized access to user profile without token
    const unauthProfileRes = await fetch(`${baseUrl}/api/user/profile`);
    const unauthProfileData = await unauthProfileRes.json();
    assert(unauthProfileRes.status === 401 && unauthProfileData.success === false, 'GET /api/user/profile without token returns 401');

    // Test 4: Unauthorized access to admin dashboard without token
    const unauthAdminRes = await fetch(`${baseUrl}/api/admin/dashboard`);
    const unauthAdminData = await unauthAdminRes.json();
    assert(unauthAdminRes.status === 401 && unauthAdminData.success === false, 'GET /api/admin/dashboard without token returns 401');

    // Test 5: Verify isAdmin blocks non-admin users
    const userReq = { user: { role: 'user' } };
    let forbiddenCode = 0;
    const resMock = {
      status: (c) => ({
        json: (d) => { forbiddenCode = c; }
      })
    };
    isAdmin(userReq, resMock, () => {});
    assert(forbiddenCode === 403, 'isAdmin middleware returns 403 Forbidden for role "user"');

    // Test 6: Verify isAdmin permits admin users
    let adminPassed = false;
    const adminReq = { user: { role: 'admin' } };
    isAdmin(adminReq, resMock, () => { adminPassed = true; });
    assert(adminPassed === true, 'isAdmin middleware calls next() for role "admin"');

    // Test 7: Auth Registration Validation (missing fields)
    const emptyRegRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const emptyRegData = await emptyRegRes.json();
    assert(emptyRegRes.status === 400 && emptyRegData.success === false, 'POST /api/auth/register with empty body returns 400');

    // Test 8: Auth Registration Validation (invalid email)
    const badEmailRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notanemail', username: 'validname', password: 'password123' })
    });
    const badEmailData = await badEmailRes.json();
    assert(badEmailRes.status === 400 && badEmailData.error.includes('valid email'), 'POST /api/auth/register with invalid email returns 400');

    // Test 9: Auth Registration Validation (short password)
    const shortPassRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', username: 'validname', password: '123' })
    });
    const shortPassData = await shortPassRes.json();
    assert(shortPassRes.status === 400 && shortPassData.error.includes('at least 6 characters'), 'POST /api/auth/register with short password returns 400');

    // Test 10: Auth Login Validation (missing password)
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    const badLoginData = await badLoginRes.json();
    assert(badLoginRes.status === 400 && badLoginData.success === false, 'POST /api/auth/login with missing password returns 400');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    testServer.close();
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
