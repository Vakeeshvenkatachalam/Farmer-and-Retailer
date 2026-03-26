import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [step, setStep] = useState('idle'); // idle | processing | verifying | success | error
  const [errorMsg, setErrorMsg] = useState('');

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
      // Step 1: Create Razorpay Order
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
        await new Promise((r) => setTimeout(r, 1800));

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
        setTimeout(() => navigate('/retailer/orders'), 2800);
      };

      // Use mock if no real keys
      if (!orderData.keyId || orderData.keyId === 'YOUR_RAZORPAY_KEY_ID') {
        await new Promise((r) => setTimeout(r, 1200));
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
            setTimeout(() => navigate('/retailer/orders'), 2800);
          } else {
            setStep('error');
            setErrorMsg('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: 'Retailer', email: 'retailer@example.com', contact: '9999999999' },
        theme: { color: '#7c4dff' },
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

  return (
    <div style={styles.page}>
      {/* Background shimmer blobs */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>🌾</span>
            <span style={styles.logoText}>FarmConnect Pay</span>
          </div>
          <button style={styles.closeBtn} onClick={() => navigate('/retailer/orders')}>✕</button>
        </div>

        {/* Order Summary */}
        {loadingOrder ? (
          <div style={styles.loadingBlock}>
            <div style={styles.spinnerSmall}></div>
            <p style={{ color: '#94a3b8' }}>Loading order details...</p>
          </div>
        ) : (
          <div style={styles.orderSummary}>
            <p style={styles.summaryLabel}>Order Reference</p>
            <p style={styles.orderId}>#{orderId}</p>

            {product && (
              <div style={styles.productCard}>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.productName} style={styles.productImg} />
                )}
                <div>
                  <p style={styles.productName}>{product.productName}</p>
                  <p style={styles.productMeta}>{product.category} • {orderInfo?.quantity} kg</p>
                </div>
              </div>
            )}

            <div style={styles.divider}></div>

            <div style={styles.amountRow}>
              <span style={styles.amountLabel}>Total Amount</span>
              <span style={styles.amount}>₹{orderInfo?.totalPrice || '—'}</span>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {step !== 'idle' && (
          <div style={styles.stepsContainer}>
            <Step label="Initializing" active={step === 'processing'} done={['verifying','success'].includes(step)} />
            <div style={styles.stepsConnector}></div>
            <Step label="Verifying" active={step === 'verifying'} done={step === 'success'} />
            <div style={styles.stepsConnector}></div>
            <Step label="Complete" active={false} done={step === 'success'} />
          </div>
        )}

        {/* Success State */}
        {step === 'success' && (
          <div style={styles.successBlock}>
            <div style={styles.successCircle}>✓</div>
            <p style={styles.successTitle}>Payment Successful!</p>
            <p style={styles.successSub}>Redirecting to your orders...</p>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div style={styles.errorBlock}>
            <p style={{ color: '#f87171', fontSize: '0.9rem' }}>⚠️ {errorMsg}</p>
          </div>
        )}

        {/* CTA */}
        {step === 'idle' || step === 'error' ? (
          <button
            style={{
              ...styles.payBtn,
              ...(step === 'error' ? styles.payBtnRetry : {}),
            }}
            onClick={simulatePayment}
          >
            {step === 'error' ? '🔄 Retry Payment' : '💳 Proceed to Pay'}
          </button>
        ) : step === 'processing' || step === 'verifying' ? (
          <button style={{ ...styles.payBtn, ...styles.payBtnDisabled }} disabled>
            <span style={styles.btnSpinner}></span>
            {step === 'processing' ? 'Initializing Secure Payment...' : 'Verifying Transaction...'}
          </button>
        ) : null}

        <p style={styles.secureNote}>🔒 Secured by Razorpay · 256-bit SSL Encryption</p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blobPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const Step = ({ label, active, done }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.8rem', fontWeight: 700,
      background: done ? 'linear-gradient(135deg,#10b981,#34d399)' :
                  active ? 'linear-gradient(135deg,#7c4dff,#00e5ff)' : 'rgba(255,255,255,0.08)',
      color: (done || active) ? '#fff' : '#475569',
      boxShadow: active ? '0 0 14px rgba(124,77,255,0.6)' : 'none',
      transition: 'all 0.4s ease',
    }}>
      {done ? '✓' : active ? <span style={{ animation: 'spin 1s linear infinite', display:'inline-block' }}>⟳</span> : '○'}
    </div>
    <span style={{ fontSize: '0.68rem', color: done ? '#34d399' : active ? '#a78bfa' : '#475569' }}>{label}</span>
  </div>
);

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  blob1: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,77,255,0.3) 0%, transparent 70%)',
    top: '-100px', left: '-100px',
    animation: 'blobPulse 6s ease-in-out infinite',
  },
  blob2: {
    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,229,255,0.2) 0%, transparent 70%)',
    bottom: '-80px', right: '-60px',
    animation: 'blobPulse 8s ease-in-out infinite reverse',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    background: 'rgba(15,20,40,0.85)',
    backdropFilter: 'blur(24px)',
    borderRadius: 24,
    border: '1px solid rgba(124,77,255,0.25)',
    padding: '32px 28px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 28,
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { fontSize: '1.6rem' },
  logoText: {
    fontSize: '1.1rem', fontWeight: 700,
    background: 'linear-gradient(135deg, #7c4dff, #00e5ff)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#94a3b8', borderRadius: 8, padding: '4px 10px',
    cursor: 'pointer', fontSize: '0.9rem',
    transition: 'background 0.2s',
  },
  loadingBlock: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0',
  },
  spinnerSmall: {
    width: 28, height: 28,
    border: '3px solid rgba(124,77,255,0.2)',
    borderTopColor: '#7c4dff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  orderSummary: { marginBottom: 24 },
  summaryLabel: { color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' },
  orderId: { color: '#e2e8f0', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 18px', fontFamily: 'monospace' },
  productCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(255,255,255,0.04)', borderRadius: 12,
    padding: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 18,
  },
  productImg: { width: 52, height: 52, borderRadius: 8, objectFit: 'cover' },
  productName: { color: '#e2e8f0', fontWeight: 600, margin: '0 0 4px', fontSize: '0.95rem' },
  productMeta: { color: '#64748b', fontSize: '0.8rem', margin: 0 },
  divider: { height: 1, background: 'rgba(255,255,255,0.07)', margin: '18px 0' },
  amountRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  amountLabel: { color: '#94a3b8', fontSize: '0.9rem' },
  amount: {
    fontSize: '1.8rem', fontWeight: 800,
    background: 'linear-gradient(135deg, #34d399, #10b981)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  stepsContainer: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 0, marginBottom: 20,
  },
  stepsConnector: {
    flex: 1, height: 2,
    background: 'rgba(255,255,255,0.08)',
    margin: '0 8px 20px',
  },
  successBlock: {
    textAlign: 'center', padding: '16px 0 24px',
  },
  successCircle: {
    width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
    background: 'linear-gradient(135deg, #10b981, #34d399)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem', color: '#fff',
    animation: 'successPop 0.6s ease',
    boxShadow: '0 0 30px rgba(52,211,153,0.4)',
  },
  successTitle: { color: '#34d399', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' },
  successSub: { color: '#64748b', fontSize: '0.85rem', margin: 0 },
  errorBlock: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 10, padding: '12px 16px', marginBottom: 16,
  },
  payBtn: {
    width: '100%', padding: '14px', borderRadius: 12,
    background: 'linear-gradient(135deg, #7c4dff, #5b21b6)',
    color: '#fff', fontWeight: 700, fontSize: '1rem',
    border: 'none', cursor: 'pointer', marginBottom: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'transform 0.15s, opacity 0.2s',
    boxShadow: '0 8px 24px rgba(124,77,255,0.4)',
  },
  payBtnRetry: { background: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  payBtnDisabled: {
    opacity: 0.7, cursor: 'not-allowed',
    background: 'rgba(124,77,255,0.3)',
    boxShadow: 'none',
  },
  btnSpinner: {
    width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  secureNote: {
    textAlign: 'center', color: '#475569', fontSize: '0.72rem', margin: 0,
  },
};

export default PaymentPage;
