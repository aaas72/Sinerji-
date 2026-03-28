
async function testAuth() {
  const API_URL = 'http://localhost:5000/api/auth';

  try {
    console.log('Testing Health...');
    const healthRes = await fetch('http://localhost:5000/health');
    const healthData = await healthRes.json();
    console.log('Health:', healthData);

    const email = `test${Date.now()}@example.com`;
    const password = 'password123';

    console.log('Testing Register...');
    const registerRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        role: 'student',
        full_name: 'Test User'
      })
    });

    if (!registerRes.ok) {
      const err = await registerRes.json();
      throw new Error(`Register Failed: ${registerRes.status} ${JSON.stringify(err)}`);
    }
    console.log('Register Success:', registerRes.status);

    console.log('Testing Login...');
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password
      })
    });

    if (!loginRes.ok) {
      const err = await loginRes.json();
      throw new Error(`Login Failed: ${loginRes.status} ${JSON.stringify(err)}`);
    }

    const loginData = await loginRes.json();
    console.log('Login Success:', loginRes.status);
    console.log('Token:', !!loginData.token);

  } catch (error: any) {
    console.error('Test Failed:', error.message);
  }
}

testAuth();
