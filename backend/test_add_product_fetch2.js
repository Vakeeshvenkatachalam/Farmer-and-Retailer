async function test() {
  try {
    console.log('Registering Test Farmer...');
    await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testfarmer1@gmail.com', password: 'testpassword', name: 'Test Farmer', role: 'FARMER' })
    });
    
    console.log('Authenticating as Test Farmer...');
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testfarmer1@gmail.com', password: 'testpassword', role: 'FARMER' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Token acquired:', token.substring(0, 20) + '...');

    console.log('Sending Add Product Payload...');
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
    
    console.log('HTTP Status:', postRes.status);
    const postData = await postRes.text();
    console.log('Body:', postData);
  } catch (err) {
    console.log('Fetch Error:', err.message);
  }
}
test();
