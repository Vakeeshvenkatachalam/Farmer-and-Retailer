const axios = require('axios');

async function testFlow() {
  try {
    // 1. Login as Retailer
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'retailer10@test.com',
      password: 'password'
    });
    const token = loginRes.data.token;
    console.log("Logged in successfully. Token: " + token.substring(0, 10) + "...");

    // 2. Fetch User Orders
    const ordersRes = await axios.get(`http://localhost:8080/api/orders/retailer/${loginRes.data.userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (ordersRes.data.length === 0) {
      console.log("No orders found to pay for! Exiting.");
      return;
    }
    
    const orderToPay = ordersRes.data[0];
    console.log(`Attempting to pay for Order ID: ${orderToPay.id}`);

    // 3. Create Razorpay Payment Order
    const paymentRes = await axios.post(`http://localhost:8080/api/payments/create-order/${orderToPay.id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Razorpay Order Created!", paymentRes.data);

    // 4. Verify Payment (Mocking Razorpay Success)
    const verifyRes = await axios.post('http://localhost:8080/api/payments/verify', {
      razorpayOrderId: paymentRes.data.razorpayOrderId,
      razorpayPaymentId: "pay_mock_12345",
      razorpaySignature: "mock_signature_12345"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Payment Verified Successfully!", verifyRes.data);

  } catch (err) {
    console.error("TEST FAILED:");
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testFlow();
