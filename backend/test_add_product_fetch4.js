const fs = require('fs');
async function test() {
  try {
    let out = 'Authenticating as Admin...\n';
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@platform.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    out += 'Token acquired.\n';

    out += 'Sending Add Product Payload...\n';
    const postRes = await fetch('http://localhost:8080/api/products/add', {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productName: 'Debug Crop',
        category: 'Vegetable',
        quantity: 50,
        price: 15.5,
        farmerId: loginData.userId,
        imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB'
      })
    });
    
    out += 'HTTP Status: ' + postRes.status + '\n';
    const postData = await postRes.text();
    out += 'Body: ' + postData + '\n';
    fs.writeFileSync('node_test_output.txt', out);
    console.log('Test completed.');
  } catch (err) {
    fs.writeFileSync('node_test_output.txt', 'Fetch Error: ' + err.message);
  }
}
test();
