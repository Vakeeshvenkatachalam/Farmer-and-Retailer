import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { FiCheck, FiClock, FiXCircle, FiCreditCard, FiLock, FiAward } from 'react-icons/fi';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [step, setStep] = useState('idle'); // idle | processing | verifying | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // Card form local fields
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• ••••');
  const [cardHolder, setCardHolder] = useState('YOUR NAME');
  const [expiry, setExpiry] = useState('MM/YY');
  const [cvv, setCvv] = useState('•••');
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        setOrder(null);
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const simulatePayment = async () => {
    setStep('processing');
    setErrorMsg('');

    try {
      // Step 1: Create Razorpay Order in backend
      const orderResponse = await fetch(
        `http://localhost:8080/api/payments/create-order/${orderId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to initialize payment');
      }

      const fakeMockHandler = async () => {
        setStep('verifying');
        await new Promise((r) => setTimeout(r, 2000));

        // Verify (simulate)
        await fetch('http://localhost:8080/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            razorpayOrderId: orderData.razorpayOrderId || 'mock_order',
            razorpayPaymentId: 'pay_mock_' + Math.floor(Math.random() * 10000000),
            razorpaySignature: 'mock_signature_valid',
          }),
        });

        setStep('success');
        setTimeout(() => navigate('/retailer/orders'), 3500);
      };

      // Use mock if no real keys
      if (!orderData.keyId || orderData.keyId === 'YOUR_RAZORPAY_KEY_ID') {
        await new Promise((r) => setTimeout(r, 1500));
        await fakeMockHandler();
        return;
      }

      // Real Razorpay flow
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load.');

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'FarmConnect',
        description: `Order #${orderId}`,
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          setStep('verifying');
          const verifyRes = await fetch('http://localhost:8080/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.verified) {
            setStep('success');
            setTimeout(() => navigate('/retailer/orders'), 3500);
          } else {
            setStep('error');
            setErrorMsg('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: 'Retailer', email: 'retailer@example.com', contact: '9999999999' },
        theme: { color: '#22C55E' },
        modal: { ondismiss: () => setStep('idle') },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setStep('error');
      setErrorMsg(err.message);
    }
  };

  const orderInfo = order?.order;
  const product = order?.product;

  const handleCardNumberChange = (val) => {
    let cleaned = val.replace(/\D/g, '').substring(0, 16);
    let formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted || '•••• •••• •••• ••••');
  };

  return (
    <div className="min-h-screen bg-base-cream/50 flex items-center justify-center font-sans p-6 relative overflow-hidden text-text-dark">
      {/* Background styling elements */}
      <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -bottom-20 -right-20"></div>

      <div className="bg-white rounded-3xl w-full max-w-xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative z-10 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="font-extrabold text-lg text-primary">FarmConnect Pay</span>
          </div>
          <button 
            className="text-text-medium hover:text-text-dark font-bold text-sm bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            onClick={() => navigate('/retailer/orders')}
          >
            ✕ Cancel
          </button>
        </div>

        {/* Success Confetti overlay */}
        {step === 'success' && (
          <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 rounded-3xl">
            <div className="confetti-container">
              {[...Array(24)].map((_, i) => (
                <div key={i} className={`confetti-piece p-${i % 6}`}></div>
              ))}
            </div>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-lg shadow-green-150 animate-bounce">
              ✓
            </div>
            <h3 className="text-2xl font-black text-green-600 mb-2">Payment Successful!</h3>
            <p className="text-text-medium text-sm max-w-xs mb-4">Your order is now confirmed. The farmer will be notified to ship your crop.</p>
            <div className="bg-gray-50 border border-gray-150 px-6 py-3 rounded-2xl w-full max-w-xs font-semibold text-xs text-text-medium space-y-1">
              <div className="flex justify-between">
                <span>Receipt Ref</span>
                <span className="text-text-dark font-bold">#FCP-{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount Paid</span>
                <span className="text-green-600 font-bold">₹{orderInfo?.totalPrice}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-6">Redirecting you to your orders panel...</p>
          </div>
        )}

        {/* Order Info Summary */}
        {loadingOrder ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-medium text-sm">Fetching secure transaction bill...</p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex gap-4 items-center">
            {product?.imageUrl ? (
              <img src={product.imageUrl} alt={product.productName} className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
            ) : (
              <div className="w-14 h-14 bg-gray-200 text-gray-400 flex items-center justify-center rounded-xl text-lg">🌾</div>
            )}
            <div className="flex-1">
              <span className="text-[10px] font-bold text-primary uppercase">Order ID #{orderId}</span>
              <h4 className="font-bold text-text-dark text-sm leading-snug">{product?.productName || "Unknown Crop"}</h4>
              <p className="text-xs text-text-medium">{orderInfo?.quantity} kg purchased</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-text-medium block font-semibold uppercase">Total Bill</span>
              <span className="text-lg font-black text-green-600">₹{orderInfo?.totalPrice}</span>
            </div>
          </div>
        )}

        {/* Step Stepper */}
        {step !== 'idle' && step !== 'success' && (
          <div className="flex items-center justify-between px-10">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                ['processing', 'verifying', 'success'].includes(step) ? "bg-primary text-white" : "bg-gray-100 text-text-medium"
              }`}>
                1
              </div>
              <span className="text-[10px] font-bold text-text-medium">Checkout</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                ['verifying', 'success'].includes(step) ? "bg-primary text-white" : "bg-gray-100 text-text-medium"
              }`}>
                2
              </div>
              <span className="text-[10px] font-bold text-text-medium">Verify Gateway</span>
            </div>
          </div>
        )}

        {/* Interactive Payment Visualizer Card */}
        {step === 'idle' || step === 'error' ? (
          <div className="space-y-6">
            
            {/* 3D Simulated Credit Card */}
            <div className={`credit-card ${isFlipped ? 'flipped' : ''}`}>
              <div className="card-inner">
                {/* Front Side */}
                <div className="card-front bg-gradient-to-tr from-emerald-500 to-primary text-white p-6 flex flex-col justify-between shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold opacity-85">FarmConnect Card</p>
                      <div className="w-10 h-8 bg-amber-300/80 rounded-md mt-1.5 flex items-center justify-center font-mono text-[8px] text-gray-700 shadow-sm border border-amber-400">CHIP</div>
                    </div>
                    <span className="text-xl">🌾</span>
                  </div>
                  <div className="font-mono text-lg tracking-widest text-center py-2 select-all">
                    {cardNumber}
                  </div>
                  <div className="flex justify-between font-mono text-[10px]">
                    <div>
                      <p className="text-[8px] opacity-75">CARDHOLDER</p>
                      <p className="font-bold tracking-wide uppercase truncate max-w-[150px]">{cardHolder}</p>
                    </div>
                    <div>
                      <p className="text-[8px] opacity-75">EXPIRES</p>
                      <p className="font-bold">{expiry}</p>
                    </div>
                  </div>
                </div>
                {/* Back Side */}
                <div className="card-back bg-gradient-to-tr from-primary to-emerald-600 text-white p-6 flex flex-col justify-between shadow-lg">
                  <div className="w-full h-8 bg-gray-800 absolute left-0 top-6"></div>
                  <div className="w-full flex justify-between items-center mt-12">
                    <div className="flex-1 bg-white/35 h-7 rounded px-2 flex items-center text-text-dark font-mono text-right justify-end pr-3">
                      •••• •••• ••••
                    </div>
                    <div className="bg-amber-300 text-gray-800 font-mono font-bold text-xs px-3 py-1.5 rounded ml-2">
                      {cvv}
                    </div>
                  </div>
                  <p className="text-[7px] text-center opacity-65">Unauthorized replication prohibited. FarmConnect Secured Systems.</p>
                </div>
              </div>
            </div>

            {/* Simulated credit card form inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-medium uppercase mb-1">Cardholder Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ramesh Kumar"
                  maxLength="26"
                  onChange={(e) => setCardHolder(e.target.value || 'YOUR NAME')}
                  onFocus={() => setIsFlipped(false)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-semibold text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-medium uppercase mb-1">Card Number</label>
                <input 
                  type="text" 
                  placeholder="xxxx xxxx xxxx xxxx"
                  maxLength="19"
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  onFocus={() => setIsFlipped(false)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-medium uppercase mb-1">Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY"
                  maxLength="5"
                  onChange={(e) => setExpiry(e.target.value || 'MM/YY')}
                  onFocus={() => setIsFlipped(false)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-bold text-sm text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-medium uppercase mb-1">CVV Code</label>
                <input 
                  type="password" 
                  placeholder="•••"
                  maxLength="3"
                  onChange={(e) => setCvv(e.target.value || '•••')}
                  onFocus={() => setIsFlipped(true)}
                  onBlur={() => setIsFlipped(false)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-dark font-bold text-sm text-center"
                />
              </div>
            </div>

            {/* Error messaging */}
            {step === 'error' && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-650 flex items-center gap-1.5">
                <FiXCircle className="text-sm shrink-0" /> {errorMsg || "Transaction cancelled by client."}
              </div>
            )}

            {/* Pay buttons */}
            <button 
              onClick={simulatePayment}
              className="w-full py-4 bg-primary hover:bg-green-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 border-none cursor-pointer text-base"
            >
              <FiCreditCard /> Authorize Secure Payment
            </button>
          </div>
        ) : (
          /* Processing/Verifying States */
          <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h4 className="font-bold text-text-dark text-base">
                {step === 'processing' ? 'Processing Card Auth...' : 'Verifying Transaction with Gateway...'}
              </h4>
              <p className="text-xs text-text-medium mt-1">Please do not reload this page or close your browser.</p>
            </div>
          </div>
        )}

        {/* SSL Note */}
        <div className="flex justify-center items-center gap-1 text-[10px] text-text-medium border-t border-gray-50 pt-4 mt-2">
          <FiLock className="text-gray-400" />
          <span>Secured with Razorpay Gateway &bull; AES-256 Bit Encryption</span>
        </div>

      </div>

      <style>{`
        /* Credit Card styling */
        .credit-card {
          width: 100%;
          height: 180px;
          perspective: 1000px;
        }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .credit-card.flipped .card-inner {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 1.5rem;
          overflow: hidden;
        }
        .card-back {
          transform: rotateY(180deg);
        }

        /* Success Confetti Animation */
        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #22C55E;
          opacity: 0;
          animation: drop 3s infinite linear;
        }
        .confetti-piece.p-0 { left: 10%; background-color: #34d399; animation-delay: 0.2s; }
        .confetti-piece.p-1 { left: 25%; background-color: #fbbf24; animation-delay: 0.8s; }
        .confetti-piece.p-2 { left: 40%; background-color: #60a5fa; animation-delay: 1.4s; }
        .confetti-piece.p-3 { left: 55%; background-color: #f472b6; animation-delay: 0.5s; }
        .confetti-piece.p-4 { left: 75%; background-color: #22c55e; animation-delay: 1.1s; }
        .confetti-piece.p-5 { left: 90%; background-color: #a78bfa; animation-delay: 1.7s; }

        @keyframes drop {
          0% { top: -10px; opacity: 1; transform: rotate(0deg); }
          100% { top: 100%; opacity: 0; transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;
