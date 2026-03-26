const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    console.log('Authenticating as Farmer...');
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'nithish@gmail.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Token acquired:', token.substring(0, 20) + '...');

    console.log('Sending Add Product Payload...');
    const postRes = await axios.post('http://localhost:8080/api/products/add', {
      productName: 'Debug Crop',
      category: 'Vegetable',
      quantity: 50,
      price: 15.5,
      farmerId: loginRes.data.userId,
      imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB'
    }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Success! HTTP ' + postRes.status);
    
  } catch (err) {
    if (err.response) {
      console.log('Failed! HTTP ' + err.response.status);
      console.log('Body:', err.response.data);
    } else {
      console.log('Network Error:', err.message);
    }
  }
}
test();
