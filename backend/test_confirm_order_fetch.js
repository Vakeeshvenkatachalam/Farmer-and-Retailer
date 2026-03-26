const fs = require('fs');
async function test() {
  try {
    let out = '';
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@platform.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    out += 'Sending Confirm Order Payload...\n';
    const putRes = await fetch('http://localhost:8080/api/orders/confirm/24', {
      method: 'PUT',
      headers: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });
    
    out += 'HTTP Status: ' + putRes.status + '\n';
    const putData = await putRes.text();
    out += 'Body: ' + putData + '\n';
    fs.writeFileSync('node_test_output_put.txt', out);
    console.log('Test completed.');
  } catch (err) {
    fs.writeFileSync('node_test_output_put.txt', 'Fetch Error: ' + err.message);
  }
}
test();
