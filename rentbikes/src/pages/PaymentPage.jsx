import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};
  const { user } = useAuth();

  const [totalCost, setTotalCost] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (booking && booking.fromDate && booking.toDate && booking.bikeId) {
      const fromDateTime = new Date(booking.fromDate);
      const toDateTime = new Date(booking.toDate);
      const diffMs = toDateTime.getTime() - fromDateTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      const calculatedCost = diffHours * booking.bikeId.rentalPricePerHour;
      setTotalCost(calculatedCost);
    }
  }, [booking]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setPaymentLoading(true);
    setPaymentError('');

    if (!user) {
      showToast('Please login to complete the booking.', 'info');
      navigate('/login', { state: { fromBooking: true } });
      return;
    }

    if (!booking || !booking._id) {
      showToast('Missing booking details. Please start the booking process again.', 'error');
      setPaymentLoading(false);
      return;
    }

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        setPaymentError('Razorpay SDK failed to load.');
        setPaymentLoading(false);
        showToast('Razorpay SDK failed to load.', 'error');
        return;
      }

      const finalTotalCost = Math.max(1, Number(totalCost));

      const orderResponse = await axios.post(
        'https://bike-rentalbooking-system-backend.onrender.com/api/payment/create-order',
        {
          amount: finalTotalCost,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const orderId = orderResponse.data.orderId;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(finalTotalCost * 100),
        currency: 'INR',
        name: 'Bike Rentals',
        description: `Rental for ${booking.bikeId.name}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const updateResponse = await axios.post(
              'https://bike-rentalbooking-system-backend.onrender.com/api/bookings/update-payment',
              {
                bookingId: booking._id,
                totalCost: finalTotalCost,
                paymentId: response.razorpay_payment_id,
              },
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              }
            );

            if (updateResponse.status === 200) {
              navigate('/bookings', {
                state: {
                  toastMessage: 'Payment successful! Your booking is confirmed.',
                  toastType: 'success'
                }
              });
            } else {
              showToast('Booking update failed after payment.', 'error');
            }

          } catch (error) {
            showToast('Failed to update booking. Please contact support.', 'error');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#3399FF' },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', (response) => {
        setPaymentError(`Payment failed: ${response.error.description}`);
        showToast('Payment failed. Please try again.', 'error');
      });
      rzp1.open();

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setPaymentError(`Error: ${errorMessage}`);
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!booking) {
    return <div className="text-center pt-24 p-4">Loading booking details...</div>;
  }

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: '' })}
      />
      <div className="container mx-auto pt-32 p-4 max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Confirm Your Booking</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>
          <div className="mb-4">
            <p className="text-gray-700"><strong>Bike:</strong> {booking.bikeId?.name || 'N/A'} ({booking.bikeId?.type || 'N/A'})</p>
            <p className="text-gray-700"><strong>From:</strong> {new Date(booking.fromDate).toLocaleString()}</p>
            <p className="text-gray-700"><strong>To:</strong> {new Date(booking.toDate).toLocaleString()}</p>
            <p className="text-gray-700"><strong>Hourly Rate:</strong> ₹{booking.bikeId?.rentalPricePerHour || 'N/A'} / hour</p>
            <p className="text-gray-700"><strong>Total Cost:</strong> <span className="text-blue-600 text-xl font-bold">₹{totalCost.toFixed(2)}</span></p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Payment</h2>
          {paymentError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{paymentError}</span>
            </div>
          )}
          <button
            onClick={handleRazorpayPayment}
            disabled={paymentLoading || totalCost <= 0 || !user}
            className={`w-full text-white font-bold py-3 px-4 rounded-full transition duration-300 ${
              paymentLoading || totalCost <= 0 || !user ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {paymentLoading ? 'Processing Payment...' : `Pay ₹${totalCost.toFixed(2)}`}
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;