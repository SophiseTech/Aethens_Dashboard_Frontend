import PropTypes from 'prop-types';
import { Button, message } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { useState } from 'react';
import paymentService from '@services/Payment';

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
    document.body.appendChild(script);
  });
}

function PayOnlineButton({ bill, onPaymentSuccess, loading = false }) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!bill || bill.status !== 'unpaid') return null;

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const order = await paymentService.createOrder(bill._id);
      const key = order.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!key) throw new Error('Razorpay key is not configured');

      await loadRazorpayCheckout();

      const checkout = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'School of Athens',
        description: `Invoice ${order.invoiceNo || ''}`.trim(),
        order_id: order.order_id,
        prefill: {
          name: order.studentName,
          email: order.email,
          contact: order.mobile,
        },
        theme: { color: '#059669' },
        handler: async (response) => {
          try {
            const transaction = await paymentService.verifyPayment(response);
            message.info('Payment received. Awaiting Razorpay confirmation.');
            onPaymentSuccess?.(transaction);
          } catch (error) {
            message.error(error.message || 'Payment verification failed');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            message.info('Payment cancelled');
          },
        },
      });

      checkout.on('payment.failed', (response) => {
        setIsProcessing(false);
        message.error(response.error?.description || 'Payment failed');
      });
      checkout.open();
    } catch (error) {
      setIsProcessing(false);
      message.error(error.message || 'Unable to start payment');
    }
  };

  return (
    <Button
      type="primary"
      size="large"
      icon={<CreditCardOutlined />}
      loading={loading || isProcessing}
      onClick={handlePayment}
      className="!bg-emerald-600 hover:!bg-emerald-500 !text-white !font-semibold !rounded-full shadow-md hover:shadow-lg !min-h-[44px] !px-6 transition-all duration-200 flex items-center gap-2"
    >
      Pay Online {bill.total ? `₹${Number(bill.total).toLocaleString('en-IN')}` : ''}
    </Button>
  );
}

PayOnlineButton.propTypes = {
  bill: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.string,
    total: PropTypes.number,
  }),
  onPaymentSuccess: PropTypes.func,
  loading: PropTypes.bool,
};

export default PayOnlineButton;
